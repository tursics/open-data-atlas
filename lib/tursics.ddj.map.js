/* tursics.ddj.map.js */
/* version 0.1 */

/*jslint browser: true*/
/*global L,console*/

// -----------------------------------------------------------------------------

String.prototype.startsWith = String.prototype.startsWith || function (prefix) {
	'use strict';

	return this.indexOf(prefix) === 0;
};

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.map = {

		// ---------------------------------------------------------------------

		settings: {
			mapboxId: 'tursics.l7ad5ee8',
			mapboxToken: 'pk.eyJ1IjoidHVyc2ljcyIsImEiOiI1UWlEY3RNIn0.U9sg8F_23xWXLn4QdfZeqg',
			centerLat: 52.518413,
			centerLng: 13.408368,
			zoom: 13,
			onFocusOnce: null
		},

		// ---------------------------------------------------------------------

		store: {
		},

		// ---------------------------------------------------------------------

		init: function (elementName, settings) {
			if (null !== ddj.getMap()) {
				return;
			}
			if ((typeof L === 'undefined') || (L === null)) {
				console.error('Error: Please include leaflet.js in your html file.');
				return;
			}

			var key, mapboxTiles;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.map.settings.hasOwnProperty(key)) {
						ddj.map.settings[key] = settings[key];
					}
				}
			}

			mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/' + ddj.map.settings.mapboxId + '/{z}/{x}/{y}.png?access_token=' + ddj.map.settings.mapboxToken, {
				attribution: '<a href="http://www.openstreetmap.org" target="_blank">OpenStreetMap-Mitwirkende</a>, <a href="https://www.mapbox.com" target="_blank">Mapbox</a>'
			});

			ddj.setMapDOMName(elementName);
			ddj.setMap(L.map(elementName, {zoomControl: false, scrollWheelZoom: true})
				.addLayer(mapboxTiles)
				.setView([ddj.map.settings.centerLat, ddj.map.settings.centerLng], ddj.map.settings.zoom));

			ddj.getMap().addControl(L.control.zoom({ position: 'bottomright'}));
			ddj.getMap().once('focus', function () {
				if (ddj.map.settings.onFocusOnce) {
					ddj.map.settings.onFocusOnce();
				}
			});
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
