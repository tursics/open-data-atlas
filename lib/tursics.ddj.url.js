/* tursics.ddj.url.js */
/* version 0.2 */

/*jslint browser: true*/
/*global document, window*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.url = {

		// ---------------------------------------------------------------------

		settings: {
			onInit: function () {
			},
			onLinkClicked: function () {
			},
			onKeyValueLinkClicked: function () {
			}
		},

		// ---------------------------------------------------------------------

		store: {
		},

		// ---------------------------------------------------------------------

		init: function (settings) {
			function getParent(tag, elem) {
				while (elem) {
					if ((elem.nodeName || elem.tagName).toLowerCase() === tag.toLowerCase()) {
						return elem;
					}
					elem = elem.paremtNode;
				}
				return null;
			}

			function onLinkClicked(e) {
				var elem = getParent('a', e.target || e.srcElement), key = null, value = null;
				if (elem) {
					key = elem.getAttribute('data-key');
					value = elem.getAttribute('data-value');
				}

				if ((key !== null) && (value !== null) && ddj.url.settings.onKeyValueLinkClicked) {
					return ddj.url.settings.onKeyValueLinkClicked(key, value);
				}

				return true;
			}
			ddj.url.settings.onLinkClicked = onLinkClicked;

			var key, queries, params = {}, i, split;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.url.settings.hasOwnProperty(key)) {
						ddj.url.settings[key] = settings[key];
					}
				}
			}

			this.initEvents();

			queries = window.location.search.replace(/^\?/, '').split('&');
			for (i = 0; i < queries.length; ++i) {
				split = queries[i].split('=');
				params[split[0]] = split[1];
			}

			if (ddj.url.settings.onInit) {
				ddj.url.settings.onInit(params);
			}
		},

		// ---------------------------------------------------------------------

		initEvents: function () {
			document.body.onclick = function (e) {
				e = e || {};

				if (ddj.url.settings.onLinkClicked) {
					if (false === ddj.url.settings.onLinkClicked(e)) {
						e.preventDefault();
					}
				}
			};
		},

		// ---------------------------------------------------------------------

		replace: function (obj) {
//			history.replaceState( {}, '', url);
			console.log(obj);
		},

		// ---------------------------------------------------------------------

		push: function (obj) {
//			history.pushState( {}, '', url);
			console.log(obj);
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
