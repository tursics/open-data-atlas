/* open data atlas - JavaScript file */

/*jslint browser: true*/
/*global $,L,ddj*/

var layerPopup = null;

var settings = {
	filterCountry: 'DE',
	filterLevel: 'all',
	dataset: 'portals',
//	filterPage: '#popupData',
	initZoom: 6,
	initLat: 52.516,
	initLng: 13.4795
};

// -----------------------------------------------------------------------------

function formatPopulation(population) {
	'use strict';

	var str = population.toString();
	if (str.length > 3) {
		str = str.substr(0, str.length - 3) + '.' + str.substr(str.length - 3);
	}
	if (str.length > 7) {
		str = str.substr(0, str.length - 7) + '.' + str.substr(str.length - 7);
	}
	return str;
}

// -----------------------------------------------------------------------------

function mapAction() {
	'use strict';
}

// -----------------------------------------------------------------------------

var ControlInfo = L.Control.extend({
	options: {
		position: 'bottomright'
	},

	onAdd: function () {
		'use strict';

		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

		container.innerHTML = '<a style="font-size:1.2em" href="#popupShare" title="Teilen" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-share-alt" aria-hidden="true"></i></a>';
		container.innerHTML += '<a style="font-size:1.2em" href="#popupInfo" title="Info" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-info" aria-hidden="true"></i></a>';
		container.innerHTML += '<a style="font-size:1.2em" href="#popupAuthor" title="Autor" data-rel="popup" data-position-to="window" data-transition="pop"><i class="fa fa-envelope" aria-hidden="true"></i></a>';

		return container;
	}
});

// -----------------------------------------------------------------------------

function getIDfromTitle(country, title) {
	'use strict';

	var id = title.toLowerCase();

	id = id.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/\.+/g, '-');
	id = id.replace(/\(+/g, '').replace(/\)+/g, '');
	id = id.replace(/ä+/g, 'ae').replace(/ö+/g, 'oe').replace(/ü+/g, 'ue').replace(/ß+/g, 'ss');

	id = id.substr(0, 29);
	id = country + '-' + id;

	return id;
}

// -----------------------------------------------------------------------------

function enrichMissingData(country, data) {
	'use strict';

	var f, feature, id;

	for (f = 0; f < data.features.length; ++f) {
		feature = data.features[f];
		feature.properties.id = getIDfromTitle(country, feature.properties.title);
	}
	return data;
}

// -----------------------------------------------------------------------------

function getTerritorialList(data) {
	'use strict';

	var str = '', i, l, item, level, allData = ddj.getData();

	if (typeof data.territorial !== 'undefined') {
		str += '<div style="border-bottom:1px solid white;padding-bottom:0.5em;margin-bottom:0.5em;">';
		item = data.territorial;
		level = [];

		if (item) {
			if (item.length >= 2) {
				level.push(item.substr(0, 2)); // state
			}
			if (item.length >= 3) {
				level.push(item.substr(0, 3)); // governorate
			}
			if (item.length >= 5) {
				level.push(item.substr(0, 5)); // county
			}
			if (item.length >= 9) {
				level.push(item.substr(0, 9)); // union
			}
			if (item.length >= 12) {
				level.push(item.substr(0, 12)); // municipal
			}
		}

		// Germany is 0 or '0'
		if (data.territorial != 0) {
			str += '<i class="fa fa-chevron-right"></i> <a href="" data-key="id" data-value="' + 'foo' + '">Deutschland</a><br>';
		}

		for (l = 0; l < level.length; ++l) {
			if (data.territorial !== level[l]) {
				for (i = 0; i < allData.length; ++i) {
					if (allData[i].properties && allData[i].properties.territorial) {
						if (level[l] === allData[i].properties.territorial) {
							str += '<i class="fa fa-chevron-right"></i> ';
							str += '<a href="" data-key="id" data-value="' + allData[i].properties.id + '">';
							str += allData[i].properties.title;
							str += '</a><br>';
							break;
						}
					}
				}
			}
//			if (i >= allData.length) {
//				str += '<i class="fa fa-map-marker"></i> ' + level[ l] + '<br>';
//			}
		}
//		str += '<i class="fa fa-map-marker"></i> ' + allData['nuts'] + '<br>';
		str += '</div>';
	}

	return str;
}

// -----------------------------------------------------------------------------

function getPopupContent(data) {
	'use strict';

	try {
		var str, color = '#fff', background = '#1f78b4';

		str = '<div style="font-size:1.25em;background:' + background + ';color:' + color + '">';
		str += '<div style="padding-bottom:0.5em;margin-bottom:0.5em;">';
		str += data.title;
		str += '</div>';
		str += '<img src="img/' + data.id + '.svg">';
		str += '</div>';

		return str;
	} catch (e) {
		return e.message;
	}
}
// -----------------------------------------------------------------------------

function highlightMapItem(data) {
	'use strict';

	function setText(key, txt) {
		var item = $('#rec' + key);

//		if (item.parent().hasClass('number')) {
//			txt = formatNumber(txt);
//		} else if (item.parent().hasClass('boolean')) {
//			txt = (txt === 1 ? 'ja' : 'nein');
//		}

		item.text(txt);
	}

	mapAction();

	var key, now = new Date(), days = '...';

	for (key in data) {
		if (data.hasOwnProperty(key)) {
			setText(key, data[key]);
		}
	}

	setText('detype', data.type.replace('city', 'Stadt').replace('state', 'Bundesland').replace('district', 'Landkreis').replace('country', 'Staat').replace('other', 'Datenbereitsteller').replace('+', ' und ') || '');
	if ((data.population === 0) || (data.population === null)) {
		setText('population', '');
	} else {
		setText('population', formatPopulation(data.population) + ' Einwohner');
	}
	$('#recterritorialList').html(getTerritorialList(data));

	if (data.begin !== '') {
		days = (now - new Date(data.begin)) / 24 / 60 / 60 / 1000;
		days = parseInt(days, 10);
	}
	setText('days', days);

	$('#itemImage').attr('src', 'img/' + data.id + '.svg');

	$('#reclinkPortal').html(data.url === '' ? '' : '<a href="' + data.url + '" target="_blank"><i class="fa fa-info-circle" aria-hidden="true"></i> URL</a>');
	$('#reclinkMail').html(data.mail === '' ? '' : '<a href="mailto:' + data.mail + '"><i class="fa fa-info-circle" aria-hidden="true"></i> URL</a>');
	$('#reclinkAPI').html(data.endpoint === '' ? '' : '<a href="' + data.endpoint + '" target="_blank"><i class="fa fa-info-circle" aria-hidden="true"></i> URL</a>');

	$('#receiptBox').css('display', 'block');
}

// -----------------------------------------------------------------------------

function selectMapItem(coordinates, data, icon, offsetX, offsetY) {
	'use strict';

	var options = {
		closeButton: false,
		offset: L.point(offsetX, offsetY),
		className: 'mapPopup'
	};

	layerPopup = L.popup(options)
		.setLatLng(coordinates)
		.setContent(getPopupContent(data))
		.openOn(ddj.getMap());
}

// -----------------------------------------------------------------------------

function deselectMapItem() {
	'use strict';

	if (layerPopup && ddj.getMap()) {
		ddj.getMap().closePopup(layerPopup);
		layerPopup = null;
    }
}

// -----------------------------------------------------------------------------

$(document).on('ready', function () {
//$(document).on("pageshow", "#pageMap", function () {
	'use strict';

	function updateEmbedURI() {
		var size = $('#selectEmbedSize').val().split('x'),
			x = size[0],
			y = size[1],
			html = '<iframe src="https://tursics.github.io/schule-quereinsteiger/" width="' + x + '" height="' + y + '" frameborder="0" style="border:0" allowfullscreen></iframe>';

		$('#inputEmbedURI').val(html);
		if (-1 === $('#embedMap iframe')[0].outerHTML.indexOf('width="' + x + '"')) {
			$('#embedMap iframe')[0].outerHTML = html.replace('.html"', '.html?foo=' + (new Date().getTime()) + '"');
			$('#embedMap input').focus().select();
		}
	}

	ddj.url.init({
		onInit: function (params) {
/*			if (typeof params.country !== 'undefined') {
				settings.filterCountry = params.country;
			}
			if (typeof params.level !== 'undefined') {
				settings.filterLevel = params.level;
			}
			if (typeof params.dataset !== 'undefined') {
				settings.dataset = params.dataset;
			}*/

			if (typeof params.zoom !== 'undefined') {
				settings.initZoom = params.zoom;
			}
			if ((typeof params.lat !== 'undefined') && (typeof params.lng !== 'undefined')) {
				settings.initLat = params.lat;
				settings.initLng = params.lng;
			}
		},
		onKeyValueLinkClicked: function (key, value) {
			return false;
		}
	});

	// center the city hall
	ddj.map.init('mapContainer', {
		mapboxId: 'tursics.l7ad5ee8',
		mapboxToken: 'pk.eyJ1IjoidHVyc2ljcyIsImEiOiI1UWlEY3RNIn0.U9sg8F_23xWXLn4QdfZeqg',
		centerLat: settings.initLat,
		centerLng: settings.initLng,
		zoom: settings.initZoom,
		onFocusOnce: mapAction,
		onZoomed: function () {
			var center = ddj.getMap().getCenter();

			ddj.url.replace({
//				lat: parseInt(center.lat * 10000, 10) / 10000,
//				lng: parseInt(center.lng * 10000, 10) / 10000,
				zoom: ddj.getMap().getZoom()
			});
		},
		onMoved: function () {
			var center = ddj.getMap().getCenter();

			ddj.url.replace({
				lat: parseInt(center.lat * 10000, 10) / 10000,
				lng: parseInt(center.lng * 10000, 10) / 10000,
//				zoom: ddj.getMap().getZoom()
			});
		}
	});

	var country = 'de';
	var dataUrl = 'data/polygon-' + country + '.geojson';
	$.getJSON(dataUrl, function (data) {
		data = enrichMissingData(country, data);

		ddj.init(data);

		ddj.polygon.init({
			onStyle: function (data, style) {
				style.color = '#555';
				style.fillColor = '#fff';
				style.fillOpacity = 0.8;

				return style;
			},
			onMarkerStyle: function (data, style) {
//				style.fillColor = 'red';
				return style;
			},
			onFilter: function (data) {
				return data.type.indexOf('country') !== -1;
			}
		});
		ddj.polygon.push({
			onStyle: function (data, style) {
				style.color = '#fdbf6f';
				style.fillColor = '#fdbf6f';
				style.fillOpacity = 0.5;

				return style;
			},
			onFilter: function (data) {
				return (data.type.indexOf('country') === -1)
					&& (data.type.indexOf('state') !== -1);
			}
		});
		ddj.polygon.push({
			onStyle: function (data, style) {
				style.color = '#33a02c';
				style.fillColor = '#33a02c';
				style.fillOpacity = 0.5;

				return style;
			},
			onFilter: function (data) {
				return (data.type.indexOf('country') === -1)
					&& (data.type.indexOf('state') === -1)
					&& (data.type.indexOf('district') !== -1);
			}
		});
		ddj.polygon.push({
			onStyle: function (data, style) {
				style.color = '#1f78b4';
				style.fillColor = '#1f78b4';
				style.fillOpacity = 0.5;

				return style;
			},
			onFilter: function (data) {
				return (data.type.indexOf('country') === -1)
					&& (data.type.indexOf('state') === -1)
					&& (data.type.indexOf('district') === -1)
					&& (data.type.indexOf('city') !== -1);
			}
		});
		ddj.polygon.push({
			onStyle: function (data, style) {
				style.color = '#d252b9';
				style.fillColor = '#d252b9';
				style.fillOpacity = 0.5;

				return style;
			},
			onFilter: function (data) {
				return (data.type.indexOf('country') === -1)
					&& (data.type.indexOf('state') === -1)
					&& (data.type.indexOf('district') === -1)
					&& (data.type.indexOf('city') === -1);
			}
		});

		ddj.marker.init({
			onMouseOver: function (latlng, data) {
				selectMapItem(latlng, data, {
					options: {
						markerColor: 'red'
					}
				}, 91, -8);
			},
			onMouseOut: function (latlng, data) {
				deselectMapItem(data);
			},
			onClick: function (latlng, data) {
				highlightMapItem(data);
			}
		});

/*		ddj.search.init({
			showNoSuggestion: true,
			titleNoSuggestion: '<i class="fa fa-info-circle" aria-hidden="true"></i> Geben sie bitte den Namen einer Schule ein',
			onAdd: function (obj, value) {
//				var name = value.Schulname,
//					color = getColor(value),
//					schoolType = value.BSN.substr(2, 1);

				if ('' !== value.BSN) {
					name += ' (' + value.BSN + ')';
				}

				obj.sortValue1 = name;
				obj.sortValue2 = value.BSN;
				obj.data = value.BSN;
//				obj.color = color;
				obj.value = name;
				obj.desc = value.Schulart;

				return true;
//				return ('all' === settings.type) || (schoolType === settings.type);
			},
			onFocus: function () {
				mapAction();

				window.scrollTo(0, 0);
				document.body.scrollTop = 0;
				$('#pageMap').animate({
					scrollTop: parseInt(0, 10)
				}, 500);
			},
			onFormat: function (suggestion, currentValue) {
				var color = suggestion.color,
					icon = 'fa-building-o',
					str = '';

				str += '<div class="autocomplete-icon back' + color + '"><i class="fa ' + icon + '" aria-hidden="true"></i></div>';
				str += '<div>' + suggestion.value.replace(new RegExp(currentValue.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'gi'), '<strong>' + currentValue + '</strong>') + '</div>';
				str += '<div class="' + color + '">' + suggestion.desc + '</div>';
				return str;
			},
			onClick: function (data) {
				selectSuggestion(data.BSN);
			}
		});*/

//		initSocialMedia();
	});

///	ddj.getMap().addControl(new ControlInfo());

	$('#autocomplete').val('');

	// events for detail information
	$('#receipt .group').on('click', function () {
		$(this).toggleClass('groupClosed');
	});
	$('#receiptClose').on('click', function () {
		$('#receiptBox').css('display', 'none');
	});

/*	$('#searchBox .sample a:nth-child(1)').on('click', function () {
		$('#autocomplete').val('32. Schule (Grundschule) (11G32)');
		selectSuggestion('11G32');
	});
	$('#searchBox .sample a:nth-child(2)').on('click', function () {
		$('#autocomplete').val('Staatliche Ballettschule Berlin und Schule für Artistik (03B08)');
		selectSuggestion('03B08');
	});*/

	// events for filter
	$('#filterOpen').on('click', function () {
		$('#filterBox').css('display', 'block');
		$('#filterOpen').css('display', 'none');
	});
	$('#filterClose').on('click', function () {
		$('#filterBox').css('display', 'none');
		$('#filterOpen').css('display', 'inline-block');
	});

/*	$('#searchBox #cbRelative').on('click', function () {
		settings.relativeValues = $('#searchBox #cbRelative').is(':checked');
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #cbHotspot').on('click', function () {
		settings.showHotspots = $('#searchBox #cbHotspot').is(':checked');
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #selectDistrict').change(function () {
		settings.district = $('#searchBox #selectDistrict option:selected').val();
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #selectSchoolType').change(function () {
		settings.type = $('#searchBox #selectSchoolType option:selected').val();
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #selectYear').change(function () {
		settings.year = parseInt($('#searchBox #selectYear option:selected').val(), 10);
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #rangeMin').change(function () {
		settings.rangeMin = parseInt($('#searchBox #rangeMin').val(), 10);
		ddj.voronoi.update();
		ddj.marker.update();
	});
	$('#searchBox #rangeMax').change(function () {
		settings.rangeMax = parseInt($('#searchBox #rangeMax').val(), 10);
		ddj.voronoi.update();
		ddj.marker.update();
	});

	$("#popupShare").on('popupafteropen', function () {
		$('#shareLink input').focus().select();
	});
	$('#tabShareLink').on('click', function () {
		$('#popupShare').popup('reposition', 'positionTo: window');
		$('#shareLink input').focus().select();
	});
	$('#tabEmbedMap').on('click', function () {
		updateEmbedURI();
		$('#popupShare').popup('reposition', 'positionTo: window');
		$('#embedMap input').focus().select();
	});

	$('#selectEmbedSize').val('400x300').selectmenu('refresh');
	$('#selectEmbedSize').on('change', function () {
		updateEmbedURI();
		$('#popupShare').popup('reposition', 'positionTo: window');
	});
	*/
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

/*
	use http://www.convertcsv.com/csv-to-json.htm
*/
/*
var map = null;
var mapContainer = null;
var mapBubble = null;
var mapBubbles = null;

// -----------------------------------------------------------------------------

function nutsGetBasicIndex( nuts)
{
	for( var i = 0; i < dataBasics.length; ++i) {
		if( nuts == dataBasics[i].nuts) {
			return i;
		}
	}
	return -1;
}

// -----------------------------------------------------------------------------

function basicIndexGetDataIndex( id)
{
	var nuts = dataBasics[id].nuts;
	for( var idata = 0; idata < dataFirstnames.length; ++idata) {
		if( nuts == dataFirstnames[idata].nuts) {
			return idata;
		}
	}
	return -1;
}

// -----------------------------------------------------------------------------

function addMapMarkerPath( dataBasicId, colorStr, addLink)
{
	if( typeof dataBasics[dataBasicId]['path'] !== "undefined") {
		for( var p = 0; p < dataBasics[dataBasicId]['path'].length; ++p) {
			var path = dataBasics[dataBasicId]['path'][p];
			var strip = new nokia.maps.geo.Strip();

			for( var c = 0; c < path.length; c += 2) {
				strip.add({ lat: path[c], lng: path[c+1]});
			}

			var marker = new nokia.maps.map.Polygon( strip, {
				brush: {color: colorStr},
				pen: {lineWidth: 0},
				coordinate: new nokia.maps.geo.Coordinate( dataBasics[ dataBasicId]['lat'], dataBasics[ dataBasicId]['lon']),
				nr: (addLink ? dataBasicId : -1)
			});
			mapContainer.objects.add( marker);
		}
	}
}

// -----------------------------------------------------------------------------

function addMapMarker( dataBasicId, colorStr)
{
	if( 0 <= dataBasics[dataBasicId]['group'].indexOf( 'other')) {
		var marker = new nokia.maps.map.Circle([dataBasics[ dataBasicId]['lat'], dataBasics[ dataBasicId]['lon']], 4000, {
			brush: {color: colorStr+'a0'},
			pen: {lineWidth: 0},
			coordinate: new nokia.maps.geo.Coordinate( dataBasics[ dataBasicId]['lat'], dataBasics[ dataBasicId]['lon']),
			nr: dataBasicId
		});
		mapContainer.objects.add( marker);
	} else if( typeof dataBasics[dataBasicId]['path'] !== "undefined") {
		addMapMarkerPath( dataBasicId, colorStr+'a0', true);
	} else {
		var marker = new nokia.maps.map.StandardMarker([dataBasics[ dataBasicId]['lat'], dataBasics[ dataBasicId]['lon']], {
			brush: colorStr,
			nr: dataBasicId
		});
		mapContainer.objects.add( marker);
	}
}

// -----------------------------------------------------------------------------

var objectDefault = {
	getDataset: function() {
		var ret = [];
		return ret;
	},
	getListItem: function( nr) {
		return '<li>' + dataBasics[nr].name + '</li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '';
	},
	addMarker: function( vec) {
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectAllPortals = {
	getDataset: function() {
		var ret = [];

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( typeof dataBasics[i]['linkOGD'] !== "undefined") {
					ret[ ret.length] = i;
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-green"></i>' + dataBasics[nr].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			addMapMarker( id, cGreen);
		}
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectAllFirstnames = {
	getDataset: function() {
		var ret = [];

		for( var idata = 0; idata < dataFirstnames.length; ++idata) {
			var i = nutsGetBasicIndex( dataFirstnames[idata].nuts);
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				ret[ ret.length] = i;
			}
		}

		return ret;
	},
	getListItem: function( id) {
		var idata = basicIndexGetDataIndex( id);
		var marker = 'red';
		if( -1 == idata) {
		} else if( typeof dataFirstnames[idata]['status'] !== "undefined") {
			if( 'nodata' == dataFirstnames[idata]['status']) {
				marker = 'white';
			}
		} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
			marker = 'green';
		} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
			marker = 'yellow';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + id + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[id].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		var idataL = basicIndexGetDataIndex( left);
		var idataR = basicIndexGetDataIndex( right);
		var dataL = (-1 == idataL ? 0 : (typeof dataFirstnames[idataL]['linkOGData'] !== "undefined") ? 2 : ((typeof dataFirstnames[idataL]['linkWebData'] !== "undefined") ? 1 : 0));
		var dataR = (-1 == idataR ? 0 : (typeof dataFirstnames[idataR]['linkOGData'] !== "undefined") ? 2 : ((typeof dataFirstnames[idataR]['linkWebData'] !== "undefined") ? 1 : 0));

		if( dataL != dataR) {
			return (dataL > dataR) ? 1 : -1;
		}

		if( dataBasics[left].lat == dataBasics[right].lat) {
			return (dataBasics[left].lon < dataBasics[right].lon) ? 1 : -1;
		}

		return (dataBasics[left].lat < dataBasics[right].lat) ? 1 : -1;
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Keine Vornamen vorhanden<br>'
		     + '<i class="fa fa-map-marker marker-yellow"></i>Daten mit Vornamen erhältlich<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Open Data-Datensatz mit Vornamen<br>'
		     + '<i class="fa fa-map-marker marker-white"></i>Keine Geburten registriert<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cRed = '#f03b20';
		var cYellow = '#e1c64b';
		var cGreen = '#31a354';
		var cWhite = '#d0d0d0';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);
			var color = cRed;
			if( -1 == idata) {
			} else if( typeof dataFirstnames[idata]['status'] !== "undefined") {
				if( 'nodata' == dataFirstnames[idata]['status']) {
					color = cWhite;
				}
			} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
				color = cGreen;
			} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
				color = cYellow;
			}

			if((cRed == color) && (0 <= dataBasics[id].group.indexOf( 'state')) && (0 == dataBasics[id].nuts.indexOf( 'DE'))) {
				continue;
			}

			addMapMarker( id, color);
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartOpenData"></div>';
		if( 'DE' == filterCountry) {
			txt += '<div class="chart chart' + filterCountry + '" id="chartNames"></div>';
			txt += '<div class="chart chart' + filterCountry + '" id="chartNoNames"></div>';
			txt += '<div class="chart chart' + filterCountry + '" id="chartNone"></div>';
		}

		return txt;
	},
	createCharts: function( vec) {
		var cRed = '#f03b20',    cRedLight = '#fac4bc';
		var cYellow = '#e1c64b', cYellowLight = '#f6edc9';
		var cGreen = '#31a354',  cGreenLight = '#c1e3cb';
		var cWhite = '#d0d0d0',  cWhiteLight = '#f0f0f0';

		var maxCount = vec.length;
		var maxOpenData = 0;
		var maxNames = 0;
		var maxNoNames = 0;
		var maxNone = 0;
		var valOpenData = 0;
		var valNames = 0;
		var valNoNames = 0;
		var valNone = 0;
		var txtOpenData = '% ist<br>Open Data';
		var txtNames = '% hat<br>Vornamen';
		var txtNoNames = '% keine<br>Vornamen';
		var txtNone = '% keine<br>Geburten';
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);
			if( -1 == idata) {
				valNoNames += dataBasics[id]['population'];
			} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
				valOpenData += dataBasics[id]['population'];
			} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
				valNames += dataBasics[id]['population'];
			} else if(( typeof dataFirstnames[idata]['status'] !== "undefined") && ('nodata' == dataFirstnames[idata]['status'])) {
				valNone += dataBasics[id]['population'];
			} else {
				valNoNames += dataBasics[id]['population'];
			}
		}
		for( var i = 0; i < dataBasics.length; ++i) {
			if( dataBasics[i]['nuts'] == filterCountry) {
				maxOpenData = dataBasics[i]['population'];
			}
		}
		maxNames = maxOpenData;
		maxNoNames = maxOpenData;
		maxNone = maxOpenData;
		if( 0 == maxCount) {
			maxCount = 1;
		}
		var chartOpenData = Circles.create({
			id:'chartOpenData',value:valOpenData,maxValue:maxOpenData,
			colors:[cGreenLight,cGreen],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxOpenData * 100) < 10) {return '<span>'+Math.round( value / maxOpenData * 1000)/10+txtOpenData+'</span>';} else {return '<span>'+Math.round( value / maxOpenData * 100)+txtOpenData+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartNames = Circles.create({
			id:'chartNames',value:valNames,maxValue:maxNames,
			colors:[cYellowLight,cYellow],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxNames * 100) < 10) {return '<span>+ '+Math.round( value / maxNames * 1000)/10+txtNames+'</span>';} else {return '<span>+ '+Math.round( value / maxNames * 100)+txtNames+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartNoNames = Circles.create({
			id:'chartNoNames',value:valNoNames,maxValue:maxNoNames,
			colors:[cRedLight,cRed],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxNoNames * 100) < 10) {return '<span>'+Math.round( value / maxNoNames * 1000)/10+txtNoNames+'</span>';} else {return '<span>'+Math.round( value / maxNoNames * 100)+txtNoNames+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartNone = Circles.create({
			id:'chartNone',value:valNone,maxValue:maxNone,
			colors:[cWhiteLight,cWhite],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxNone * 100) < 10) {return '<span>'+Math.round( value / maxNone * 1000)/10+txtNone+'</span>';} else {return '<span>'+Math.round( value / maxNone * 100)+txtNone+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectSupremePortals = {
	getDataset: function() {
		var ret = [];
		var group = 'supreme';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					ret[ ret.length] = i;
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		var marker = 'red';
		if( typeof dataBasics[nr]['linkOGD'] !== "undefined") {
			marker = 'green';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[nr].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Hat kein Open Data Portal<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';
		var cRed = '#f03b20';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			addMapMarker( id, (typeof dataBasics[id]['linkOGD'] !== "undefined") ? cGreen : cRed);
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartCount"></div>';

		return txt;
	},
	createCharts: function( vec) {
		var maxCount = vec.length;
		var valCount = 0;
		var txtCount = '% der<br>Behörden';
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			if( typeof dataBasics[id]['linkOGD'] !== "undefined") {
				++valCount;
			}
		}
		if( 0 == maxCount) {
			maxCount = 1;
		}
		var chartCount = Circles.create({
			id:'chartCount',value:valCount,maxValue:maxCount,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxCount * 100) < 10) {return '<span>'+Math.round( value / maxCount * 1000)/10+txtCount+'</span>';} else {return '<span>'+Math.round( value / maxCount * 100)+txtCount+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectSupremeFirstnames = {
	getDataset: function() {
		var ret = [];
		return ret;
	},
	getListItem: function( id) {
		var idata = basicIndexGetDataIndex( id);
		var marker = 'red';
		return '<li><a href="#" onClick="clickOnDataItem(\'' + id + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[id].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '';
	},
	addMarker: function( vec) {
	},
	getCharts: function() {
		var txt = '';
		return txt;
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectNuts1Portals = {
	getDataset: function() {
		var ret = [];
		var group = 'state';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					ret[ ret.length] = i;
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		var marker = 'red';
		if( typeof dataBasics[nr]['linkOGD'] !== "undefined") {
			marker = 'green';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[nr].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Hat kein Open Data Portal<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';
		var cRed = '#f03b20';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			addMapMarker( id, (typeof dataBasics[id]['linkOGD'] !== "undefined") ? cGreen : cRed);
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartCount"></div>';
		txt += '<div class="chart chart' + filterCountry + '" id="chartPeople"></div>';

		return txt;
	},
	createCharts: function( vec) {
		var maxCount = vec.length;
		var maxPeople = 0;
		var valCount = 0;
		var valPeople = 0;
		var txtCount = '% der<br>Bundesländer';
		var txtPeople = '% der<br>Bevölkerung';
		if( 'CH' == filterCountry) {
			txtCount = '% der<br>Kantone';
		}
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			if( typeof dataBasics[id]['linkOGD'] !== "undefined") {
				++valCount;
				valPeople += dataBasics[id]['population'];
			}
		}
		for( var i = 0; i < dataBasics.length; ++i) {
			if( dataBasics[i]['nuts'] == filterCountry) {
				maxPeople = dataBasics[i]['population'];
			}
		}
		if( 0 == maxCount) {
			maxCount = 1;
		}
		var chartCount = Circles.create({
			id:'chartCount',value:valCount,maxValue:maxCount,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxCount * 100) < 10) {return '<span>'+Math.round( value / maxCount * 1000)/10+txtCount+'</span>';} else {return '<span>'+Math.round( value / maxCount * 100)+txtCount+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartPeople = Circles.create({
			id:'chartPeople',value:valPeople,maxValue:maxPeople,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxPeople * 100) < 10) {return '<span>'+Math.round( value / maxPeople * 1000)/10+txtPeople+'</span>';} else {return '<span>'+Math.round( value / maxPeople * 100)+txtPeople+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectNuts1Firstnames = {
	getDataset: function() {
		var ret = [];
		var group = 'state';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					ret[ ret.length] = i;
				}
			}
		}

		return ret;
	},
	getListItem: function( id) {
		var idata = basicIndexGetDataIndex( id);
		var marker = 'red';
		if( -1 == idata) {
		} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
			marker = 'green';
		} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
			marker = 'yellow';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + id + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[id].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].name > dataBasics[right].name) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Keine Vornamen vorhanden<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Open Data-Datensatz mit Vornamen<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cRed = '#f03b20';
		var cYellow = '#e1c64b';
		var cGreen = '#31a354';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);

			addMapMarker( id, (-1 == idata ? cRed : (typeof dataFirstnames[idata]['linkOGData'] !== "undefined") ? cGreen : ((typeof dataFirstnames[idata]['linkWebData'] !== "undefined") ? cYellow :cRed)));
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartCount"></div>';
		txt += '<div class="chart chart' + filterCountry + '" id="chartPeople"></div>';

		return txt;
	},
	createCharts: function( vec) {
		var maxCount = vec.length;
		var maxPeople = 0;
		var valCount = 0;
		var valPeople = 0;
		var txtCount = '% der<br>Bundesländer';
		var txtPeople = '% der<br>Bevölkerung';
		if( 'CH' == filterCountry) {
			txtCount = '% der<br>Kantone';
		}
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);
			if(( -1 != idata) && (typeof dataFirstnames[idata]['linkOGData'] !== "undefined")) {
				++valCount;
				valPeople += dataBasics[id]['population'];
			}
		}
		for( var i = 0; i < dataBasics.length; ++i) {
			if( dataBasics[i]['nuts'] == filterCountry) {
				maxPeople = dataBasics[i]['population'];
			}
		}
		if( 0 == maxCount) {
			maxCount = 1;
		}
		var chartCount = Circles.create({
			id:'chartCount',value:valCount,maxValue:maxCount,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxCount * 100) < 10) {return '<span>'+Math.round( value / maxCount * 1000)/10+txtCount+'</span>';} else {return '<span>'+Math.round( value / maxCount * 100)+txtCount+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartPeople = Circles.create({
			id:'chartPeople',value:valPeople,maxValue:maxPeople,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxPeople * 100) < 10) {return '<span>'+Math.round( value / maxPeople * 1000)/10+txtPeople+'</span>';} else {return '<span>'+Math.round( value / maxPeople * 100)+txtPeople+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectDistrictPortals = {
	getDataset: function() {
		var ret = [];
		var group = 'district';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( typeof dataBasics[i]['linkOGD'] !== "undefined") {
					if( 0 <= dataBasics[i].group.indexOf( group)) {
						ret[ ret.length] = i;
					}
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-green"></i>' + dataBasics[nr].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>'
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			addMapMarker( id, cGreen);
		}
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectDistrictFirstnames = {
	getDataset: function() {
		var ret = [];
		var group = 'district';

		for( var idata = 0; idata < dataFirstnames.length; ++idata) {
			var i = nutsGetBasicIndex( dataFirstnames[idata].nuts);
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					ret[ ret.length] = i;
				}
			}
		}

		return ret;
	},
	getListItem: function( id) {
		var idata = basicIndexGetDataIndex( id);
		var marker = 'red';
		if( -1 == idata) {
		} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
			marker = 'green';
		} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
			marker = 'yellow';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + id + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[id].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Keine Vornamen vorhanden<br>'
		     + '<i class="fa fa-map-marker marker-yellow"></i>Daten mit Vornamen erhältlich<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Open Data-Datensatz mit Vornamen<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cRed = '#f03b20';
		var cYellow = '#e1c64b';
		var cGreen = '#31a354';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);

			addMapMarker( id, -1 == idata ? cRed : (typeof dataFirstnames[idata]['linkOGData'] !== "undefined") ? cGreen : ((typeof dataFirstnames[idata]['linkWebData'] !== "undefined") ? cYellow :cRed));
		}
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectCityPortals = {
	getDataset: function() {
		var ret = [];
		var group = 'city';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					if( dataBasics[i].population >= 100000) {
						ret[ ret.length] = i;
					}
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		var marker = 'red';
		if( typeof dataBasics[nr]['linkOGD'] !== "undefined") {
			marker = 'green';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[nr].name + ' <span class="ui-li-count">' + formatPopulation( dataBasics[nr].population) + '</span></a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		var dataL = (typeof dataBasics[left]['linkOGD'] !== "undefined") ? 2 : 0;
		var dataR = (typeof dataBasics[right]['linkOGD'] !== "undefined") ? 2 : 0;

		if( dataL != dataR) {
			return (dataL > dataR) ? 1 : -1;
		}

		if( dataBasics[left].lat == dataBasics[right].lat) {
			return (dataBasics[left].lon < dataBasics[right].lon) ? 1 : -1;
		}

		return (dataBasics[left].lat < dataBasics[right].lat) ? 1 : -1;
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Hat kein Open Data Portal<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';
		var cRed = '#f03b20';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			addMapMarker( id, (typeof dataBasics[id]['linkOGD'] !== "undefined") ? cGreen : cRed);
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartCount"></div>';
		txt += '<div class="chart chart' + filterCountry + '" id="chartPeople"></div>';

		return txt;
	},
	createCharts: function( vec) {
		var maxCount = vec.length;
		var maxPeople = 0;
		var valCount = 0;
		var valPeople = 0;
		var txtCount = '% der<br>Großstädte';
		var txtPeople = '% der<br>Bevölkerung';
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			if( typeof dataBasics[id]['linkOGD'] !== "undefined") {
				++valCount;
				valPeople += dataBasics[id]['population'];
			}
		}
		for( var i = 0; i < dataBasics.length; ++i) {
			if( dataBasics[i]['nuts'] == filterCountry) {
				maxPeople = dataBasics[i]['population'];
			}
		}
		if( 0 == maxCount) {
			maxCount = 1;
		}
		var chartCount = Circles.create({
			id:'chartCount',value:valCount,maxValue:maxCount,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxCount * 100) < 10) {return '<span>'+Math.round( value / maxCount * 1000)/10+txtCount+'</span>';} else {return '<span>'+Math.round( value / maxCount * 100)+txtCount+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartPeople = Circles.create({
			id:'chartPeople',value:valPeople,maxValue:maxPeople,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxPeople * 100) < 10) {return '<span>'+Math.round( value / maxPeople * 1000)/10+txtPeople+'</span>';} else {return '<span>'+Math.round( value / maxPeople * 100)+txtPeople+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectCityFirstnames = {
	getDataset: function() {
		var ret = [];
		var group = 'city';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					if( dataBasics[i].population >= 100000) {
						ret[ ret.length] = i;
					}
				}
			}
		}

		return ret;
	},
	getListItem: function( id) {
		var idata = basicIndexGetDataIndex( id);
		var marker = 'red';
		if( -1 == idata) {
		} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
			marker = 'green';
		} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
			marker = 'yellow';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + id + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[id].name + ' <span class="ui-li-count">' + formatPopulation( dataBasics[id].population) + '</span></a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		var idataL = basicIndexGetDataIndex( left);
		var idataR = basicIndexGetDataIndex( right);
		var dataL = (-1 == idataL ? 0 : (typeof dataFirstnames[idataL]['linkOGData'] !== "undefined") ? 2 : ((typeof dataFirstnames[idataL]['linkWebData'] !== "undefined") ? 1 : 0));
		var dataR = (-1 == idataR ? 0 : (typeof dataFirstnames[idataR]['linkOGData'] !== "undefined") ? 2 : ((typeof dataFirstnames[idataR]['linkWebData'] !== "undefined") ? 1 : 0));

		if( dataL != dataR) {
			return (dataL > dataR) ? 1 : -1;
		}

		if( dataBasics[left].lat == dataBasics[right].lat) {
			return (dataBasics[left].lon < dataBasics[right].lon) ? 1 : -1;
		}

		return (dataBasics[left].lat < dataBasics[right].lat) ? 1 : -1;
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Keine Vornamen vorhanden<br>'
		     + '<i class="fa fa-map-marker marker-yellow"></i>Daten mit Vornamen erhältlich<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Open Data-Datensatz mit Vornamen<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cRed = '#f03b20';
		var cYellow = '#e1c64b';
		var cGreen = '#31a354';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);

			addMapMarker( id, (-1 == idata ? cRed : (typeof dataFirstnames[idata]['linkOGData'] !== "undefined") ? cGreen : ((typeof dataFirstnames[idata]['linkWebData'] !== "undefined") ? cYellow :cRed)));
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartCount"></div>';
		txt += '<div class="chart chart' + filterCountry + '" id="chartPeople"></div>';

		return txt;
	},
	createCharts: function( vec) {
		var maxCount = vec.length;
		var maxPeople = 0;
		var valCount = 0;
		var valPeople = 0;
		var txtCount = '% der<br>Großstädte';
		var txtPeople = '% der<br>Bevölkerung';
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);
			if(( -1 != idata) && (typeof dataFirstnames[idata]['linkOGData'] !== "undefined")) {
				++valCount;
				valPeople += dataBasics[id]['population'];
			} else if(( -1 != idata) && (typeof dataFirstnames[idata]['linkWebData'] !== "undefined")) {
				++valCount;
				valPeople += dataBasics[id]['population'];
			}
		}
		for( var i = 0; i < dataBasics.length; ++i) {
			if( dataBasics[i]['nuts'] == filterCountry) {
				maxPeople = dataBasics[i]['population'];
			}
		}
		if( 0 == maxCount) {
			maxCount = 1;
		}
		var chartCount = Circles.create({
			id:'chartCount',value:valCount,maxValue:maxCount,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxCount * 100) < 10) {return '<span>'+Math.round( value / maxCount * 1000)/10+txtCount+'</span>';} else {return '<span>'+Math.round( value / maxCount * 100)+txtCount+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
		var chartPeople = Circles.create({
			id:'chartPeople',value:valPeople,maxValue:maxPeople,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxPeople * 100) < 10) {return '<span>'+Math.round( value / maxPeople * 1000)/10+txtPeople+'</span>';} else {return '<span>'+Math.round( value / maxPeople * 100)+txtPeople+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectMunicipalPortals = {
	getDataset: function() {
		var ret = [];
		var group = 'city';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					if( typeof dataBasics[i]['linkOGD'] !== "undefined") {
						if( dataBasics[i].population < 100000) {
							ret[ ret.length] = i;
						}
					}
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-green"></i>' + dataBasics[nr].name + ' <span class="ui-li-count">' + formatPopulation( dataBasics[nr].population) + '</span></a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>'
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';
		for( var i = 0; i < max; ++i) {
			var id = vec[ i];

			if( max < 10) {
				var marker = new nokia.maps.map.StandardMarker([dataBasics[ id]['lat'], dataBasics[ id]['lon']], {
					brush: {color: cGreen},
					nr: id
				});
				mapContainer.objects.add( marker);
			} else {
				addMapMarker( id, cGreen);
			}
		}
	},
	getCharts: function() {
		var txt = '';
		txt += '<div class="chart chart' + filterCountry + '" id="chartPeople"></div>';

		return txt;
	},
	createCharts: function( vec) {
		var maxCount = vec.length;
		var maxPeople = 0;
		var valPeople = 0;
		var txtPeople = '% der<br>Bevölkerung';
		for( var i = 0; i < maxCount; ++i) {
			var id = vec[ i];
			valPeople += dataBasics[id]['population'];
		}
		for( var i = 0; i < dataBasics.length; ++i) {
			if( dataBasics[i]['nuts'] == filterCountry) {
				maxPeople = dataBasics[i]['population'];
			}
		}
		var chartPeople = Circles.create({
			id:'chartPeople',value:valPeople,maxValue:maxPeople,
			colors:['#9ac9c6','#33a1df'],radius:50,width:10,duration:500,text:function(value){if(Math.round( value / maxPeople * 100) < 10) {return '<span>'+Math.round( value / maxPeople * 1000)/10+txtPeople+'</span>';} else {return '<span>'+Math.round( value / maxPeople * 100)+txtPeople+'</span>';}},wrpClass:'circles-wrp',textClass:'circles-text',
		});
	}
};

// -----------------------------------------------------------------------------

var objectMunicipalFirstnames = {
	getDataset: function() {
		var ret = [];
		var group = 'city';

		for( var idata = 0; idata < dataFirstnames.length; ++idata) {
			var i = nutsGetBasicIndex( dataFirstnames[idata].nuts);
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					if( dataBasics[i].population < 100000) {
						ret[ ret.length] = i;
					}
				}
			}
		}

		return ret;
	},
	getListItem: function( id) {
		var idata = basicIndexGetDataIndex( id);
		var marker = 'red';
		if( -1 == idata) {
		} else if( typeof dataFirstnames[idata]['status'] !== "undefined") {
			if( 'nodata' == dataFirstnames[idata]['status']) {
				marker = 'white';
			}
		} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
			marker = 'green';
		} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
			marker = 'yellow';
		}
		return '<li><a href="#" onClick="clickOnDataItem(\'' + id + '\');" border=0><i class="fa fa-map-marker marker-' + marker + '"></i>' + dataBasics[id].name + ' <span class="ui-li-count">' + formatPopulation( dataBasics[id].population) + '</span></a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		var idataL = basicIndexGetDataIndex( left);
		var idataR = basicIndexGetDataIndex( right);
		var dataL = (-1 == idataL ? 0 : (typeof dataFirstnames[idataL]['linkOGData'] !== "undefined") ? 2 : ((typeof dataFirstnames[idataL]['linkWebData'] !== "undefined") ? 1 : 0));
		var dataR = (-1 == idataR ? 0 : (typeof dataFirstnames[idataR]['linkOGData'] !== "undefined") ? 2 : ((typeof dataFirstnames[idataR]['linkWebData'] !== "undefined") ? 1 : 0));

		if( dataL != dataR) {
			return (dataL > dataR) ? 1 : -1;
		}

		if( dataBasics[left].lat == dataBasics[right].lat) {
			return (dataBasics[left].lon < dataBasics[right].lon) ? 1 : -1;
		}

		return (dataBasics[left].lat < dataBasics[right].lat) ? 1 : -1;
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-red"></i>Keine Vornamen vorhanden<br>'
		     + '<i class="fa fa-map-marker marker-yellow"></i>Daten mit Vornamen erhältlich<br>'
		     + '<i class="fa fa-map-marker marker-green"></i>Open Data-Datensatz mit Vornamen<br>'
		     + '<i class="fa fa-map-marker marker-white"></i>Keine Geburten registriert<br>';
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cRed = '#f03b20';
		var cYellow = '#e1c64b';
		var cGreen = '#31a354';
		var cWhite = '#d0d0d0';

		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var idata = basicIndexGetDataIndex( id);
			var color_ = cRed;
			if( -1 == idata) {
			} else if( typeof dataFirstnames[idata]['status'] !== "undefined") {
				if( 'nodata' == dataFirstnames[idata]['status']) {
					color_ = cWhite;
				}
			} else if( typeof dataFirstnames[idata]['linkOGData'] !== "undefined") {
				color_ = cGreen;
			} else if( typeof dataFirstnames[idata]['linkWebData'] !== "undefined") {
				color_ = cYellow;
			}

			if( max < 10) {
				var marker = new nokia.maps.map.StandardMarker([dataBasics[ id]['lat'], dataBasics[ id]['lon']], {
					brush: {color: color_ },
					nr: id
				});
				mapContainer.objects.add( marker);
			} else {
				addMapMarker( id, color_);
			}
		}
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectOtherPortals = {
	getDataset: function() {
		var ret = [];
		var group = 'other';

		for( var i = 0; i < dataBasics.length; ++i) {
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( typeof dataBasics[i]['linkOGD'] !== "undefined") {
					if( 0 <= dataBasics[i].group.indexOf( group)) {
						ret[ ret.length] = i;
					}
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-green"></i>' + dataBasics[nr].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-green"></i>Hat ein Open Data Portal<br>'
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';
		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var marker = new nokia.maps.map.StandardMarker([dataBasics[ id]['lat'], dataBasics[ id]['lon']], {
				brush: {color: cGreen},
				nr: id
			});
			mapContainer.objects.add( marker);
		}
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

var objectOtherFirstnames = {
	getDataset: function() {
		var ret = [];
		var group = 'other';

		for( var idata = 0; idata < dataFirstnames.length; ++idata) {
			var i = nutsGetBasicIndex( dataFirstnames[idata].nuts);
			if( filterCountry == dataBasics[i].nuts.substr( 0, 2)) {
				if( 0 <= dataBasics[i].group.indexOf( group)) {
					ret[ ret.length] = i;
				}
			}
		}

		return ret;
	},
	getListItem: function( nr) {
		return '<li><a href="#" onClick="clickOnDataItem(\'' + nr + '\');" border=0><i class="fa fa-map-marker marker-green"></i>' + dataBasics[nr].name + '</a></li>';
	},
	sort: function( left, right) {
		return (dataBasics[left].population < dataBasics[right].population) ? 1 : -1;
	},
	geoSort: function( left, right) {
		return geoSort( left, right);
	},
	getLegend: function() {
		return '<i class="fa fa-map-marker marker-green"></i>Open Data-Datensatz mit Vornamen<br>'
	},
	addMarker: function( vec) {
		var max = vec.length;
		var cGreen = '#31a354';
		for( var i = 0; i < max; ++i) {
			var id = vec[ i];
			var marker = new nokia.maps.map.StandardMarker([dataBasics[ id]['lat'], dataBasics[ id]['lon']], {
				brush: {color: cGreen},
				nr: id
			});
			mapContainer.objects.add( marker);
		}
	},
	getCharts: function() {
		return '';
	},
	createCharts: function( vec) {
	}
};

// -----------------------------------------------------------------------------

function geoSort( left, right)
{
	if(( 'Niedersachsen' == dataBasics[left].name) && (0 <= dataBasics[right].name.indexOf( 'Breme'))) {
		return -1;
	}
	if(( 'Niedersachsen' == dataBasics[right].name) && (0 <= dataBasics[left].name.indexOf( 'Breme'))) {
		return 1;
	}
	if(( 'Brandenburg' == dataBasics[left].name) && ('Berlin' == dataBasics[right].name)) {
		return -1;
	}
	if(( 'Brandenburg' == dataBasics[right].name) && ('Berlin' == dataBasics[left].name)) {
		return 1;
	}

	if( dataBasics[left].lat == dataBasics[right].lat) {
		return (dataBasics[left].lon < dataBasics[right].lon) ? 1 : -1;
	}

	return (dataBasics[left].lat < dataBasics[right].lat) ? 1 : -1;
}

// -----------------------------------------------------------------------------

function generateDataList()
{
	mapContainer.objects.clear();
	if( mapBubble) {
		mapBubbles.closeBubble( mapBubble);
		mapBubble = null;
	}

	var txt = '';

	txt += '<div style="padding:0;">Zeige auf der Karte:</div>';

	txt += '<form>';
	txt += '<fieldset data-role="controlgroup">';

	txt += '<select name="filterLevel" id="filterLevel">';
	txt += '<option value="all"' + ('all' == filterLevel ? ' selected="selected"' : '') + '>Alle</option>';
	// federal authorities
	if( 'CH' == filterCountry) {
		txt += '<option value="supreme"' + ('supreme' == filterLevel ? ' selected="selected"' : '') + '>Bundesverwaltung mit</option>';
	} else {
		txt += '<option value="supreme"' + ('supreme' == filterLevel ? ' selected="selected"' : '') + '>Oberste Bundesbehörden mit</option>';
	}
	txt += '<option value="higher"' + ('higher' == filterLevel ? ' selected="selected"' : '') + ' disabled="disabled">Bundesoberbehörden mit</option>';
	txt += '<option value="middle"' + ('middle' == filterLevel ? ' selected="selected"' : '') + ' disabled="disabled">Bundesmittelbehörden mit</option>';
	if( 'CH' == filterCountry) {
		txt += '<option value="nuts1"' + ('nuts1' == filterLevel ? ' selected="selected"' : '') + '>Die Kantone mit</option>';
	} else {
		txt += '<option value="nuts1"' + ('nuts1' == filterLevel ? ' selected="selected"' : '') + '>Die Bundesländer mit</option>';
	}
	txt += '<option value="district"' + ('district' == filterLevel ? ' selected="selected"' : '') + '>Die Landkreise mit</option>';
	txt += '<option value="cities"' + ('cities' == filterLevel ? ' selected="selected"' : '') + '>Alle Großstädte mit</option>';
	txt += '<option value="municipal"' + ('municipal' == filterLevel ? ' selected="selected"' : '') + '>Kleinere Gemeinden mit</option>';
	txt += '<option value="other"' + ('other' == filterLevel ? ' selected="selected"' : '') + '>Andere Stellen mit</option>';
	txt += '</select>';

	txt += '<select name="filterDataset" id="filterDataset">';
	if( 'all' == filterLevel) {
		txt += '<option value="portals"' + ('portals' == settings.dataset ? ' selected="selected"' : '') + '>Open Data Portale</option>';
	} else {
		txt += '<option value="portals"' + ('portals' == settings.dataset ? ' selected="selected"' : '') + '>Open Data Portalen</option>';
	}
	txt += '<option value="firstnames"' + ('firstnames' == settings.dataset ? ' selected="selected"' : '') + '>Vornamen Datensätze</option>';
	txt += '</select>';

	txt += '<select name="filterCountry" id="filterCountry">';
	txt += '<option value="DE"' + ('DE' == filterCountry ? ' selected="selected"' : '') + '>in Deutschland</option>';
	txt += '<option value="AT"' + ('AT' == filterCountry ? ' selected="selected"' : '') + '>in Österreich</option>';
	txt += '<option value="CH"' + ('CH' == filterCountry ? ' selected="selected"' : '') + '>in der Schweiz</option>';
	txt += '</select>';

	txt += '</fieldset>';
	txt += '</form>';

	var obj = objectDefault;
	if(( 'all' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectAllPortals;
	} else if(( 'all' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectAllFirstnames;
	} else if(( 'supreme' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectSupremePortals;
	} else if(( 'supreme' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectSupremeFirstnames;
	} else if(( 'nuts1' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectNuts1Portals;
	} else if(( 'nuts1' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectNuts1Firstnames;
	} else if(( 'district' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectDistrictPortals;
	} else if(( 'district' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectDistrictFirstnames;
	} else if(( 'cities' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectCityPortals;
	} else if(( 'cities' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectCityFirstnames;
	} else if(( 'municipal' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectMunicipalPortals;
	} else if(( 'municipal' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectMunicipalFirstnames;
	} else if(( 'other' == filterLevel) && ('portals' == settings.dataset)) {
		obj = objectOtherPortals;
	} else if(( 'other' == filterLevel) && ('firstnames' == settings.dataset)) {
		obj = objectOtherFirstnames;
	}

	txt += '<div id="dataInfo">';
	txt += obj.getLegend();
	txt += '</div>';
	txt += '<div style="text-align:center;">';
	txt += obj.getCharts();
	txt += '</div>';

	var arr = obj.getDataset();
	arr.sort( obj.sort);

	if( arr.length > 20) {
		txt += '<form style="margin:1em -1em -1em -1em;padding:0.1em 1em .1em 1em;background:#E9E9E9;border-top:1px solid #ddd;"><input id="filterBasic-input" data-type="search"></form>';
		txt += '<ul id="dataList" data-role="listview" data-inset="false" data-filter="true" data-input="#filterBasic-input">';
	} else {
		txt += '<ul id="dataList" data-role="listview" data-inset="false">';
	}
	txt += '<li data-role="list-divider">' + arr.length + ' ' + (1 == arr.length ? 'Eintrag' : 'Einträge') + '</li>';

	for( var i = 0; i < arr.length; ++i) {
		txt += obj.getListItem( arr[ i]);
	}

	txt += '</ul>';

	$( '#mapDetailsDiv').html( txt);
	$( '#mapDetailsDiv').trigger( 'create');
	$( '#mapDetailsDiv').trigger( 'updatelayout');

	$( '#filterCountry').change( function() {
		filterCountry = $( this).val();
		generateDataList();
	});
	$( '#filterLevel').change( function() {
		filterLevel = $( this).val();
		generateDataList();
	});
	$( '#filterDataset').change( function() {
		settings.dataset = $( this).val();
		generateDataList();
	});
	$( '#filterBasic-input').keydown( function( e) {
		if( e.keyCode == 13) {
			return false;
		}
	});

	var id = nutsGetBasicIndex( filterCountry);
	if( id >= 0) {
		addMapMarkerPath( id, '#ffffffc0', false);
	}

	arr.sort( obj.geoSort);
	obj.addMarker( arr);
	obj.createCharts( arr);

	saveURL();
}

// -----------------------------------------------------------------------------

function clickOnDataItem( nr)
{
	nr = parseInt( nr);
	map.set( 'center', [dataBasics[nr].lat, dataBasics[nr].lon]);

	var TOUCH = nokia.maps.dom.Page.browser.touch;
	var CLICK = TOUCH ? 'tap' : 'click';
	var len = mapContainer.objects.getLength();

	for( var i = 0; i < len; ++i) {
		if( nr === mapContainer.objects.get( i).nr) {
			mapContainer.dispatch(
				new nokia.maps.dom.Event({
					type: CLICK,
					target: mapContainer.objects.get( i)
				})
			);
			break;
		}
	}
}

// -----------------------------------------------------------------------------

function showPage( pageName)
{
	filterPage = pageName;

	$( '#mapDetailsDiv').html( $( pageName).html());
//	$( pageName).popup( 'open');

	if( '#popupData' == pageName) {
		generateDataList();
	}

	saveURL();
}

// -----------------------------------------------------------------------------

function saveURL()
{
	var url = '/?page=' + filterPage.substr( 6);
	url += '&level=' + filterLevel;
	url += '&dataset=' + settings.dataset;
	url += '&country=' + filterCountry;
	url += '&lat=' + parseInt( map.center.latitude * 10000) / 10000;
	url += '&lng=' + parseInt( map.center.longitude * 10000) / 10000;
	url += '&zoom=' + parseInt( map.zoomLevel * 100) / 100;

//	history.pushState( {}, '', url);
	history.replaceState( {}, '', url);
}
*/
// -----------------------------------------------------------------------------
/*
$( document).ready( function()
{
	map.addListener( "displayready", function () {
		var queries = location.search.replace(/^\?/, '').split('&');
		var params = {};
		for( var i = 0; i < queries.length; ++i) {
			split = queries[i].split( '=');
			params[split[0]] = split[1];
		}

		if( typeof params['country'] !== 'undefined') {
			filterCountry = params['country'];
		}
		if( typeof params['level'] !== 'undefined') {
			filterLevel = params['level'];
		}
		if( typeof params['dataset'] !== 'undefined') {
			settings.dataset = params['dataset'];
		}

		var page = '';
		if( typeof params['page'] !== 'undefined') {
			page = '#popup' + params['page'];
		}
		if( -1 == $.inArray( page, ['#popupData','#popupContests','#popupShare','#popupCopyright'])) {
			page = '#popupData';
		}
		showPage( page);

		map.addObserver( 'zoomLevel', function() {
			saveURL();
		});
		map.addObserver( 'center', function() {
			saveURL();
		});

		if( typeof params['zoom'] !== 'undefined') {
			map.set( 'zoomLevel', params['zoom']);
		}
		if(( typeof params['lat'] !== 'undefined') && (typeof params['lng'] !== 'undefined')) {
			map.set( 'center', new nokia.maps.geo.Coordinate( parseFloat( params['lat']), parseFloat( params['lng'])));
		}

	});

	$( '#aPopupData1').on( 'click', function( e) { showPage( '#popupData'); return false; });
	$( '#aPopupData2').on( 'click', function( e) { showPage( '#popupData'); window.history.back(); return false; });
	$( '#aPopupShare1').on( 'click', function( e) { showPage( '#popupShare'); return false; });
	$( '#aPopupShare2').on( 'click', function( e) { showPage( '#popupShare'); window.history.back(); return false; });
	$( '#aPopupCopyright1').on( 'click', function( e) { showPage( '#popupCopyright'); return false; });
	$( '#aPopupCopyright2').on( 'click', function( e) { showPage( '#popupCopyright'); window.history.back(); return true; });
});
*/
// -----------------------------------------------------------------------------
