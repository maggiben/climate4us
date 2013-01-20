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
// @file         : fernet.js                                                 //
// @summary      : Realtime framework                                        //
// @version      : 0.1.2                                                     //
// @project      : https://github.com/maggiben                               //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 06 Ene 2013                                               //
// @dependencies                                                             //
//  jQuery       : 1.8.2                                                     //
//  jQuery.UI    : 1.9.1                                                     //
//  ICanHaz      : 0.10                                                      //
//  Sammy        : 0.7.2                                                     //
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
// Main App closure                                                          //
// @param {Function} window.jQuery || window.Zepto JS libraries              //
///////////////////////////////////////////////////////////////////////////////
;(function($) {
    "use strict";
    function trim(stuff) {
        if (''.trim) return stuff.trim();
        else return stuff.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    var MyApp = {
        module: {
            VERSION: "0.1.2.3",
            license: {},
            dependencies: {},
            author: "",
        },
        $: (typeof window !== 'undefined') ? window.jQuery || window.Zepto || null : null,
        timeout: null,
        clients: null,
        connection_count: 0,
        subscription: {},
        subscriptions: [],
        full_map: null,
        views: {
            code: {}
        },
        mousecoords: {
            pageX: 0,
            pageY: 0,
        },
        properties: {
            delay: 10,
            reconnect: true,
            socket: null,
            stdinp: null,
            stdout: null,
            stderr: null,
        },
        user: {
                name: "",
                id: "",
                last_name: null,
                first_name: null,
                email: "",
                subscriptions: [],
                subscription: null,
        },
        init: function(options) {
            var that = this;
            var deferred = new jQuery.Deferred();
            $.when(this.getUser())
            .then(function(account) {
                console.log("user id ok")
                if(that.user.subscriptions.length > 0)
                {
                    $("#sites").prepend(ich.stations_loader(this)).hide().fadeIn('slow');
                    $( "#progressbar" ).progressbar({
                        value: 0
                    });
                    that.user.subscriptions.forEach(function(_id) {
                        that.getSubscription({_id: _id, callback: gotSubscription});
                    });
                }
                else {
                    $("body").addClass("add_subscription");
                    return;
                }
                function gotSubscription(subscription) {
                    console.log("subscription")
                    MyApp.subscriptions[subscription._id] = new Subscription({_id: subscription._id, callback: onInit});
                    // Because we want one one
                    // TODO REFACTOR TO SELECTED SUBSCRIPTION
                    MyApp.subscription = MyApp.subscriptions[subscription._id];
                }
                function onInit(subscription)
                {
                    //hide("slide", { direction: "right" }, 'swing')
                    /*
                    $("#sites .notice").fadeOut(1000, function () {
                        $(this).remove();
                    });
                    */
                    // Remove div.loader from sortable
                    $("#sites .notice").hide(1000, 'swing', function() {$(this).remove()});
                    //$("#sites .notice").hide("slide", { direction: "up" }, 1000, 'swing');

                    var queue = $.jqmq({
                         // Next item will be processed only when queue.next() is called in callback.
                        delay: 100,
                        // Process queue items one-at-a-time.
                        batch: 1,
                        // For each queue item, execute this function, making an AJAX request. Only
                        // continue processing the queue once the AJAX request's callback executes.
                        callback: function( _id ) {
                            var station = subscription.stations[_id];
                            $("#sites").append(ich.site_template(station.properties));
                            $("#s" + station.properties._id).html(ich.station_preview_template(station.properties)).hide().fadeIn(100);
                        },
                        // When the queue completes naturally, execute this function.
                        complete: function(){
                            var selected = MyApp.subscription.getSelected();
                            if(subscription.stations.hasOwnProperty(selected))
                            {
                                window.sammyApp.run();
                                if(window.sammyApp.last_location[1] == '/')
                                {
                                    window.sammyApp.trigger("show_panel.g",{id: selected, path: "overview"})
                                }
                            }
                        }
                    });
                    subscription.order.forEach(function(_id) { queue.add(_id) });
                }
            })
            .done(function(user) {
                console.log(user);
                eferred.resolve(user);
            })
            .fail(function(error) {
                console.log("could not retreive user info")
                deferred.reject(new Error(error));
            });
            return deferred.promise();
        },
        start: function(options) {
            var that = this;
            $.ajax({
                url: '/application/start',
                type: 'GET',
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    //that.subscription subscription: {},
                },
                error: function (jqXHR, status, error) {
                    //c.removeClass("loading")
                },
                complete: function () {

                },
            });
        },
        getSubscriptionXXX: function(options) {
            var that = this;
            console.log("MyApp.getSubscription(%s)", options._id);
            $.ajax({
                url: "/subscription/getbyid/" + options._id,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if($.isFunction(options.callback))
                    {
                        options.callback(data);
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                    $("body").addClass("add_subscription");
                },
                complete: function () {
                }
            });
        },
        getSubscription: function(options) {
            console.log("MyApp.getSubscription(%s)", options._id);
            var that = this;
            var deferred = new jQuery.Deferred();
            
            $.ajax({
                url: "/subscription/getbyid/" + options._id,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if($.isFunction(options.callback))
                    {
                        options.callback(data);
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                    $("body").addClass("add_subscription");
                },
                complete: function () {
                }
            });
        },
        setSubscription: function(_id) {
            var that = this;
            $.ajax({
                url: "/account/subscription",
                type: "PUT",
                dataType: "json",
                data: {subscription: _id},
                success: function (data, textStatus, jqXHR) {
                    that.user.subscription = data.subscription;
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
                complete: function () {
                }
            });
        },
        createSubscription: function(options, callback) {
            var that = this;
            $.ajax({
                url: "/subscription/create",
                type: "POST",
                dataType: "json",
                data: options,
                success: function (data, textStatus, jqXHR) {
                    console.log("on data()")
                    that.subscriptions[data._id] = new Subscription({_id: data._id, callback: onInit});
                    function onInit(subscription)
                    {
                        console.log("onInit()");

                        that.subscription = MyApp.subscriptions[subscription._id];
                        that.user.subscriptions.push(subscription._id);
                        that.setSubscription(subscription._id);
                        $("body").removeClass("add_subscription");
                        $("body").addClass("adding");
                        if($.isFunction(callback))
                        {
                            callback(subscription);
                        }
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
                complete: function () {
                }
            });
        },
        reset: function () {},
        setUser: function (a) {
            //this.user = a.user, a.subscription && (this.subscription = new Subscription(a.subscription))
        },
        getUser: function(options) {
            var that = this;
            var deferred = new jQuery.Deferred();
            $.ajax({url:"/account/getAccount"})
            .then(function(data, textStatus, jqXHR) { 
                that.user = $.extend({}, that.user, data);
                return that.user;
            })
            .done(function(user) {
                deferred.resolve(user);
            })
            .fail(function(jqXHR, status, error) {
                deferred.reject(new Error(error));
            });
            return deferred.promise();
        },
        getUserXXX: function(options) {
            var that = this;
            $.ajax({
                url: "/account/getAccount",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    that.user = $.extend({}, that.user, data);
                    options.callback(that.user);
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
            });
        },
        signin: function(options) {
            var that = this;
            $.ajax({
                url: "/account/signin",
                type: "post",
                dataType: "json",
                data: {
                    username: options.username,
                    password: options.password
                },
                success: function(data, textStatus, jqXHR)
                {
                    that.user = $.extend({}, that.user, data);
                    if($.isFunction(options.callback))
                    {
                        callback(data);
                    }
                    console.log(data);
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                }
            });
        },
        getSettings: function(a) {
                /*
                $("#sites div.current").removeClass("current"),
                $("#data").html(ich.account_template(Gauges.user)),
                $('div.nav a[href="#/account"]').closest("li").addClass("current"),
                $("#site_content").html(ich.my_info_template(Gauges.user))
                */
        },
        meldSidebar: function () {
            console.log("meldSidebar()")
            var a = $("#sites div.current"),
                b = $("#data");
            $(window).scrollTop() == 0 ? $("#sites").removeClass("topcut") : $("#sites").addClass("topcut"), $("#sites").height() > b.outerHeight() ? $("#sites").addClass("bottomcut") : $("#sites").removeClass("bottomcut");
            if (a.length > 0) {
                var c = a.offset().top,
                    d = c + a.outerHeight(),
                    e = b.offset().top,
                    f = e + b.outerHeight(),
                    g = a.attr("id") == $("#sites > div:first").attr("id") ? 0 : 10;
                a.length > 0 && c >= e + g && d < f - 10 ? $("#sites").addClass("meld") : $("#sites").removeClass("meld")
                }
        },
        resize: function() {
            console.log("resize");
            this.meldSidebar();
        },
        fullScreenMap: function() {
            var options = {
                zoom: 12,
                center: new google.maps.LatLng(-34.6036, -58.3817),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            $("#full_map").fadeIn('slow'); //slideDown(500, 'easeOutBounce');
            $("#full_map_frame").css('height', '100%');
            //$("#full_map_wrapperx").hide();
            //$("#full_map_wrapperx").css('opacity', 0);
            $("#full_map_frame").slideDown(2000, 'easeOutBounce', function() {
                // resize after animation stop
                /*
                if(!MyApp.full_map)
                {
                    MyApp.full_map = new window.map({id: "full_map_wrapperx", latitude: -34.6036, longitude: -58.3817, mapOptions: options});
                    //$("#full_map_wrapperx").css('opacity', 0);
                    google.maps.event.trigger(MyApp.full_map.mapa, "resize");
                    google.maps.event.addListenerOnce(MyApp.full_map.mapa, 'idle', function(){
                        // do something only the first time the map is loaded

                        //google.maps.event.trigger(MyApp.full_map.mapa, "resize");
                        google.maps.event.trigger(MyApp.full_map.mapa, "resize");
                        MyApp.full_map.mapa.setCenter(MyApp.full_map.homeMarker.getPosition());
                        google.maps.event.addListenerOnce(MyApp.full_map.mapa, 'bounds_changed', function() {
                            $("#full_map_wrapperx").animate({opacity: 1}, 250);
                        });
                    });
                }
                */
                if(!MyApp.full_map)
                {
                    MyApp.full_map = new window.map({id: "full_map_wrapperx", latitude: -34.6036, longitude: -58.3817, mapOptions: options});
                }
                else {

                }
               //$("#full_map_wrapperx").css('opacity', 0);
                //google.maps.event.trigger(MyApp.full_map.mapa, "resize");
                //MyApp.full_map.mapa.setCenter(MyApp.full_map.homeMarker.getPosition());
                google.maps.event.addListenerOnce(MyApp.full_map.mapa, 'bounds_changed', function() {
                    google.maps.event.trigger(MyApp.full_map.mapa, "resize");
                    google.maps.event.addListenerOnce(MyApp.full_map.mapa, 'idle', function(){
                        MyApp.full_map.mapa.setCenter(MyApp.full_map.homeMarker.getPosition());
                        $("#full_map_wrapperx").animate({opacity: 1}, 1000);
                    });
                });
                //google.maps.event.trigger(MyApp.full_map.mapa, "resize");
            });
            $(".close.button").on('click', function() {
                $("#full_map_frame").slideUp(1000, 'easeOutBounce', function() {
                    $("#full_map").fadeOut('slow');
                });
            });
        },
        formatNumber: function (a) {
            a += "";
            var b = /(\d+)(\d{3})/;
            while (b.test(a)) a = a.replace(b, "$1,$2");  // ',' thousand separator
            return a
        },
        parseQueryString: function (a) {
            if (a.indexOf("?") == -1) return {
                date: "recent"
            };
            var b = {};
            return _.each(a.split("?")[1].split("&"), function (a) {
                var c = a.split("=");
                b[c[0]] = c[1]
            }), b
        },
        overview: function () {
            return {
                views: this.formatNumber(this.today.views),
                people: this.formatNumber(this.today.people)
            }
        },
        corelator: function(view, data, partials)
        {
                switch($(view).attr('data-type')) {
                    case 'gauge':
                        console.log("poner un gauge");
                        break;
                };
        },
        // public function for adding views
        // can take a name and view string arguments
        // or can take an object with name/view pairs
        // We're enforcing uniqueness to avoid accidental view overwrites.
        // If you want a different view, it should have a different name.
        addView: function (name, viewString) {
            var that = this;
            if (typeof name === 'object') {
                for (var view in name) {
                    this.addView(view, name[view]);
                }
                return;
            }
            if (that.views[name]) {
                console.error("Invalid name: " + name + ".");
            } else if (that.views.code[name]) {
                console.error("Template \"" + name + "  \" exists");
            } else {
                that.views.code[name] = viewString;
                that.views[name] = function (data, raw) {
                    data = data || {};
                    var result = that.corelator(that.views.code[name], data, that.views.code);
                    return (that.views.$ && !raw) ? that.views.$(result) : result;
                };
            }
        },
        // clears all retrieval functions and empties cache
        clearAll: function () {
            for (var key in that.views.code) {
                delete that.views[key];
            }
            that.views.code = {};
        },

        // clears/grabs
        refresh: function () {
            that.clearAll();
            that.grabTemplates();
        },
        getSystemData: function(options) {
            /*
            if (data.length) {
                data = data.slice(1);
            }
            while (data.length < maximum) {
                var previous = data.length ? data[data.length - 1] : 50;
                var y = previous + Math.random() * 10 - 5;
                data.push(y < 0 ? 4 : y > 100 ? 100 : y);
            }
            // zip the generated y values with the x values
            var res = [];
            for (var i = 0; i < data.length; ++i) {
                res.push([i, data[i]])
            }
            return res;
            */
        },
        // grabs views from the DOM and caches them.
        // Loop through and add views.
        // Whitespace at beginning and end of all views inside <script> tags will
        // be trimmed. If you want whitespace around a partial, add it in the parent,
        // not the partial. Or do it explicitly using <br/> or &nbsp;
        grabTemplates: function () {
            var that = this,
                i,
                scripts = document.getElementsByTagName('script'),
                script,
                length = scripts.length,
                trash = [];
            for (i = 0; i < length; i++) {
                script = scripts[i];
                if (script && script.innerHTML && script.id && (script.type === "text/html" || script.type === "text/x-fernet")) {
                    that.addView(script.id, trim(script.innerHTML));
                    trash.unshift(script);
                }
            }
            for (i = 0; i < trash.length; i++) {
                trash[i].parentNode.removeChild(trash[i]);
            }
        },
        domready: function() {
            console.log("DOMContentLoaded starting MyApp.version: %f", this.module.VERSION);
            this.grabTemplates();
            this.init({user: 'uid'});
            $("body").height(0);
            $("#data").html(ich.greetings_template(this));
        }
    };

    MyApp = MyApp || {};

    ///////////////////////////////////////////////////////////////////////////
    // Use CommonJS if applicable                                            //
    ///////////////////////////////////////////////////////////////////////////
    console.log("using commons")
    if (typeof require !== 'undefined') {
    } else {
        window.MyApp = MyApp;
    }
    if (typeof document !== 'undefined') {
        if (MyApp.$) {
            MyApp.$(function () {
                MyApp.domready();
            });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                MyApp.domready();
            }, true);
        }
    }
})(window.jQuery || window.Zepto);

$(document).ready(function() {
    "use strict";
    console.log("starting sockets")
    if (typeof io !== 'object')
    {
        return false;
    }

    var timer = null;
    var socket = io.connect('http://127.0.0.1:8080', {
        closeTimeout: 2000,
    });
    socket.on('consoleio', function (data) {
        switch(data.message)
        {
            case 'heartbeat':
                //echo("[[b;#777;]heartbeat]")
                break;
            case 'exec':
                switch(data.io)
                {
                    case 'stdout':
                        echo(data.result);
                        //console.log(data);
                        break;
                    case 'stderr':
                        echo("[[b;#f00;]" + data.result +"]");
                        //console.log(data.result);
                        break;
                }
                break;
            default:
                break;
        }
        function echo(message)
        {
            // TODO setup a proper debug console
            // outp !== '' ? outp : JSON.stringify(data)
            if(typeof window.terminal !== 'undefined') {
                window.terminal.echo(message);
                window.terminal.resume();
            }
            else {
                console.log(message);
            }
        }
    });
    socket.on('connect', function() {
        console.log("socket.connected");
        $("html").addClass("live");
        $("li.live .status").text("on");
        timer = setInterval(function() {
            $(".indicator span").animate({backgroundColor:'##F511F5'})
            socket.emit('consoleio', { message: 'heartbeat' });
            setTimeout(function() {
                $(".indicator span").animate({backgroundColor:'#750775'})
            }, 10000);
        }, 20000);
    });
    socket.on('disconnect', function() {
        console.log("socket.disconnected")
        clearTimeout(timer);
        if(MyApp.properties.reconnect)
        {
            socket.socket.reconnect();
        }
        $("li.live .status").text("off");
        $("html").removeClass("live");
    });
    MyApp.properties.socket = socket || {};
});

///////////////////////////////////////////////////////////////////////////////
// Google MAPS bindings                                                      //
///////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
    // body...
    var distanceWidget;
    var map;
    var geocodeTimer;
    var profileMarkers = [];

    function init() {
        var mapDiv = document.getElementById('map_canvas');
        var myLatlng = new google.maps.LatLng(-34.6036, -58.3817);
        map = new google.maps.Map(mapDiv, {
            center: myLatlng,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        draggable: true,
        title: 'Move me!',
        icon: 'images/markers/anniversary.png'
    });

    distanceWidget = new DistanceWidget({
        map: map,
        distance: 5, // Starting distance in km.
        maxDistance: 10, // Twitter has a max distance of 2500km.
        color: '#2f0929',
        activeColor: '#e97ad8',
        fillColor: '#e97ad8',
        fillOpacity: 0.25,
        sizerIcon: new google.maps.MarkerImage('/images/radius-resize-off.png'),
        activeSizerIcon: new google.maps.MarkerImage('/images/radius-resize.png'),
        homeMarker: marker,
    });

    google.maps.event.addListener(distanceWidget, 'distance_changed',  function() {
        console.log("distance change");
        updateDistance();
    });

    google.maps.event.addListener(distanceWidget, 'position_changed', function() {
        console.log("position change");
    });

    map.fitBounds(distanceWidget.get('bounds'));

    $("#new_radius").slider({
        slide: function( event, ui ) {
            console.log(ui.value)
            distanceWidget.set('distance', ui.value);
            map.fitBounds(distanceWidget.get('bounds'));
        }
    });
  //updateDistance();
  //updatePosition();
  //addActions();
}

function updateDistance() {
    var distance = distanceWidget.get('distance');
    $("#new_radius").slider({value: distance})
}

function addActions() {
}


function clearMarkers() {
    for (var i = 0, marker; marker = profileMarkers[i]; i++) {
        marker.setMap(null);
    }
}



google.maps.event.addDomListener(window, 'load', init);
});


(function(root, factory) {
  'use strict';

  if(typeof root.exports === 'function') {
    // Node/CommonJS
    root.exports.Mediator = factory();
  } else if(typeof root.define === 'function' && root.define.amd) {
    // AMD
    root.define(factory());
  } else {
    // Browser global
    root.Mediator = factory();
  }
}(this, function() {
    "use strict";

    var container = '#realtime';
    // Determine how many data points to keep based on the placeholder's initial size;
    // this gives us a nice high-res plot while avoiding more than one point per pixel.
    var maximum = 250;
    var data = [];
    var times = [];
    var date = new Date();
    var timeUnitSize = {
        "second": 1000,
        "minute": 60 * 1000,
        "hour": 60 * 60 * 1000,
        "day": 24 * 60 * 60 * 1000,
        "month": 30 * 24 * 60 * 60 * 1000,
        "quarter": 3 * 30 * 24 * 60 * 60 * 1000,
        "year": 365.2425 * 24 * 60 * 60 * 1000
    };
    function TimeChart() {
        if ( !(this instanceof TimeChart) ) {
            return new TimeChart();
        } else {
            this.container = container || "";
            this._callbacks = [];
            this.timer = null;
            this.stopped = false;
        }
    };
    function getRandomData() {
        var deferred = new jQuery.Deferred();
        if (data.length) {
            data = data.slice(1);
            times.shift();
        }
        while (data.length < maximum) {
            var previous = data.length ? data[data.length - 1] : 50;
            var y = previous + Math.random() * 10 - 5;
            data.push(y < 0 ? 4 : y > 100 ? 100 : y);                            
            date.setMinutes(date.getMinutes() + 1)
            times.push(date.getTime());
        }
        // zip the generated y values with the x values
        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([times[i], data[i]])
        }
        deferred.resolve(res);
        deferred.promise();
    }
    TimeChart.prototype = {

    }
    var series = [{
        data: getRandomData(),
        lines: {
            fill: true,
            color: "#000",
            fillColor: { colors: [{ opacity: 0.5 }, { opacity: 0 } ] }
        },
        color: "#D355D3",
    }];

    var MyOptions = {
        grid: {
            borderWidth: 1,
            minBorderMargin: 20,
            labelMargin: 10,
            backgroundColor: {
                colors: ["#fff", "#DDA5C6"]
            },
            borderColor: '#d30cd3',
            hoverable: true,
            mouseActiveRadius: 50,
            margin: {
                top: 8,
                bottom: 20,
                left: 20,
            },
            markings: function(axes) {
                var markings = [];
                var xaxis = axes.xaxis;
                var tick = timeUnitSize[xaxis.tickSize[1]] * xaxis.tickSize[0] ;
                var then = new Date(times[0]);
                var now = new Date(times[times.length - 1]);

                for (var x = then.getTime(); x < now.getTime(); x += tick * 2) {
                    
                    var mils = 1000 - new Date(x).getMilliseconds()
                    var secs = 60 - new Date(x).getSeconds();
                    var mins = (60 - new Date(x).getMinutes()) % 30;
                    var next = (60 - new Date(then).getMinutes());
                    var unti = mils + ((secs -1) * 1000) + ((mins - 1) * 60 * 1000);
                    if(next < 30){
                        markings.push({
                            xaxis: { 
                                from: new Date(x).getTime() + (unti - tick), 
                                to: new Date(x).getTime() + unti,
                            }, 
                            color: "rgba(204, 102, 188, 0.2)" 
                        });
                    } else {
                        var unti = mils + ((secs -1) * 1000) + ((next - 1) * 60 * 1000);
                        markings.push({
                            xaxis: { 
                                from: new Date(x).getTime() - ((tick * 2 ) - unti) - tick, 
                                to: new Date(x).getTime() - ((tick * 2 ) - unti),
                            }, 
                            color: "rgba(204, 102, 188, 0.2)" 
                        });
                    }
                }
                return markings;
            }
        },
        yaxis: {
            min: 0,
            max: 110,
            color: '#9A338A',
        },
        xaxis: {
            mode: "time",
            timeformat: "%H:%M",
            min: (new Date(times[0])).getTime(),
            max: (new Date(times[times.length - 1])).getTime(),
            minTickSize: [1, "minute"],
            tickSize: [30, 'minute'],
            color: '#9A338A',
        },
        legend: {
            show: true,
            color: '#f00'
        }
    };
    var plot = $.plot(container, series, MyOptions);
    setInterval(function updateRandom() {
        
        $.when(getRandomData()).then( function(data){
            series[0].data = data;
            var options = $.extend({}, MyOptions, {
                xaxis: {
                    mode: "time",
                    timeformat: "%H:%M",
                    min: (new Date(times[0])).getTime(),
                    max: (new Date(times[times.length - 1])).getTime(),
                    minTickSize: [1, "minute"],
                    tickSize: [30, 'minute'],
                    color: '#9A338A'
                }
            });
        });
        
        var plot = $.plot(container, series, options);
        plot.draw();
    }, 1000);


    return TimeChart;
}));
