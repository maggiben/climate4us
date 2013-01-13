var map;
var marker;
var radiusWidget;
var markerManager;
var animatedMarker = null;
var circle;
var radiusMarker;
var centerMarker;

// $('#Latitude') ï¿½ latitud del cliente/user
// $('#Longitude') ï¿½ longitud del cliente/user
// $('#Radius') ï¿½ radio de busqueda del cliente/user (en metros)

var functionChangeRadiusPosition = function (oferta) {
	return function(latLng) {
		map.panTo(latLng);
		circle.setCenter(latLng);
		centerMarker.setPosition(circle.getCenter());
		map.fitBounds(circle.getBounds());
		if (!oferta)
			{
				GetMercadosInRadius(circle.getCenter().lat(), circle.getCenter().lng(),parseFloat($('#Radius').val()));
			} else {
				GetOfertasInRadius(circle.getCenter().lat(), circle.getCenter().lng(),parseFloat($('#Radius').val()));
			}
	};	
};

function InitializeMap(latlng, oferta) {
	
	if (oferta == "false")
		{
			markerManager = new MarkerManager();
		} else {
			markerManager = new OfertaMarkerManager();
		}
	
	
	var options = {
		zoom: 14,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	// Crea el mapa. ï¿½user-mapï¿½ es el id del div que contiene el google map
	map = new google.maps.Map(document.getElementById("map_canvas"), options);
	
	// Crea y manipula el Google Map Circle (para el alcance o radio de busqueda)
	radiusWidget = new RadiusWidget(latlng, parseFloat($('#Radius').val()), oferta);
}

function InitializeMercados() {
	GetMercadosInRadius(circle.getCenter().lat(), circle.getCenter().lng(), parseFloat($('#Radius').val()));
}

function InitializeOfertas() {
	GetOfertasInRadius(circle.getCenter().lat(), circle.getCenter().lng(), parseFloat($('#Radius').val()));
}

//Crea y manipula el Google Map Circle (para el alcance o radio de busqueda)
function RadiusWidget(latlng, radius, oferta) {

	//Creacion del google maps circle
	circle = new google.maps.Circle({
		map: map,
		editable: false,
		center: latlng,
		radius: radius,
		strokeWeight: 1,
		strokeColor: "#ff0000",
		fillColor: "#ff0000",
		fillOpacity: 0.2
	});
	
	//Carga la Image (icono) para expandir/contraer el circulo
	var expandimage = new google.maps.MarkerImage('../imagenes/expandmarker.png',
	new google.maps.Size(32, 32),
	new google.maps.Point(0, 0),
	new google.maps.Point(16, 16));
	
	//Carga la Image (icono) para arrastrar el circulo
	var handimage = new google.maps.MarkerImage('../imagenes/handmarker.png',
	new google.maps.Size(32, 32),
	new google.maps.Point(0, 0),
	new google.maps.Point(16, 16));
	
	//Crea el Marker para expandir/contraer el circulo. Utiliza la Image creada.
	radiusMarker = new google.maps.Marker({
		position: new google.maps.LatLng(circle.getBounds().getNorthEast().lat(),
		latlng.lng()),
		map: map,
		draggable: true,
		icon: expandimage,
		shadow: null
	});
	
	//Crea el Marker para arrastrar el circulo. Utiliza la Image creada.
	centerMarker = new google.maps.Marker({
		position: new google.maps.LatLng(circle.getCenter().lat(), circle.getCenter().lng()),
		map: map,
		draggable: true,
		icon: handimage,
		shadow: null
	});
	
	//Eventos al arrastrar, o expandir/contraer el circulo
	google.maps.event.addListener(radiusMarker, 'drag', function (evt) {
		circle.setRadius(DistanceBetweenTwoPoints(circle.getCenter(), this.getPosition()));
	});
	
	google.maps.event.addListener(centerMarker, 'drag', function (evt) {
		circle.setCenter(this.getPosition());
        geocoder.geocode({ 'location': evt.latLng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $('#Direccion-Ciudad').val(results[0].address_components[1].long_name + ' ' + results[0].address_components[0].long_name + ', ' + results[0].address_components[2].long_name + ', ' + results[0].address_components[3].long_name ) ;                        
                    }
                });
	});
	
	google.maps.event.addListener(circle, 'center_changed', function (evt) {
		radiusMarker.setPosition(new google.maps.LatLng(circle.getBounds().getNorthEast().lat(),circle.getCenter().lng()));
	});
	
	google.maps.event.addListener(radiusMarker, 'dragend', function (evt) {
		map.fitBounds(circle.getBounds());
		$('#Radius').val(circle.getRadius());
		if (oferta == "false")
		{
			GetMercadosInRadius(circle.getCenter().lat(), circle.getCenter().lng(),parseFloat($('#Radius').val()));
		} else {
			GetOfertasInRadius(circle.getCenter().lat(), circle.getCenter().lng(),parseFloat($('#Radius').val()));
		}
	});
	
	google.maps.event.addListener(centerMarker, 'dragend', function (evt) {
		map.fitBounds(circle.getBounds());
		if (oferta == "false")
		{
			GetMercadosInRadius(circle.getCenter().lat(), circle.getCenter().lng(),parseFloat($('#Radius').val()));
		} else {
			GetOfertasInRadius(circle.getCenter().lat(), circle.getCenter().lng(),parseFloat($('#Radius').val()));
		}
	});
	
	//Centrar circulo en el mapa.
	map.fitBounds(circle.getBounds());

}

//Calculo de distancia entre dos puntos
function DistanceBetweenTwoPoints(p1, p2) {
	if (!p1 || !p2) { return 0; }
	var R = 6378100; // Radius of the Earth in km
	var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
	var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
	Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
}


