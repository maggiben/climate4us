///////////////////////////////////////////////////////////////////////////////
// @file         : application.js                                            //
// @summary      : client side application                                   //
// @version      : 0.15                                                      //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Dec 2012                                               //
// @dependencies                                                             //
//  jQuery       : 1.8.2                                                     //
//  jQuery.UI    : 1.9.1                                                     //
//  ICanHaz      : 0.10                                                      //
//  Sammy        : 0.7.2                                                     //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2012 Benjamin Maggi, all rights reserved.            //
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
    ///////////////////////////////////////////////////////////////////////////
    // Station class                                                         //
    // This object stores all information regarding the weather station      //
    // It has no data bindings to UI                                         //
    ///////////////////////////////////////////////////////////////////////////
    var Station = function(arg) {
        this.setup(arg);
    };   
    $.extend(Station.prototype, {
        module: { 
            VERSION: "0.11",
            license: {},
            dependencies: {},
            author: "BM",
        },
        properties: {
            name: '',
            id: 0,
            _id: 0,
            type: '',
            country: '',
            state: '',
            city: '',
            latitude: 0,
            longitude: 0,
            magic: 1234,
            sensors: [],
            created: null,
            lastUpdate: new Date(),
            lastAccess: new Date(),
            isReady: false,
            overview: true,
            mine: true,
            temperature: {
                value: 0, 
                unit: 'C'
            },
            feelslike: {},
            humidity: { 
                value: 0, 
                dewpoint: 0, 
                unit: 'RH' 
            },
            wind: { 
                value: 0, 
                direction: 'SE', 
                degrees: 150, 
                unit: 'KMH' 
            },
            rainfall: { 
                value: 0, 
                unit: 'MM' 
            },
            pressure: { 
                value: 0, 
                unit: 'INHG', 
                type: 'relative' 
            }, 
            visibility: { 
                value: 0, 
                unit: 'KM' 
            },
            astronomy: { 
                sunrise: "08:01", 
                sunset: "16:42" 
            },
            forecast:[
                {
                    day: "Today",
                    condition: "",
                    high_temperature: 0.00,
                    low_temperature: 0.00
                },
                {
                    day: "Tomorrow",
                    condition: "",
                    high_temperature: 0.00,
                    low_temperature: 0.00
                }
            ],
        },
        setup: function (options) {
            var options = $.extend({}, this.properties, options);
            var that = this;
            that.id = options._id;
            $.ajax({
                url: "/station/getbyid/" + options._id,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    that.properties = $.extend({}, that.properties, data);
                    that.properties.id = that.properties._id;
                    options.onLoad(that.properties);
                },
                
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
                complete: function () {                                
                }
            });
        },
        /*
        setupx: function (a) {
            var that = this;
            that.id = a._id;
            $.ajax({
                url: "/station/getbyid/" + a._id,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    //console.log("Station[" + data._id + "] successfully created");
                    that._id = data._id,
                    that.id = data._id,
                    that.name = data.name;
                    that.type = data.type;
                    that.temperature = data.temperature;
                    that.humidity = data.humidity;
                    that.latitude = data.latitude;
                    that.longitude = data.longitude;
                    //Preserve the original defaults by passing an empty object as the target
                    //that = $.extend({}, that, data);
                    a.onLoad(that);
                },
                
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    alert(c.errors);
                },
                complete: function () {                                
                }
            });
        },
        */
        update: function (a) {
            var that = this;
            $.ajax({
                url: "/station/update/" + that.id,
                type: "post",
                dataType: "json",
                data: that,
                success: function(data, textStatus, jqXHR) {
                    console.log("data back: " + JSON.stringify(data));
                },
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    alert(c.errors);
                },
                complete: function () {                                
                }
            });
        },        
        // getters
        getTemperature: function () { 
            return this.temperature; 
        },
        getPressure: function () { 
            return this.pressure; 
        },
        getHumidity: function () { 
            return this.humidity; 
        },
        getWind:  function () { 
            return this.wind; 
        },
        getWindDirection:  function () { 
            return this.wind.direction; 
        },
        // setters
        setTemperature: function (temperature) {
            this.temperature = temperature; 
        },
        setPressure: function (pressure) { 
            this.pressure = pressure; 
        },
        setHumidity: function (humidity) { 
            this.humidity = humidity; 
        },
        setWind:  function (wind) { 
            this.wind = wind; 
        },
    });
    ///////////////////////////////////////////////////////////////////////////
    // Subscription class                                                    //
    ///////////////////////////////////////////////////////////////////////////
    var myApplication = function(options) {
        this.init(options);
    };
    $.extend(myApplication.prototype, {
        module: { 
            VERSION: "0.10",
            license: {},
            dependencies: {},
            author: "",
        },
        settings: $.observable({
            timeout: 500,
            debug: true,
            producction: false,
            instances: 1
        }),
        properties: {
            _id: null,
            name: 'lab',
            type: 'subscription',
            magic: null,
            created: null,
            lastUpdate: null,
            lastAccess: null,
            isReady: false,
            stations: [],
            order: [],
            selected: null,
        },
        onSetup: null,
        init: function (options) {
            var that = this;
            //Preserve the original defaults by passing an empty object as the target
            var options = $.extend({}, this.properties, options);
            $.ajax({
                url: "/subscription/getbyid/" + options._id,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    that.properties = $.extend({}, that.properties, data);
                    that.setup(that.properties, options.callback);
                    //options.callback(that.properties);
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
                complete: function () {
                }
            });
        },
        setup: function (properties, callback) {
            var that = this;
            /*
            this.properties.order.forEach(function(_id) {
                console.log("getting stations:")
                console.log(_id)
                $.ajax({
                    url: "/station/getbyid/" + _id,
                    type: "GET",
                    dataType: "json",
                    success: function (data, textStatus, jqXHR) {
                        that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //that.stations[b[i]._id] =                   
                        function onLoad(station) {
                            station.isReady = true;
                            //callback(station);
                        }
                    },
                    error: function (jqXHR, status, error) {
                        console.log(jqXHR.responseText);
                    },
                    complete: function () {
                    }
                });
            });
            */
            var queue = $.jqmq({
                delay: -1,
                batch: 1,
                callback: function( _id ) {
                    $.ajax({
                        url: "/station/getbyid/" + _id,
                        type: "GET",
                        dataType: "json",
                        success: function (data, textStatus, jqXHR) {
                            that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //that.stations[b[i]._id] =                   
                            function onLoad(station) {
                                console.log("data is in queue");
                                station.isReady = true;
                            }
                        },
                        error: function (jqXHR, status, error) {
                            console.log(jqXHR.responseText);
                            queue.next(true);
                        },
                    });
                },
                complete: function(){
                    callback(that.properties);
                }
            });
            this.properties.order.forEach(function(_id) { queue.add(_id) });
        },
        getAllStations: function(options, callback)
        {
            var that = this;
            this.properties.order.forEach(function(_id) {
                $.ajax({
                    url: "/station/getbyid/" + _id,
                    type: "GET",
                    dataType: "json",
                    success: function (data, textStatus, jqXHR) {
                        that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //that.stations[b[i]._id] =                   
                        function onLoad(station) {
                            station.isReady = true;
                            callback(station);
                        }
                    },
                    error: function (jqXHR, status, error) {
                        console.log(jqXHR.responseText);
                    },
                    complete: function () {
                    }
                });
            });
        },
        setup2: function (a) {
            var that = this;
            //this.properties = $.observable(this.properties);
            this.onSetup = a.onSetup;
            this.properties.order.forEach(function(_id) {
                console.log("loading station _id: " + _id);
                $.ajax({
                    url: "/station/getbyid/" + _id,
                    type: "GET",
                    dataType: "json",
                    success: function (data, textStatus, jqXHR) {
                        console.log("/station/getbyid---: " + JSON.stringify(data._id));
                        that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //that.stations[b[i]._id] = 
                        console.log("Attaching station id: " + that.properties.stations[data._id].id);
                        
                        function onLoad(station) {
                            station.isReady = true;
                            console.log("is onLoad ready: " + station.isReady + " id: " + station._id);
                            a.onSetup(station);
                        }
                    },
                    error: function (jqXHR, status, error) {
                        console.log(jqXHR.responseText);
                    },
                    complete: function () {
                    }
                });
            });
        },
        setupOLD: function (a) {
            this.onSetup = a.onSetup;
            var that = this;
            $.ajax({
                url: "/station/getall",
                type: "GET",
                dataType: "json",
                success: function (b) {
                    for (var i = 0; i < b.length; i++) {
                        that.properties.stations[b[i]._id] = new Station({_id: b[i]._id, type: b[i].type, onLoad: onLoad}); //that.stations[b[i]._id] = 
                        console.log("Attaching station id: " + that.properties.stations[b[i]._id].id);
                    }
                    function onLoad(station) {
                        station.isReady = true;
                        console.log("is onLoad ready: " + station.isReady + " id: " + station._id);
                        a.onSetup(station);
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
                complete: function () {                                
                }
            });
        },
        listStations: function (a) {
            for (var key in this.properties.stations)
            {
                if (this.properties.stations.hasOwnProperty(key))
                {
                    console.log("key: " + key);
                }
            }
            return !1;
        },
        getStationById: function(id) {
            console.log("getStationById(%s)", id);
            console.log("getStationById(%s) = %s", id, JSON.stringify(this.properties.stations[id]));
            return this.properties.stations[id].properties;
        },
        getAllStationsIds: function() {
            var stations = [];
            for (var station in this.properties.stations)
            {
                if (this.properties.stations.hasOwnProperty(station))
                {
                    stations.push(station);
                }
            }
            return stations;
        },
        getStations:  function (callback) {
            var that = this;
            $.ajax({
                url: "/getStations",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function (jqXHR, status, error) {
                    //var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                }
            });
        },
        getSelected: function() {
          return this.properties.selected;
        },
        removeStations: function(ids, callback) {
            for (var id in ids)
            {
                if (ids.hasOwnProperty(id))
                {
                    this.removeStation(id, function(station) {
                    });
                }
            }
        },
        removeStation: function(id, callback) {
            var that = this;
            $.ajax({
                url: "/station/remove/" + id,
                type: "delete",
                dataType: "json",
                data: {},
                success: function (data, textStatus, jqXHR) {
                    delete that.properties.stations[data._id];
                    console.log("removed id: " + JSON.stringify(data));
                    callback(data);
                },
                error: function (jqXHR, status, error) {
                    var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                }
            }), !1;
        },
        addStation: function(station, callback) {
            var that = this;
            $.ajax({
                url: "/station/add",
                type: "POST",
                dataType: "json",
                data: station,
                success: function (data, textStatus, jqXHR) {
                    //new Station({_id: data._id, type: data.type, onLoad: onLoad});
                    that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad});
                    function onLoad(station) {
                        station.isReady = true;
                        callback(data);
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                }
            }), !1;
        },
        setSelected: function(id) {
            var that = this;
            that.update(onUpdate);
            function onUpdate(data)
            {
                that.selected = id;
                console.log("subscription update ok! result: " + data);
            };
        },
        update: function(callback) {
            var that = this;
            console.log("subscription update");
            $.ajax({
                url: "/subscription/update/" + this._id,
                dataType: "json",
                type: "put",
                data: that,
                success: function (data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function (jqXHR, status, error) {
                    var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                },
            });
        },
    });


    ///////////////////////////////////////////////////////////////////////////
    // Sammy.JS application                                                  //
    ///////////////////////////////////////////////////////////////////////////
    var app = $.sammy(function() {
        //this.element_selector = '#main';
        this.bind('getSubscription', function(e, data) {
            //console.log("getSubscription");
            MyApp.subscription = new myApplication({onSetup: onSetup});
            function onSetup(a) {
                console.log("onSetup: " + JSON.stringify(a));
                $("#sites").append(ich.site_template(a));
                $("#s" + a.id).html(ich.station_preview_template(a));
                //MyApp.meldSidebar();
            };
        });
        this.bind("station.setup", function(e, data) {
            console.log("station.setup: " + JSON.stringify(data));
            var site = $("#s" + data.id);
            if (site.hasClass("current"))
            {
                return !0;
            }
            var station_template = ich.site_template(data);
            $(station_template).appendTo('#sites').hide().fadeIn('slow');
            //$("#sites").append(ich.site_template(data));
            $("#s" + data.id).html(ich.station_preview_template(data));
            //this.trigger("show_station.g");
            //this.trigger('showSite', {my_data: this.params});
            $("div.site.current").removeClass("current");
            site.addClass("current");
            $("#data").html(ich.site_data_template(data)); 
            $("body").addClass("view-nav");
        });
        this.bind('showSite', function(e, data) {
            var a = this;
            var b = $("#s" + data['my_data'].id);
            if (b.hasClass("current")) return !0;
            $("div.site.current").removeClass("current");
            b.addClass("current");
            $("#data").html(ich.site_data_template({title: "hello", id: 1234, mine: false}));
            //$("#data").html(ich.site_data_template(this)), 
            //$("body").addClass("view-nav");
            //alert(data['my_data'].id);
        });
        this.bind("show_station.g", function(e, data) {
            console.log("show_station.g: " + JSON.stringify(data));
            var station = $("#s" + data.id);
            if (station.hasClass("current"))
            {
                return !0;
            }
            $("div.site.current").removeClass("current");
            station.addClass("current");
            $("#data").html(ich.site_data_template(MyApp.subscription.getStationById(data.id))); 
            $("body").addClass("view-nav");
        });
        this.bind("show_panel.g", function (e, data) {
            console.log("show_panel.g: " + JSON.stringify(data));
            var b = this;
            var c = $("#s" + data.id);
            var d = data == c.data("panel") ? $("#site_content div.display").scrollTop() : 0;
            b.trigger("show_station.g", data), 
            c.data("panel", data);
            $("#data div.nav li.current").removeClass("current"); 
            $('#data div.nav a[href="#/station/' + data.id + "/" + data.path + '"]').closest("li").addClass("current");
            switch (data.path) {
                case "overview":
                    console.log("[overview]");
                    $("#site_content").html(ich.overview_template(MyApp.subscription.getStationById(data.id)));
                    var placeholder = $("#placeholder");
                    var d1 = [];
                    for (var i = 0; i < Math.PI * 2; i += 0.25)
                        d1.push([i, Math.sin(i)]);
                    
                    var d2 = [];
                    for (var i = 0; i < Math.PI * 2; i += 0.25)
                        d2.push([i, Math.cos(i)]);
                
                    var d3 = [];
                    for (var i = 0; i < Math.PI * 2; i += 0.1)
                        d3.push([i, Math.tan(i)]);
                        
                    var options = {
                        series: {
                            lines: { show: true },
                            points: { show: true }
                        },
                        xaxis: {
                            ticks: [0, [Math.PI/2, "\u03c0/2"], [Math.PI, "\u03c0"], [Math.PI * 3/2, "3\u03c0/2"], [Math.PI * 2, "2\u03c0"]]
                        },
                        yaxis: {
                            ticks: 10,
                            min: -2,
                            max: 2
                        },
                        grid: {
                            backgroundColor: { colors: ["#fff", "#eee"] }
                        }
                    }
                    
                    var data = [
                        { label: "sin(x)",  data: d1},
                        { label: "cos(x)",  data: d2},
                        { label: "tan(x)",  data: d3}
                    ];
                    //$.plot($("#placeholder"), [ [[0, 0], [1, 1], , [2, 3]] ], { yaxis: { max: 1 } });
                    var plot = $.plot(placeholder, data, options);
                    
                    break;
                case "code":
                    console.log("[code]");
                    $("#site_content").html(ich.my_info_template(this));
                    break;
                case "live":
                    var e = this;
                    $("#site_content").html(ich.live_data_template(this))
                    var options = {
                        zoom: 8,
                        center: new google.maps.LatLng(-34.6036, -58.3817),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new window.map({id: "map_wrapper", latitude: -34.6036, longitude: -58.3817, mapOptions: options});
                    break;
                case "settings":
                    console.log("[settings]");
                    $("#site_content").html(ich.station_settings_template(MyApp.subscription.getStationById(data.id)));
                    break;
                case "sensors":
                    $("#site_content").html(ich.station_sensors_template(MyApp.subscription.getStationById(data.id)));
                    var temperature_gauge = new JustGage({
                      id: "temperature.gauge", 
                      value: getRandomInt(0, 100), 
                      min: -30,
                      max: 100,
                      title: "Temperature",
                      label: "C°"
                    });
                    var humidith_gauge = new JustGage({
                      id: "humidity.gauge", 
                      value: getRandomInt(0, 100), 
                      min: 0,
                      max: 100,
                      levelColors: ["#6996D3", "#0F4FA8", "#05316D"], 
                      title: "Humidity",
                      label: "RH"
                    });
                    setInterval(function() {
                        temperature_gauge.refresh(getRandomInt(50, 100));
                        humidith_gauge.refresh(getRandomInt(70, 100));
                    }, 2500);
                    break;
                case "terminal":
                    $("#site_content").html(ich.station_terminal_template(MyApp.subscription.getStationById(data.id)));
                    $(function($, undefined) {
                        $('#terminal').terminal( function(command, term) {
                            if (command !== '') {
                                /*
                                try {
                                    var result = window.eval(command);
                                    if (result !== undefined) {
                                        term.echo(new String(result));
                                    }
                                } catch(e) {
                                    term.error(new String(e));
                                }
                                */
                                var shellstring = command.split(" ");
                                var cmd = shellstring.splice(0,1).toString();
                                var args = [];
                                shellstring.forEach(function(arg) {
                                    args.push(arg);
                                });
                                MyApp.properties.socket.emit('consoleio', { message: 'exec', command: cmd, arguments: args})
                                term.pause();
                            } else {
                                term.echo('');
                            }
                        }, {
                        greetings: '[[b;#ccc;#750775]Node Terminal]',
                        name: 'consoleio',
                        height: 400,
                        prompt: '# ',
                        onInit: function(terminal) { console.log("console.init()"); window.terminal = terminal || {} }
                        });
                    });
                    break;
                case "srcedit":
                    $("#site_content").html(ich.station_srceditor_template(MyApp.subscription.getStationById(data.id)));
                    var editor = CodeMirror.fromTextArea(document.getElementById("code_editor"), {
                        lineNumbers: true,
                        theme: 'monokai'
                    });
                    break;
            }
            $("body").addClass("view-panel");
            $("#site_content div.display").scrollTop(d);
        });
        this.bind("station_teardown.g", function(event, data) {
            console.log("station_teardown.g id: " + JSON.stringify(data));
            var a = $("#s" + data.id);//.css({height: 0,opacity: 0});
            setTimeout(function() {
                a.hide('slow', function(){ $(this).remove();});
                //a.hide('slow', function(){ $(this).remove();});
                //a.remove()
            }, 500);
            //delete Gauges.sites[this.id]
        });
        this.get(/\#\/sites\/(.*)/, function () {
            //this.redirect("#", "gauges", this.params.splat)
            alert(this.params.splat);
        });
        this.get("#/", function (a) {
            $("body").removeClass("no_cancel").removeClass("my_account");
            $.trim($("#data").html()) == "" && $("#sites div.site:first a").length > 0 && a.redirect($("#sites div.site:first a").attr("href"))
        });
        ///////////////////////////////////////////////////////////////////////
        // Account Routes                                                    //
        ///////////////////////////////////////////////////////////////////////
        this.get("#/account", function() {
            $("body").removeClass("adding"), 
            $.ajax({
                url: "/subscription",
                dataType: "json",
                success: function(a) {
                    //Gauges.subscription = new Subscription(a.subscription)
                }
            });
            $("#sites div.current").removeClass("current"), 
            $("#data").html(ich.account_template(MyApp.user)), 
            $('div.nav a[href="#/account"]').closest("li").addClass("current"), 
            $("#site_content").html(ich.my_info_template(MyApp.user))
        });
        this.get("#/account/clients", function() {
            $("body").removeClass("adding"), 
            $("#sites div.current").removeClass("current"), 
            $("#data").html(ich.account_template(MyApp.user)), 
            $('div.nav a[href="#/account/clients"]').closest("li").addClass("current"), 
            $("#site_content").html(ich.clients_template(MyApp.user)), 
            $("#site_content").find("input[title]").labelize(), 
            MyApp.clients == null ? $.ajax({
                url: "/clients",
                dataType: "json",
                type: "get",
                success: function(data, textStatus, jqXHR) {
                    MyApp.clients = data.clients, 
                    $("#clients_list").removeClass("loading").html(ich.clients_list_template(MyApp))
                },
                error: function(jqXHR, status, error) {
                    $("#clients_list").removeClass("loading").addClass("empty").text("Could not load API Keys");
                }
            }) : $("#clients_list").removeClass("loading").html(ich.clients_list_template(MyApp));
        });
        this.post("#/account/clients", function() {
            console.log("targent: " + this.target);
            window.kaka = this.target;
            var a = $(this.target).removeErrors(), 
            b = a.find("button span");
            clearTimeout(b.data("timeout")), 
            b.data("text") === undefined && b.data("text", b.text()), 
            b.text("Creating..."), 
            $.ajax({
                url: "/clients",
                dataType: "json",
                type: "post",
                data: {
                    description: this.params.description
                },
                success: function(b) {
                    MyApp.clients == null && (MyApp.clients = []), 
                    MyApp.clients.push(b.client), 
                    a.find("input[type=text]").val("").blur(), 
                    $("#clients_list").removeClass("loading").html(ich.clients_list_template(MyApp))
                },
                error: function (jqXHR, status, error) {
                    //var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                    //a.displayErrors("jqXHR.responseText"), 
                    a.displayErrors({description: ["Could not find that Email"]});
                    b.text(b.data("text"))
                },    
                /*error: function(c) {
                    
                    var d = $.parseJSON(c.responseText);
                    a.displayErrors(d.errors), b.text(b.data("text"))
                },*/
                complete: function() {
                    b.text("Created"), 
                    setTimeout(function() {
                        b.text(b.data("text"))
                    }, 2e3)
                }
            })
        });
        this.del("#/account/clients/:key", function() {
            var a = $(this.target).removeErrors(), 
            b = a.find("button span");
            clearTimeout(b.data("timeout")), 
            b.data("text") === undefined && b.data("text", b.text()), b.text("Removing"), 
            $.ajax({
                url: "/clients/" + this.params.key,
                dataType: "json",
                type: "delete",
                success: function(a) {
                    MyApp.clients = $.compact($.map(MyApp.clients, function(b) {
                        if (b.key != a.client.key)
                            return b
                    })), 
                    $("#clients_list").html(ich.clients_list_template(MyApp))
                }
            })
        });
        ///////////////////////////////////////////////////////////////////////
        // Session Routes                                                    //
        ///////////////////////////////////////////////////////////////////////
        this.get('#/sign_out', function() {
            $.ajax({
                    url: "/signout",
                    type: "GET",
                    complete: function () {
                        window.location = "/signin";
                    }
            });
            $("body").addClass("loading").removeClass("loaded");
        });
        ///////////////////////////////////////////////////////////////////////
        // Station Routes                                                    //
        ///////////////////////////////////////////////////////////////////////
        this.get('#/station/new', function() {
            $("body").addClass("adding");
        });
        this.post('#/station', function () {
            var that = this;
            var a = $(this.target).removeErrors();
            var b = a.find(".submit button span");
            clearTimeout(b.data("timeout"));
            b.data("text") === undefined && b.data("text", b.text()); 
            b.text("Adding...");
            $.ajax({
                url: "/station/add",
                type: "post",
                dataType: "json",
                data: { 
                    name: that.params.name,
                    type: that.params.type,
                    country: that.params.country,
                },
                success: function (data, textStatus, jqXHR) {
                    //console.log("server respose: " + JSON.stringify(b));
                    var c = data;
                    // todo use getters instead of direct property access in this case the array 
                    MyApp.subscription.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //
                    function onLoad(station) {
                        $("#new_title").val("");
                        that.trigger('station.setup', station);
                        setTimeout(function () {
                            window.location.hash = "/station/" + station._id + "/code";
                            $.scrollTo("#s" + station._id, 800);
                        }, 400); 
                        console.log("onLoad id: " + station._id);
                        //$.scrollTo("#s" + station._id, 800);
                        $("body").removeClass("adding");
                        a.removeErrors();
                        //that.trigger('station.setup', station);
                    }
                },
                error: function (b) {
                    //var c = $.parseJSON(b.responseText);
                    a.displayErrors(c.errors);
                },
                complete: function () {
                    b.text(b.data("text"));
                }
            }), !1;
        });
        this.get("#/station/:id/:path", function () {
            //return;
            //var a = MyApp.stations[this.params.id];
            console.log("sammy route: #/station/%s/%s", this.params.id, this.params.path);
            //var a = MyApp.subscription.getStationById(this.params.id);
            //console.log("MyApp.subscription.getStationById = " + JSON.stringify(a));
            //alert(typeof this.params.id);
            //alert(MyApp.subscription.stations[this.params.id].name);
            var station = MyApp.subscription.getStationById(this.params.id);//stations[this.params.id];
            //MyApp.subscription.setSelected(this.params.id);
            console.log("MyApp.subscription.stations[%s].name = %s", this.params.id, station.name);
            //alert("#/station/%s/%s",typeof a, this.params.path);
            //this.params.path == "overview" && a.setRecentTraffic();
            //this.trigger('station.setup', station);
            //this.trigger('station.setup', MyApp.subscription.stations[this.params.id]);
            this.trigger("show_panel.g", this.params); 
            MyApp.meldSidebar();
        });
        this.get('#/station/:id/code/:tab', function () {
            alert("caca");
            console.log("new tab params: " + JSON.stringify(this.params));
            var station = MyApp.subscription.stations[this.params.id];
            console.log("server respose: " + JSON.stringify(b));
            /*
            var a = MyApp.sites[this.params.id];
            */        
            //a.trigger("show_panel.g", ["code"]); 
            $("#site_content div.panel").hide();
            $("#site_content ul.group_options li").removeClass("current"); 
            $("#site_content div.panel." + this.params.tab).show();
            $("#site_content ul.group_options li." + this.params.tab).addClass("current"); 
            MyApp.meldSidebar();
        });
        this.get("#/deleting", function() {
        });
        this.del("#/station/remove/:id", function() {
            var that = this;
            var a = $(this.target).removeErrors(), b = a.find(".submit button span");
            b.text("Deleting..."), window.location.hash = "/deleting", 
            $.ajax({
                url: "/station/remove/" + this.params.id,
                dataType: "json",
                type: "delete",
                success: function(data, textStatus, jqXHR) {
                    var station = data.station;
                    console.log("remove server respose: " + JSON.stringify(data));
                    //var c = Gauges.sites[b.id];
                    that.trigger("station_teardown.g", that.params), 
                    $("#data").html(ich.deleted_site_template(b)), 
                    window.location.hash = "/"
                }
        });
    })
        // Station routes
    });
    $(function() {
        app.run();
        //app.trigger('getSubscription', {time: new Date()});
    });
    
    ///////////////////////////////////////////////////////////////////////////
    // Main Client application                                               //
    ///////////////////////////////////////////////////////////////////////////
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
            console.log("MyApp.options")
            this.getUser({callback: gotUser})
            
            function gotUser(account)
            {
                //MyApp.subscription = new myApplication({_id: that.user.subscription, callback: onInit});
                that.user.subscriptions.forEach(function(_id) {
                    that.getSubscription({_id: _id, callback: gotSubscription});
                });
                
                function gotSubscription(subscription) {
                    console.log("subscription._id: " + subscription._id);
                    MyApp.subscriptions[subscription._id] = new myApplication({_id: subscription._id, callback: onInit});
                    console.log("MyApp.subscriptions[%s] = %s", subscription._id, JSON.stringify(MyApp.subscriptions[subscription._id].module));
                }
                
                function onInit(subscription)
                {
                    //MyApp.subscriptions['50dfa3ce09556aa365000004'].properties.stations['50e9be722eda7b7a55000002']
                    console.log("stations: " + JSON.stringify(MyApp.subscriptions[subscription._id].properties.stations));
                    
                    console.log(MyApp.subscriptions[subscription._id].properties.stations);
                    
                    /*
                    subscription.order.forEach(function(_id) {
                        console.log("station._id: " + _id);
                        console.log("names: " + sub.selected);
                        //$("#sites").append(ich.site_template(a));
                        //$("#s" + a.id).html(ich.station_preview_template(a));
                    });
                    */
                    MyApp.subscriptions[subscription._id].properties.stations.forEach(function(_id) {
                        console.log("XXXXstation._id: " + _id);
                    });
                }
                /*
                function onSetup(a) {
                    console.log("onSetup: " + JSON.stringify(a));
                    $("#sites").append(ich.site_template(a));
                    $("#s" + a.id).html(ich.station_preview_template(a));
                    //MyApp.meldSidebar();
                };
                */
            }
            return;
            var that = this;
            MyApp.subscription = new myApplication({onSetup: onSetup});
            function onSetup(a) {
                $("#sites").append(ich.site_template(a));
                $("#s" + a.id).html(ich.station_preview_template(a));
            };
        },
        start: function(options) {
            var that = this;
            //a === 0 ? app.runRoute("get", "#/map") : window.location.hash == "#/" && (window.location.hash = "");
            //jQuery.get('http://laboratory.bmaggi.c9.io/cors.php', null, function(data){alert(data);});
            // new myApplication({onSetup: onSetup});
            
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
        getSubscription: function(options) {
            var that = this;
            console.log("MyApp.getSubscription(%s)", options._id);
            $.ajax({
                url: "/subscription/getbyid/" + options._id,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    console.log(data);
                    //MyApp.user.subscription = new myApplication({_id: that.user.subscription, callback: onInit});
                    if($.isFunction(options.callback))
                    {
                        options.callback(data);
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
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
        createSubscription: function(options) {
            var that = this;
            var options = $.extend({}, this.properties, options);
            $.ajax({
                url: "/subscription/create",
                type: "POST",
                dataType: "json",
                data: options,
                success: function (data, textStatus, jqXHR) {
                    that.properties = $.extend({}, that.properties, data);
                    that.properties.isReady = true;
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
        getSettings: function(a) {
                /*
                $("#sites div.current").removeClass("current"), 
                $("#data").html(ich.account_template(Gauges.user)), 
                $('div.nav a[href="#/account"]').closest("li").addClass("current"), 
                $("#site_content").html(ich.my_info_template(Gauges.user))  
                */
        },
        meldSidebar: function () {
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
            MyApp.meldSidebar();
            
            //$("#full_map").is(":visible") && (Gauges.resize_timeout && clearTimeout(Gauges.resize_timeout), 
            //Gauges.resize_timeout = setTimeout(Gauges.showScreenMap, 300));
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
        domready: function() {
            console.log("DOMContentLoaded starting MyApp.version: %f", this.module.VERSION);
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
        //module.exports = myApplication;
    } else {
        // else attach it to the window
        console.log("attachinng plugin")
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

///////////////////////////////////////////////////////////////////////////////
// jQuery on document ready closure                                          //
// Activates UI components                                                   //
// Sets and gets default data bindings                                       //
///////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
    "use strict";
    
        ///////////////////////////////////////////////////////////////////////////
    // UI Events & UI transformations                                        //
    ///////////////////////////////////////////////////////////////////////////
    $("#new_site a.cancel").live("click", function () {
        return window.location.hash = "#/", $("body").removeClass("adding"), !1;
    });
    $("a.toggle_delete").live("click", function () {
        return $("#site_content").toggleClass("delete"), !1;
    });

    ///////////////////////////////////////////////////////////////////////////
    // Custom jQuery Functions                                               //
    ///////////////////////////////////////////////////////////////////////////
    $.fn.displayErrors = function(a, b) {
        var c = this.removeErrors();
        c.parent().addClass("error");
        for (var key in a) {
            var d = b ? b + "[" + key + "]" : key;
            var e = a[key].join(", ");
            console.log("a[%s] = %s", key, e);            
            var f = '<strong class="error_explanation">' + e + "</strong>";
            c.find('[name="' + d + '"]').addClass("error").closest("p").append(f);
        }
        var g = c.closest("section");
        return g.length > 0 && g.trigger("resize.g", [c.closest(".panel").height()]), this;
    };
    $.fn.removeErrors = function() {
        this.parent().removeClass("error").find("input.error").removeClass("error"), this.find("strong.error_explanation").remove();
        var a = this.closest("section");
        return a.length > 0 && a.trigger("resize.g", [this.closest(".panel").height()]), this;
    };
    $.fn.labelize = function() {
        return this.focus(function() {
            $(this).val() == $(this).attr("title") && ($(this).removeClass("labelized"), $(this).val(""))
        }).blur(function() {
            $.trim($(this).val()) == "" && ($(this).addClass("labelized"), $(this).val($(this).attr("title")))
        }).blur().each(function() {
            var b = $(this);
            $(this.form).submit(function($) {
                b.focus()
            })
        })
    };
    
    $("#sites").sortable({
        axis: "y",
        container: "#sites",
        opacity: 0.5,
        delay: 200,
        items: "div.site",
        start: function () {
            $("#sites").removeClass("meld");
        },
        stop: function () {
            $.ajax({
                url: "/subscription/reorder/" + MyApp.user.subscription,
                dataType: "json",
                type: "put",
                data: {
                    _id: MyApp.user.subscription,
                    ids: $.map($(this).sortable("toArray"), function (a) {
                        console.log("reorder: %s", a.replace(/^s/, ""));
                        return a.replace(/^s/, "");
                    })
                }
            }),
            MyApp.meldSidebar();
        }
    });
    $('#new_date').datepicker({
        //comment the beforeShow handler if you want to see the ugly overlay
        beforeShow: function() {
            setTimeout(function(){
                $('.ui-datepicker').css('z-index', 9999); // Fix For top(Z) dialogs
            }, 0);
        }
    }).val($.datepicker.formatDate('dd/m/yy', new Date()));
    $("li.live .status").text("off");
    $("html").removeClass("live");
    
    $(window).scroll(function() {
        var a = $(window).height()
        , docHeight = $(document).height()
        , winScrollTop = $(window).scrollTop()
        , wrapper = $("#wrapper")
        , body = $("body");
        
        if (wrapper.data("scrollTop") < winScrollTop) {
            $(document.body).height(docHeight - body.css("padding-top").replace("px", ""));
        }
        else {
            var f = body.height() - (wrapper.data("scrollTop") - winScrollTop);
            f >= wrapper.height() ? body.height(f) : body.height(wrapper.height());
        }
        wrapper.data("scrollTop", winScrollTop);
    });
    $(window).scroll(MyApp.meldSidebar).resize(MyApp.resize);
    $(function() {
        //$("#new_site .tz").append(TZ.select("new_tz")), 
        //$("body").hasClass("loading") ? MyApp.start() : auth.run(), 
        document.onmousemove = function(a) {
            window.MyApp.mousecoords.pageX = window.event ? window.event.clientX : a.pageX;
            window.MyApp.mousecoords.pageY = window.event ? window.event.clientY : a.pageY;
        }
    });
});


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
    var methods = {};
    //Set defauls for the control
    var defaults = {
        data: [],
        icon: 'images/markers/anniversary.png',
        title: 'Feria',
        width: 260,
        height: null,
        background: "#eee",
        mapOptions: {
            zoom: 8,
            center: new google.maps.LatLng(0, 0),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    };
    //Public methods 
    methods.init = function (options) {
        //Preserve the original defaults by passing an empty object as the target
        var options = $.extend({}, defaults, options);
        console.log(JSON.stringify(options));
        
        var myLatlng = new google.maps.LatLng(options.latitude, options.longitude)
        var image = 'images/markers/anniversary.png'  
        
        var map = new google.maps.Map(document.getElementById(options.id), options.mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Galaconcert',
            icon: image
        });
        google.maps.event.addListener(marker, 'click', function() {
            //infoBox.setContent(div);
            //infoBox.open(map, marker);
        });

    };
    //Public:
    methods.moveMarker = function (placeName, latlng){
        //marker.setPosition(latlng);
        //infowindow.close();
    };
    //Private:
    function makeBubble(map, index) {
        return new InfoBubble({
            map: map,
            content: '<div class="signin"><form action="/signin" method="post"><p class="phoneytext">Hello There</p></form></div>',
            position: new google.maps.LatLng(-34.6036, -58.3817),
            shadowStyle: 1,
            padding: 0,
            backgroundColor: 'rgb(57,57,57)',
            borderRadius: 4,
            arrowSize: 10,
            borderWidth: 1,
            borderColor: '#2c2c2c',
            disableAutoPan: true,
            hideCloseButton: true,
            arrowPosition: 30,
            backgroundClassName: 'signin',
            arrowStyle: 2
        });  
    };
})(window.jQuery || window.Zepto);


///////////////////////////////////////////////////////////////////////////////
// Google MAPS bindings                                                      //
///////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
    "use strict";
    
    $(function initialize() {
        var myLatlng = new google.maps.LatLng(0, 0) //(-34.6036, -58.3817);
        var image = 'images/markers/anniversary.png'
        var myOptions = {
          zoom: 1,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }        
        var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        
        var contentString = 
            '<div id="infowindow">' +
            'Galaconcert<br />' +
            'Jaarbeurslaan 2-6<br />' +
            '3690 Genk' +
            '</div>'
        ;
        var infowindow = new google.maps.InfoWindow();
        
        
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Galaconcert',
            icon: image
        });
        var infowindow = new google.maps.InfoWindow(); 
        
        var input = document.getElementById('new_location');         
        var autocomplete = new google.maps.places.Autocomplete(input, {
            types: ["geocode"]
        });
        autocomplete.bindTo('bounds', map); 
        
     
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            infowindow.close();
            var place = autocomplete.getPlace();
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  
            }
            moveMarker(place.name, place.geometry.location);
        });  
        
        $(input).focusin(function () {
            $(document).keypress(function (e) {
                if (e.which == 13) {
                     selectFirstResult();   
                }
            });
        });
        $(input).focusout(function () {
            if(!$(".pac-container").is(":focus") && !$(".pac-container").is(":visible"))
                selectFirstResult();
        });
        function selectFirstResult() {
            infowindow.close();
            $(".pac-container").hide();
            var firstResult = $(".pac-container .pac-item:first").text();
            console.log("selectFirstResult: " + firstResult)
            
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({"address":firstResult }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat(),
                        lng = results[0].geometry.location.lng(),
                        placeName = results[0].address_components[0].long_name,
                        latlng = new google.maps.LatLng(lat, lng);
                    
                    moveMarker(placeName, latlng);
                    $(input).val(firstResult);
                }
            });   
        }
        var div = document.createElement('DIV');
        $(div).html(ich.infobubble_template({name: $(input).val()}));
        google.maps.event.addListener(marker, 'click', function() {
            //infowindow.setContent(contentString);
            //infowindow.open(map, marker);
            infoBubble2.setContent(div);
            infoBubble2.open(map, marker);
        });
        
        function moveMarker(placeName, latlng){
            marker.setIcon(image);
            marker.setPosition(latlng);
            infowindow.close();
            //infowindow.setContent(contentString);
            infoBubble2.setContent(div);
            //infowindow.open(map, marker);
            //infoBubble2.open(map, marker);
        }
        
        var infoBubble2 = new InfoBubble({
          map: map,
          content: '<div class="signin"><form action="/signin" method="post"><p class="phoneytext">Hello There</p></form></div>',
          position: new google.maps.LatLng(-34.6036, -58.3817),
          shadowStyle: 1,
          padding: 0,
          backgroundColor: 'rgb(57,57,57)',
          borderRadius: 4,
          arrowSize: 10,
          borderWidth: 1,
          borderColor: '#2c2c2c',
          disableAutoPan: true,
          hideCloseButton: true,
          arrowPosition: 30,
          backgroundClassName: 'signin',
          arrowStyle: 2
        });
    });
});