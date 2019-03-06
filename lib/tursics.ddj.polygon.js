/* tursics.ddj.polygon.js */
/* version 0.2 */

/*jslint browser: true*/
/*global L,console*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.polygon = {

		// ---------------------------------------------------------------------

		settings: {
			onStyle: function (data, style) {
				return style;
			},
			onMarkerStyle: function (data, style) {
				return style;
			}
		},

		// ---------------------------------------------------------------------

		store: {
			versionLeaflet: 0
		},

		// ---------------------------------------------------------------------

		init: function (settings) {
			if ((typeof L === 'undefined') || (L === null)) {
				console.error('Error: Please include leaflet.js in your html file.');
				return;
			}

			ddj.polygon.store.versionLeaflet = parseInt(L.version.split('.')[0], 10);

			if (0 === ddj.polygon.store.versionLeaflet) {
				console.error('Error: Please include leaflet.js version 1 or above');
				return;
			}

			var key;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.polygon.settings.hasOwnProperty(key)) {
						ddj.polygon.settings[key] = settings[key];
					}
				}
			}

			ddj.polygon.update();
		},

		// ---------------------------------------------------------------------

		update: function () {
			if (ddj.getData().length === 0) {
				return;
			}

			var val = ddj.getData()[0],
				style = {
					color: '#1f78b4',
					fillColor: '#1f78b4',
					fillOpacity: 0.5,
					weight: 1
				},
				markerStyle = {
					radius: 5,
					fillColor: "#1f78b4",
					fillOpacity: 0.5,
					weight: 1,
					opacity: 1
				};

			if (val.geometry && val.properties && (val.geometry.type === 'Polygon')) {
				L.geoJSON(ddj.getData(), {
					style: function (data) {
						if (ddj.polygon.settings.onStyle) {
							return ddj.polygon.settings.onStyle(data.properties, style);
						}
						return style;
					},
					pointToLayer: function (data, latlng) {
						var applyStyle = markerStyle;
						if (ddj.polygon.settings.onMarkerStyle) {
							applyStyle = ddj.polygon.settings.onMarkerStyle(data, applyStyle);
						}

						return L.circleMarker(latlng, applyStyle);
					},
					onEachFeature: function (feature, layer) {
						layer.on({
							click: function (e) {
								console.log(e);
							}
						});
						layer.on('mouseover', function (e) {
							console.log(e);
						});
					}
//					filter: function (feature, layer) {
//						return true;
//					}
				})
				.addTo(ddj.getMap());
			}
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
