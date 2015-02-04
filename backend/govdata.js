// -----------------------------------------------------------------------------

var vecAuthor = new Object();
var vecMaintainer = new Object();
var objLicense = new Object();
var objPortal = new Object();

// -----------------------------------------------------------------------------

function loadData()
{
	$.getJSON( 'govdata.de-daily.json', function( data) {
		var str = $( '#target').html();
		str += 'Daten analysieren...<br>';
		$( '#target').html( str);

		str += data.length + ' Datensätze...<br>';
		str += '<br>';
		$( '#target').html( str);

		$.each( data, function( key, val) {
			if( typeof vecAuthor[val.author] == 'undefined') { vecAuthor[val.author] = 0; }
			++vecAuthor[val.author];

			if( typeof vecMaintainer[val.maintainer] == 'undefined') { vecMaintainer[val.maintainer] = 0; }
			++vecMaintainer[val.maintainer];

			if( typeof objLicense[val.license_id] == 'undefined') { objLicense[val.license_id] = 0; }
			++objLicense[val.license_id];

			if( typeof objPortal[val.extras.metadata_original_portal] == 'undefined') { objPortal[val.extras.metadata_original_portal] = 0; }
			++objPortal[val.extras.metadata_original_portal];
		});

		str += 'Autoren: ' + Object.keys( vecAuthor).length + ' (z.B. "' + Object.keys( vecAuthor)[Object.keys( vecAuthor).length /2] + '")<br>';
		str += 'Betreiber: ' + Object.keys( vecMaintainer).length + ' (z.B. "' + Object.keys( vecMaintainer)[Object.keys( vecMaintainer).length/2] + '")<br>';

		str += '<br>';

		var vecLicense = [];
		$.each( objLicense, function( key, val) {
			vecLicense.push({ name: key, count: val });
		});
		str += 'Lizenzarten: ' + Object.keys( objLicense).length + '<br>';
		vecLicense.sort( function( a,b) {
			return a.count < b.count;
		});
		$.each( vecLicense, function( key, val) {
			str += '&nbsp;&nbsp;' + val.count + 'x ' + val.name + '<br>';
		});

		str += '<br>';

		var vecPortal = [];
		$.each( objPortal, function( key, val) {
			vecPortal.push({ name: key, count: val });
		});
		str += 'Portale: ' + vecPortal.length + '<br>';
		vecPortal.sort( function( a,b) {
			return a.count < b.count;
		});
		$.each( vecPortal, function( key, val) {
			if( 0 != val.name.indexOf( 'http')) {
				val.name = 'http://' + val.name;
			}
			str += '&nbsp;&nbsp;' + val.count + 'x <a href="' + val.name + '" target="_blank">' + val.name + '</a><br>';
		});

		$( '#target').html( str);
	});
}

// -----------------------------------------------------------------------------

$( document).on( "pagecreate", "#pageMain", function() {
});

// -----------------------------------------------------------------------------

$( document).on( "pageshow", "#pageMain", function() {
	var str = $( '#target').html();
	str += '<br>';
	str += 'Daten einlesen...<br>';
	$( '#target').html( str);

	loadData();
});

// -----------------------------------------------------------------------------
