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

			var val = ddj.getData()[0];
			if (val.geometry && val.properties && (val.geometry.type === 'Polygon')) {
				L.geoJSON(ddj.getData()).addTo(ddj.getMap());
			}
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
