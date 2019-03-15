/* tursics.ddj.js */
/* version 0.2 */

/*jslint browser: true*/
/*global */

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

	ddj.store = {
		map: null,
		mapDOMelementID: '',
		userData: null
	};

	// -------------------------------------------------------------------------

	ddj.init = function (userData) {
		ddj.store.userData = userData;

		// use geojson file
		if (userData && userData.type && (userData.type === 'FeatureCollection') && userData.features) {
			ddj.store.userData = userData.features;
		}
	};

	// -------------------------------------------------------------------------

	ddj.getMap = function () {
		return ddj.store.map;
	};

	// -------------------------------------------------------------------------

	ddj.setMap = function (map) {
		ddj.store.map = map;
	};

	// -------------------------------------------------------------------------

	ddj.getMapDOMName = function () {
		return ddj.store.mapDOMelementID;
	};

	// -------------------------------------------------------------------------

	ddj.setMapDOMName = function (name) {
		ddj.store.mapDOMelementID = name;
	};

	// -------------------------------------------------------------------------

	ddj.getRowData = function (key) {
		if (typeof key === 'undefined') {
			return ddj.store.userData;
		}
		if (key === null) {
			return ddj.store.userData;
		}

		return ddj.store.userData[key];
	};

	// -------------------------------------------------------------------------

	ddj.getData = function (key) {
		var data = ddj.getRowData(key);

		// use geojson file
		if (data && data.geometry && data.properties) {
			data = data.properties;
		}

		return data;
	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
