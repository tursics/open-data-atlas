/* tursics.ddj.search.js */
/* version 0.1 */

/*jslint browser: true*/
/*global $*/

// -----------------------------------------------------------------------------

var ddj = ddj || {};

// -----------------------------------------------------------------------------

(function () {

	'use strict';

	// -------------------------------------------------------------------------

	ddj.search = {

		// ---------------------------------------------------------------------

		settings: {
			htmlDOMelementID: 'autocomplete',
			onAdd: function () {
				return true;
			},
			onClick: null,
			onFocus: null,
			onFormat: null,
			showNoSuggestion: true,
			titleNoSuggestion: '<i class="fa fa-info-circle" aria-hidden="true"></i> Geben sie bitte einen Suchbegriff ein'
		},

		// ---------------------------------------------------------------------

		store: {
			objects: []
		},

		// ---------------------------------------------------------------------

		init: function (settings) {
			if (0 !== ddj.search.store.objects.length) {
				return;
			}

			var key;

			if ((settings !== null) && (typeof (settings) === 'object')) {
				for (key in settings) {
					if (settings.hasOwnProperty(key) && ddj.search.settings.hasOwnProperty(key)) {
						ddj.search.settings[key] = settings[key];
					}
				}
			}

			$('#' + ddj.search.settings.htmlDOMelementID).focus(function () {
				if (ddj.search.settings.onFocus) {
					ddj.search.settings.onFocus();
				}
			});

			ddj.search.update();
		},

		// ---------------------------------------------------------------------

		update: function () {
			var key, val, obj, addObj, dataLength = ddj.getData().length;

			ddj.search.store.objects = [];

			for (key = 0; key < dataLength; ++key) {
				val = ddj.getData(key);

				obj = {
					index: key,
					value: '',
					sortValue1: key,
					sortValue2: key
				};
				addObj = ddj.search.settings.onAdd(obj, val);

				if (addObj !== false) {
					ddj.search.store.objects.push(obj);
				}
			}

			ddj.search.store.objects.sort(function (a, b) {
				if (a.sortValue1 === b.sortValue1) {
					return a.sortValue2 > b.sortValue2 ? 1 : -1;
				}

				return a.sortValue1 > b.sortValue1 ? 1 : -1;
			});

			$('#' + ddj.search.settings.htmlDOMelementID).autocomplete({
				lookup: ddj.search.store.objects,
				onSelect: function (suggestion) {
					if (ddj.search.settings.onClick) {
						ddj.search.settings.onClick(ddj.getData(suggestion.index));
					}
				},
				formatResult: function (suggestion, currentValue) {
					if (ddj.search.settings.onFormat) {
						return ddj.search.settings.onFormat(suggestion, currentValue);
					} else {
						var str = '';

						str += '<div class="autocomplete-icon backblue"><i class="fa fa-dot-circle-o" aria-hidden="true"></i></div>';
						str += '<div style="line-height: 32px;">' + suggestion.value.replace(new RegExp(currentValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'gi'), '<strong>' + currentValue + '</strong>') + '</div>';
						return str;
					}
				},
				showNoSuggestionNotice: ddj.search.settings.showNoSuggestion,
				noSuggestionNotice: ddj.search.settings.titleNoSuggestion
			});
		}

		// ---------------------------------------------------------------------

	};

	// -------------------------------------------------------------------------

}());

// -----------------------------------------------------------------------------
