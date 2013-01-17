///////////////////////////////////////////////////////////////////////////////
//                                                                           //
//            ____                              __                           //
//           /\  _`\                           /\ \__                        //
//           \ \ \L\_\ __   _ __    ___      __\ \ ,_\                       //
//            \ \  _\/'__`\/\`'__\/' _ `\  /'__`\ \ \/                       //
//             \ \ \/\  __/\ \ \/ /\ \/\ \/\  __/\ \ \_                      //
//              \ \_\ \____\\ \_\ \ \_\ \_\ \____\\ \__\                     //
//               \/_/\/____/ \/_/  \/_/\/_/\/____/ \/__/                     //
//                                                                           //
// ------------------------------------------------------------------------- //
// @file         : fernet.maps.js                                            //
// @summary      : Map capsule for fernet framework                          //
// @version      : 0.1.2                                                     //
// @project      : https://github.com/maggiben                               //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 06 Ene 2013                                               //
// @dependencies                                                             //
//  jQuery              : 1.8.2                                              //
//  jQuery.UI           : 1.9.1                                              //
//  ICanHaz             : 0.10                                               //
//  Google maps         : 3                                                  //
//  InfoBubble          : 0.8                                                //
//  MarkerClusterer     : 1.0                                                //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2013 Benjamin Maggi, all rights reserved.            //
//                                                                           //
//                                                                           //
// License:                                                                  //
// This program is free software; you can redistribute it                    //
// and/or modify it under the terms of the GNU General Public                //
// License as published by the Free Software Foundation;                     //
// either version 2 of the License, or (at your option) any                  //
// later version.                                                            //
//                                                                           //
// This program is distributed in the hope that it will be useful,           //
// but WITHOUT ANY WARRANTY; without even the implied warranty of            //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             //
// GNU General Public License for more details.                              //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Google MAPS bindings                                                      //
///////////////////////////////////////////////////////////////////////////////
;(function($) {
    "use strict";
    window.map = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exists.');
        }
    };
    var distanceWidget;
    var map;
    var geocodeTimer;
    var profileMarkers = [];
    var methods = {};
    var markers = [];
    var marker = null;
    var markerClusterer = null;
    var style = [{
        url: '/images/markers/m1.png',
        height: null,
        width: null,
        anchor: [0, 0],
        textColor: '#ff00ff',
        textSize: 10
    }, {
        url: '/images/markers/m2.png',
        height: 45,
        width: 45,
        anchor: [24, 0],
        textColor: '#ff0000',
        textSize: 11
    }, {
        url: '/images/markers/m3.png',
        height: 55,
        width: 55,
        anchor: [32, 0],
        textColor: '#ffffff',
        textSize: 12
    }];
    //Set defauls for the control
    var defaults = {
        data: [],
        icon: 'images/markers/anniversary.png',
        title: 'Feria',
        width: 260,
        height: null,
        background: "#eee",
    };
    //Public methods 
    methods.init = function (options) {
        //Preserve the original defaults by passing an empty object as the target
        var options = $.extend({}, defaults, options);
        console.log(JSON.stringify(options));
        if (typeof google !== 'object' && typeof google.maps !== 'object') 
        {
            return false;
        }
        
        var myLatlng = new google.maps.LatLng(options.latitude, options.longitude)
        
        var map = new google.maps.Map(document.getElementById(options.id), options.mapOptions);
        setMapStyle(map);
        marker = makeMarker({
            position: myLatlng,
            map: map,
            draggable: true,
            title: 'Galaconcert',
            icon: '/images/markers/anniversary.png' 
        });
        distanceWidget = new DistanceWidget({
            map: map,
            distance: 5, // Starting distance in km.
            maxDistance: 10, // Twitter has a max distance of 2500km.
            color: '#A727A7',
            activeColor: '#e97ad8',
            fillColor: '#e97ad8',
            fillOpacity: 0.45,
            sizerIcon: new google.maps.MarkerImage('/images/radius-resize-off.png'),
            activeSizerIcon: new google.maps.MarkerImage('/images/radius-resize.png'),
            homeMarker: marker,
        });
        
        google.maps.event.addListener(distanceWidget, 'distance_changed',  function() {
            console.log("distance change");
            //updateDistance();
        });

        google.maps.event.addListener(distanceWidget, 'position_changed', function() {
            console.log("position change: " + distanceWidget.get('position'));            
        });

        var div = document.createElement('DIV');
        $(div).html(ich.infobubble_template({
            name: 'none',
            latitude_integer: -33,
            longitude_integer: -22,
            latitude_fraction: 5543,
            longitude_fraction: 4332
        }));
        var myBubble = makeBubble(map, myLatlng);

        google.maps.event.addListener(marker, 'click', function() {
            myBubble.setContent(div);
            myBubble.open(map, marker);
        });

        for (var i = 0; i < 29; i++) {
            var dataPhoto = photos.coords[i];
            var latLng = new google.maps.LatLng(dataPhoto.lat,
                dataPhoto.lon);
            var marker = new google.maps.Marker({
                position: latLng
            });
            google.maps.event.addListener(marker, 'click', function() {
                var lat = this.getPosition().lat();
                var lng = this.getPosition().lng();
                var lati = parseInt(lat, 10);
                var lngi = parseInt(lng, 10);
                $(div).html(ich.infobubble_template({
                    name: 'none',
                    latitude_integer: lati,
                    longitude_integer: lngi,
                    latitude_fraction: (lng - lati).toFixed(4),
                    longitude_fraction: (lat - lngi).toFixed(4)
                }));
                myBubble.setContent(div);
                myBubble.setPosition(this.position);
                myBubble.open(map, this);
            });
            markers.push(marker);
        }
        var markerCluster = new MarkerClusterer(map, markers, {
            maxZoom: null,
            gridSize: null,
            styles: null
        });

    };
    //Public:
    methods.moveMarker = function (placeName, latlng){
        //marker.setPosition(latlng);
        //infowindow.close();
    };
    function makeMarker(options)
    {
        return new google.maps.Marker(options)
    };
    //Private:
    function makeBubble(map, position) {
        return new InfoBubble({
            map: map,
            content: '',
            position: position,
            shadowStyle: 0,
            padding: 0,
            backgroundColor: 'rgba(57,57,57,0.0)',
            borderRadius: 4,
            arrowSize: 10,
            borderWidth: 0,
            borderColor: '#2c2c2c',
            disableAutoPan: true,
            hideCloseButton: true,
            arrowPosition: 50,
            backgroundClassName: '',
            arrowStyle: 0
        });  
    };
    function setMapStyle(map) {
        var lightMapStyle = [{
                featureType: "all",
                elementType: "all",
                stylers: [
                    {hue: "#95386f"}, 
                    {saturation: 0}, 
                    {lightness: 0}, ]}, 
                    {featureType: "road",elementType: "all",stylers: [{visibility: "on"}]}, 
                    {featureType: "poi",elementType: "all",stylers: [{visibility: "off"}]}, 
                    {featureType: "landscape",elementType: "all"}, 
                    {featureType: "transit",elementType: "all",stylers: [{visibility: "off"}]}, 
                    {featureType: "administrative.country",elementType: "all",stylers: [{visibility: "on"}]}, 
                    {featureType: "administrative.province",elementType: "all",stylers: [{visibility: "on"}]}, 
                    {featureType: "water",elementType: "all",stylers: [{visibility: "simplified"}, ]}];
        var lightMapRoadsStyle = [{featureType: "all",elementType: "all",stylers: [{hue: "#95386f"}]}, {featureType: "road",elementType: "labels",stylers: [{visibility: "off"}, {saturation: -50}, {lightness: 0}, ]}, {featureType: "road",elementType: "geometry",stylers: [{visibility: "simplified"}, {saturation: -50}]}, {featureType: "administrative",elementType: "geometry",stylers: [{visibility: "off"}]}, {featureType: "transit",elementType: "all",stylers: [{visibility: "off"}]}, {featureType: "poi",elementType: "all",stylers: [{visibility: "off"}]}];
        var lightMapOptions = {name: 'Light Map'};
        var lightMapType = new google.maps.StyledMapType(lightMapStyle, lightMapOptions);
        map.mapTypes.set('lightmap', lightMapType);
        var lightMapRoadsOptions = {name: 'Light Map Roads'};
        var lightMapRoadsType = new google.maps.StyledMapType(lightMapRoadsStyle, lightMapRoadsOptions);
        map.mapTypes.set('lightmaproads', lightMapRoadsType);
        map.setMapTypeId('lightmap');
    };
})(window.jQuery || window.Zepto);


var photos = { 
    coords: [
        {lat: -34.96452516263702, lon: -58.96397539062502},
        {lat: -34.96902672547199, lon: -58.96397539062502},
        {lat: -34.960023352468966, lon: -58.94749589843752},
        {lat: -34.905982343648894, lon: -58.85411210937502},
        {lat: -34.8023042875639, lon: -58.65086503906252},
        {lat: -34.76169906206186, lon: -58.54649492187502},
        {lat: -34.76169906206186, lon: -58.53001542968752},
        {lat: -34.76169906206186, lon: -58.52452226562502},
        {lat: -34.75718613671073, lon: -58.50804277343752},
        {lat: -34.752672964687044, lon: -58.49705644531252},
        {lat: -34.748159546005304, lon: -58.49705644531252},
        {lat: -34.71204331860662, lon: -58.48057695312502},
        {lat: -34.66235774538773, lon: -58.45860429687502},
        {lat: -34.65953380626876, lon: -58.459290942382836},
        {lat: -34.65332080147123, lon: -58.462037524414086},
        {lat: -34.63015913539299, lon: -58.47165056152346},
        {lat: -34.619988555748066, lon: -58.47508378906252},
        {lat: -34.618293337945516, lon: -58.47233720703127},
        {lat: -34.617163173507606, lon: -58.47096391601565},
        {lat: -34.60303481968669, lon: -58.45311113281252},
        {lat: -34.59907844979453, lon: -58.44487138671877},
        {lat: -34.59851323871041, lon: -58.442811450195336},
        {lat: -34.59851323871041, lon: -58.44487138671877},
        {lat: -34.59794802378006, lon: -58.44899125976565},
        {lat: -34.596252355911965, lon: -58.46135087890627},
        {lat: -34.596252355911965, lon: -58.4627241699219},
        {lat: -34.596252355911965, lon: -58.46341081542971},
        {lat: -34.596252355911965, lon: -58.46890397949221},
        {lat: -34.596252355911965, lon: -58.46959062500002}
        ]
}