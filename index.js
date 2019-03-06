/* open data atlas - JavaScript file */

/*jslint browser: true*/
/*global $,L,ddj*/

var settings = {
};

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

function enrichMissingData(data) {
	'use strict';

	return data;
}

// -----------------------------------------------------------------------------

$(document).on("pageshow", "#pageMap", function () {
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

	// center the city hall
	ddj.map.init('mapContainer', {
		mapboxId: 'tursics.l7ad5ee8',
		mapboxToken: 'pk.eyJ1IjoidHVyc2ljcyIsImEiOiI1UWlEY3RNIn0.U9sg8F_23xWXLn4QdfZeqg',
		centerLat: 52.516,
		centerLng: 13.4795,
		zoom: 6,
		onFocusOnce: mapAction
	});

	var dataUrl = 'data/polygon-de.geojson';
	$.getJSON(dataUrl, function (data) {
		data = enrichMissingData(data);

		ddj.init(data);

		ddj.polygon.init({
			onStyle: function (data, style) {
				if (data.type.indexOf('country') !== -1) {
					style.color = '#555';
					style.fillColor = '#fff';
					style.fillOpacity = 0.8;
				} else {
					style.color = '#1f78b4';
					style.fillColor = '#1f78b4';
					style.fillOpacity = 0.5;
				}
				return style;
			},
			onMarkerStyle: function (data, style) {
//				style.fillColor = 'red';
				return style;
			}
		});

//		ddj.marker.init({
//			onMouseOver: function (latlng, data) {
/*				updateMapHoverItem(latlng, data, {
					options: {
						markerColor: getColor(data)
					}
				}, 6);*/
/*			},
			onMouseOut: function (latlng, data) {
//				updateMapVoidItem(data);
			},
			onClick: function (latlng, data) {
//				updateMapSelectItem(data);
			}
		});
*/
		ddj.search.init({
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
		});

//		initSocialMedia();
	});

	ddj.getMap().addControl(new ControlInfo());

	$('#autocomplete').val('');
	$('#receipt .group').on('click', function () {
		$(this).toggleClass('groupClosed');
	});
	$('#receiptClose').on('click', function () {
		$('#receiptBox').css('display', 'none');
	});
	$('#searchBox .sample a:nth-child(1)').on('click', function () {
		$('#autocomplete').val('32. Schule (Grundschule) (11G32)');
		selectSuggestion('11G32');
	});
	$('#searchBox .sample a:nth-child(2)').on('click', function () {
		$('#autocomplete').val('Staatliche Ballettschule Berlin und Schule für Artistik (03B08)');
		selectSuggestion('03B08');
	});
	$('#filterOpen').on('click', function () {
		$('#filterBox').css('display', 'block');
		$('#filterOpen').css('display', 'none');
	});
	$('#filterClose').on('click', function () {
		$('#filterBox').css('display', 'none');
		$('#filterOpen').css('display', 'inline-block');
	});

	$('#searchBox #cbRelative').on('click', function () {
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
});

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

/*
	use http://www.convertcsv.com/csv-to-json.htm
*/

var map = null;
var mapContainer = null;
var mapBubble = null;
var mapBubbles = null;
var filterCountry = 'DE';
var filterLevel = 'all';
var filterDataset = 'portals';
var filterPage = '#popupData';

// -----------------------------------------------------------------------------

function initNokiaMap(elementName, lat, lon, zoom) {
	'use strict';

	mapBubbles = new nokia.maps.map.component.InfoBubbles();
	var TOUCH = nokia.maps.dom.Page.browser.touch,
		CLICK = TOUCH ? 'tap' : 'click';

	mapContainer = new nokia.maps.map.Container();
	mapContainer.addListener(CLICK, function (evt) {
		if (evt.target.nr >= 0) {
			mapBubble = mapBubbles.openBubble(getBubbleHTML(evt.target.nr), evt.target.coordinate);
		}
	}, false);

	map.components.add(mapBubbles);
	map.objects.add(mapContainer);
}

// -----------------------------------------------------------------------------

function getBubbleHTML(id) {
	'use strict';

	try {
		var str, i, l, data, level;

		str = '<div style="font-size:1.25em;">';
		str += '<div style="border-bottom:1px solid white;padding-bottom:0.5em;margin-bottom:0.5em;">';
		str += '<i class="fa fa-map-marker"></i> ' + dataBasics[id].name + '<br>';
		if (dataBasics[id].population > 0) {
			str += '<i class="fa fa-male"></i> ' + formatPopulation(dataBasics[id].population) + ' Einwohner<br>';
		}
		str += '</div>';

		if (typeof dataBasics[id].territorial !== 'undefined') {
			str += '<div style="border-bottom:1px solid white;padding-bottom:0.5em;margin-bottom:0.5em;">';
			data = dataBasics[id].territorial;
			level = [];

			if (data.length >= 2) {
				level.push(data.substr(0, 2)); // state
			}
			if (data.length >= 3) {
				level.push(data.substr(0, 3)); // governorate
			}
			if (data.length >= 5) {
				level.push(data.substr(0, 5)); // county
			}
			if (data.length >= 9) {
				level.push(data.substr(0, 9)); // union
			}
			if (data.length >= 12) {
				level.push(data.substr(0, 12)); // municipal
			}

			str += '<i class="fa fa-chevron-right"></i> Deutschland<br>';
			for (l = 0; l < level.length; ++l) {
				for (i = 0; i < dataBasics.length; ++i) {
					if (typeof dataBasics[i].territorial !== 'undefined') {
						if (level[l] === dataBasics[i].territorial) {
							str += '<i class="fa fa-chevron-right"></i> ' + dataBasics[i].name + '<br>';
							break;
						}
					}
				}
				if (i >= dataBasics.length) {
//					str += '<i class="fa fa-map-marker"></i> ' + level[ l] + '<br>';
				}
			}
//			str += '<i class="fa fa-map-marker"></i> ' + dataBasics[ id]['nuts'] + '<br>';
			str += '</div>';
		}

		if (typeof dataBasics[id].linkOGD !== 'undefined') {
			str += '<i class="fa fa-check"></i> Hat ein <a href="' + dataBasics[id].linkOGD + '" target="_blank">Open Data Portal</a><br>';
		} else {
			str += '<i class="fa fa-times"></i> Hat kein Open Data Portal<br>';
		}
		if (typeof dataBasics[id].linkOGDMail !== 'undefined') {
			str += '<i class="fa fa-check"></i> Hat einen <a href=mailto:"' + dataBasics[id].linkOGDMail + '">Open Data Ansprechpartner</a><br>';
		}

		if ('firstnames' === filterDataset) {
			var idata = basicIndexGetDataIndex(id);

			if ((-1 !== idata) && (typeof dataFirstnames[idata]['linkOGData'] !== 'undefined')) {
				str += '<i class="fa fa-heart"></i> Enthält einen <a href="' + dataFirstnames[idata]['linkOGData'] + '" target="_blank">Vornamen-Datensatz</a><br>';

				if (typeof dataFirstnames[idata]['linkOGDLicense'] !== 'undefined') {
					var license = dataFirstnames[idata]['linkOGDLicense'];
					var good = false;

					if ('CC 0' === license) {
						good = true;
					} else if ('CC BY 4.0' === license) {
						good = true;
					} else if ('CC BY 3.0' === license) {
						good = true;
					} else if ('DL DE 0 2.0' === license) {
						good = true;
					} else if ('DL DE BY 2.0' === license) {
						good = true;
					}

					if (good) {
						str += '<i class="fa fa-heart"></i> Mit der Lizenz ' + license + '<br>';
					} else {
						str += '<i class="fa fa-check"></i> Mit der Lizenz ' + license + '<br>';
					}
				}
			} else {
				if (typeof dataBasics[id]['linkOGD'] !== 'undefined') {
					str += '<i class="fa fa-times"></i> Kein Vornamen-Datensatz vorhanden<br>';
				}

				if ((-1 != idata) && (typeof dataFirstnames[idata]['linkWebData'] !== 'undefined') && (dataFirstnames[ idata]['linkWebData'] != '')) {
					str += '<i class="fa fa-check"></i> Vornamen auf der <a href="' + dataFirstnames[idata]['linkWebData'] + '" target="_blank">Webseite</a><br>';
				} else if (typeof dataBasics[id]['linkOGD'] === 'undefined') {
					str += '<i class="fa fa-times"></i> Keine Vornamen vorhanden<br>';
				}

				if ((-1 != idata) && (typeof dataFirstnames[idata]['status'] !== 'undefined')) {
					if ('nodata' == dataFirstnames[ idata]['status']) {
						str += '<i class="fa fa-circle-o"></i> Keine Geburten registriert<br>';
					} else if ('fee' == dataFirstnames[idata]['status']) {
						str += '<i class="fa fa-warning"></i> Kostenpflichtige Auskunft<br>';
					}
				}
			}
		}

		if ('firstnames' === filterDataset) {
			if(( -1 != idata) && (typeof dataFirstnames[idata]['history'] !== 'undefined')) {
				str += '<br>';

				var historySize = dataFirstnames[idata]['history'].length;
				for( var h = 0; h < historySize; ++h) {
					str += '<div style="border-top:1px solid #aaaaaa;color:#aaaaaa;padding-top:0.5em;margin-top:0.5em;">';
					str += '<i class="fa fa-calendar"></i> ' + dataFirstnames[idata]['history'][h]['date'] + '<br>';
					str += '<i class="fa fa-comment-o"></i> ' + dataFirstnames[idata]['history'][h]['event'] + '</div>';
				}
			}
		} else {
			if( typeof dataBasics[ id]['history'] !== 'undefined') {
				str += '<br>';

				var historySize = dataBasics[ id]['history'].length;
				for( var h = 0; h < historySize; ++h) {
					str += '<div style="border-top:1px solid #aaaaaa;color:#aaaaaa;padding-top:0.5em;margin-top:0.5em;">';
					str += '<i class="fa fa-calendar"></i> ' + dataBasics[ id]['history'][ h]['date'] + '<br>';
					str += '<i class="fa fa-comment-o"></i> ' + dataBasics[ id]['history'][ h]['event'] + '</div>';
				}
			}
		}
		str += '</div>';

		return str;
	} catch( e) {
		return e.message;
	}
}

// -----------------------------------------------------------------------------

function formatPopulation( population)
{
	var str = population.toString();
	if( str.length > 3) {
		str = str.substr( 0, str.length - 3) + '.' + str.substr( str.length - 3);
	}
	if( str.length > 7) {
		str = str.substr( 0, str.length - 7) + '.' + str.substr( str.length - 7);
	}
	return str;
}

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
		txt += '<option value="portals"' + ('portals' == filterDataset ? ' selected="selected"' : '') + '>Open Data Portale</option>';
	} else {
		txt += '<option value="portals"' + ('portals' == filterDataset ? ' selected="selected"' : '') + '>Open Data Portalen</option>';
	}
	txt += '<option value="firstnames"' + ('firstnames' == filterDataset ? ' selected="selected"' : '') + '>Vornamen Datensätze</option>';
	txt += '</select>';

	txt += '<select name="filterCountry" id="filterCountry">';
	txt += '<option value="DE"' + ('DE' == filterCountry ? ' selected="selected"' : '') + '>in Deutschland</option>';
	txt += '<option value="AT"' + ('AT' == filterCountry ? ' selected="selected"' : '') + '>in Österreich</option>';
	txt += '<option value="CH"' + ('CH' == filterCountry ? ' selected="selected"' : '') + '>in der Schweiz</option>';
	txt += '</select>';

	txt += '</fieldset>';
	txt += '</form>';

	var obj = objectDefault;
	if(( 'all' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectAllPortals;
	} else if(( 'all' == filterLevel) && ('firstnames' == filterDataset)) {
		obj = objectAllFirstnames;
	} else if(( 'supreme' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectSupremePortals;
	} else if(( 'supreme' == filterLevel) && ('firstnames' == filterDataset)) {
		obj = objectSupremeFirstnames;
	} else if(( 'nuts1' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectNuts1Portals;
	} else if(( 'nuts1' == filterLevel) && ('firstnames' == filterDataset)) {
		obj = objectNuts1Firstnames;
	} else if(( 'district' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectDistrictPortals;
	} else if(( 'district' == filterLevel) && ('firstnames' == filterDataset)) {
		obj = objectDistrictFirstnames;
	} else if(( 'cities' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectCityPortals;
	} else if(( 'cities' == filterLevel) && ('firstnames' == filterDataset)) {
		obj = objectCityFirstnames;
	} else if(( 'municipal' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectMunicipalPortals;
	} else if(( 'municipal' == filterLevel) && ('firstnames' == filterDataset)) {
		obj = objectMunicipalFirstnames;
	} else if(( 'other' == filterLevel) && ('portals' == filterDataset)) {
		obj = objectOtherPortals;
	} else if(( 'other' == filterLevel) && ('firstnames' == filterDataset)) {
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
		filterDataset = $( this).val();
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
	url += '&dataset=' + filterDataset;
	url += '&country=' + filterCountry;
	url += '&lat=' + parseInt( map.center.latitude * 10000) / 10000;
	url += '&lng=' + parseInt( map.center.longitude * 10000) / 10000;
	url += '&zoom=' + parseInt( map.zoomLevel * 100) / 100;

//	history.pushState( {}, '', url);
	history.replaceState( {}, '', url);
}

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
			filterDataset = params['dataset'];
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
