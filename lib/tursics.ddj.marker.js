/* tursics.ddj.marker.js */
/* version 0.2 */

/*jslint browser: true*/
/*global L,console*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.marker = {

		// ---------------------------------------------------------------------

		settings: {
			onAdd: function () {
				return true;
			},
			onMouseOver: null,
			onMouseOut: null,
			onClick: null
		},

		// ---------------------------------------------------------------------

		store: {
			layerGroup: null
		},

		// ---------------------------------------------------------------------

		init: function (settings) {
			if (null !== ddj.marker.store.layerGroup) {
				return;
			}
			if ((typeof L === 'undefined') || (L === null)) {
				console.error('Error: Please include leaflet.js in your html file.');
				return;
			}

			var key;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.marker.settings.hasOwnProperty(key)) {
						ddj.marker.settings[key] = settings[key];
					}
				}
			}

			ddj.marker.update();
		},

		// ---------------------------------------------------------------------

		fixGeometryData: function (val) {
			if (val.geometry && val.properties) {
				var lat, lng, latMin, latMax, lngMin, lngMax, a, area, p, point;

				if (val.geometry.type === 'Polygon') {
					latMin = val.geometry.coordinates[0][0][1];
					latMax = val.geometry.coordinates[0][0][1];
					lngMin = val.geometry.coordinates[0][0][0];
					lngMax = val.geometry.coordinates[0][0][0];

					for (a = 0; a < val.geometry.coordinates.length; ++a) {
						area = val.geometry.coordinates[a];

						for (p = 0; p < area.length; ++p) {
							point = area[p];

							if (point[1] < latMin) {
								latMin = point[1];
							}
							if (point[1] > latMax) {
								latMax = point[1];
							}
							if (point[0] < lngMin) {
								lngMin = point[0];
							}
							if (point[0] > lngMax) {
								lngMax = point[0];
							}
						}
					}
					lat = (latMin + latMax) / 2;
					lng = (lngMin + lngMax) / 2;
				} else if (val.geometry.type === 'Point') {
					lat = val.geometry.coordinates[1];
					lng = val.geometry.coordinates[0];
				} else {
					console.log(val.geometry.type + ' not yet implemented');
				}

				val = val.properties;
				val.lat = val.lat || lat;
				val.lng = val.lng || lng;
			}

			return val;
		},

		// ---------------------------------------------------------------------

		update: function () {
			var key, val, obj, addObj;

			if (ddj.marker.store.layerGroup) {
				ddj.getMap().removeLayer(ddj.marker.store.layerGroup);
				ddj.marker.store.layerGroup = null;
			}

			ddj.marker.store.layerGroup = L.featureGroup([]);
			ddj.marker.store.layerGroup.addTo(ddj.getMap());
			ddj.marker.store.layerGroup.addEventListener('mouseover', function (evt) {
				if (ddj.marker.settings.onMouseOver) {
					ddj.marker.settings.onMouseOver([evt.latlng.lat, evt.latlng.lng], ddj.getData(evt.layer.options.data));
				}
			});
			ddj.marker.store.layerGroup.addEventListener('mouseout', function (evt) {
				if (ddj.marker.settings.onMouseOut) {
					ddj.marker.settings.onMouseOut([evt.latlng.lat, evt.latlng.lng], ddj.getData(evt.layer.options.data));
				}
			});
			ddj.marker.store.layerGroup.addEventListener('click', function (evt) {
				if (ddj.marker.settings.onClick) {
					ddj.marker.settings.onClick([evt.latlng.lat, evt.latlng.lng], ddj.getData(evt.layer.options.data));
				}
			});

			for (key = 0; key < ddj.getData().length; ++key) {
				val = ddj.getData(key);
				val = ddj.marker.fixGeometryData(val);

				if ((typeof val.lat !== 'undefined') && (typeof val.lng !== 'undefined')) {
					obj = {
						index: key,
						lat: parseFloat(val.lat),
						lng: parseFloat(val.lng),
						color: 'blue',
						opacity: 1,
						clickable: 1,
						iconPrefix: 'fa',
						iconFace: 'fa-dot-circle-o'
					};
					addObj = ddj.marker.settings.onAdd(obj, val);

					if (addObj !== false) {
						ddj.marker.store.layerGroup.addLayer(L.marker([obj.lat, obj.lng], {
							data: obj.index,
							icon: L.AwesomeMarkers.icon({
								prefix: obj.iconPrefix,
								icon: obj.iconFace,
								markerColor: obj.color
							}),
							opacity: obj.opacity,
							clickable: obj.clickable
						}));
					}
				}
			}
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
