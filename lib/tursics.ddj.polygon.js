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

		settings: [],
		settingsTemplate: {
			onStyle: function (data, style) {
				return style;
			},
			onMarkerStyle: function (data, style) {
				return style;
			},
			onFilter: function (data) {
				return true;
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

			ddj.polygon.push(settings);
		},

		// ---------------------------------------------------------------------

		update: function () {
		},

		// ---------------------------------------------------------------------

		push: function (settings) {
			if (ddj.getRowData().length === 0) {
				return;
			}

			var key, val, layer = ddj.polygon.settings.length, style, markerStyle;

			ddj.polygon.settings.push({});

			for (key in ddj.polygon.settingsTemplate) {
				if (ddj.polygon.settingsTemplate.hasOwnProperty(key)) {
					ddj.polygon.settings[layer][key] = ddj.polygon.settingsTemplate[key];
				}
			}
			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.polygon.settingsTemplate.hasOwnProperty(key)) {
						ddj.polygon.settings[layer][key] = settings[key];
					}
				}
			}

			val = ddj.getRowData()[0];
			style = {
				color: '#1f78b4',
				fillColor: '#1f78b4',
				fillOpacity: 0.5,
				weight: 1
			};
			markerStyle = {
				radius: 5,
				fillColor: "#1f78b4",
				fillOpacity: 0.5,
				weight: 1,
				opacity: 1
			};

			if (val.geometry && val.properties && (val.geometry.type === 'Polygon')) {
				L.geoJSON(ddj.getRowData(), {
					style: function (data) {
						if (ddj.polygon.settings[layer].onStyle) {
							return ddj.polygon.settings[layer].onStyle(data.properties, style);
						}
						return style;
					},
					pointToLayer: function (data, latlng) {
						var applyStyle = markerStyle;
						if (ddj.polygon.settings[layer].onMarkerStyle) {
							applyStyle = ddj.polygon.settings[layer].onMarkerStyle(data, applyStyle);
						}

						return L.circleMarker(latlng, applyStyle);
					},
					onEachFeature: function (feature, layer) {
						layer.bindPopup(feature.properties.type);
/*						layer.on({
							click: function (e) {
								console.log(e);
							}
						});*/
/*						layer.on('mouseover', function (e) {
							console.log(e);
						});*/
						layer.on({
							mouseover: function (e) {
								console.log(e);
							},
							mouseout: function (e) {
								console.log(e);
							}
						});
					},
					filter: function (feature) {
						if (ddj.polygon.settings[layer].onFilter) {
							return ddj.polygon.settings[layer].onFilter(feature.properties);
						}
						return true;
					}
				}).bindPopup(function (layer) {
					console.log(layer);
					return layer.feature.properties.description;
				}).addTo(ddj.getMap());
			}
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
