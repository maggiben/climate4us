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
// Custom jQuery Functions (go first)                                        //
///////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
    "use strict";
    
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
});
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
            last_7_days: [ {temperature_size: Math.floor(Math.random() * 25) + "px", humidity_size: Math.floor(Math.random() * 12)+ "px"}, 
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"} ]
        },
        setup: function (options) {
            var options = $.extend({}, this.properties, options);
            var that = this;
            this.properties.last_7_days = [ {temperature_size: Math.floor(Math.random() * 25) + "px", humidity_size: Math.floor(Math.random() * 12)+ "px"}, 
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"},
                            {temperature_size: Math.floor(Math.random() * 25)+ "px", humidity_size: Math.floor(Math.random() * 12)+ "px"} ];            
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
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
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
            selected: null
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
                    if(that.properties.order.length > 0)
                    {
                        that.setup(that.properties, options.callback);
                    }
                    else
                    {
                        options.callback(that.properties);
                    }
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
            var total = 100 / that.properties.order.length;
            var cnt = 1;
            // Create a new queue.
            var queue = $.jqmq({
                 // Next item will be processed only when queue.next() is called in callback.
                delay: -1,
                // Process queue items one-at-a-time.
                batch: 1,
                // For each queue item, execute this function, making an AJAX request. Only
                // continue processing the queue once the AJAX request's callback executes.
                callback: function( _id ) {
                    console.log("get: /station/getbyid/" + _id);
                    $.ajax({
                        url: "/station/getbyid/" + _id,
                        type: "GET",
                        dataType: "json",
                        success: function (data, textStatus, jqXHR) {
                            that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //that.stations[b[i]._id] =                   
                            function onLoad(station) {
                                console.log("data is back " + JSON.stringify(station.name));
                                station.isReady = true;
                                $('#progressbar').progressbar('value', cnt * total);
                                console.log(cnt);
                                queue.next(false);
                                cnt++;
                            }
                        },
                        error: function (jqXHR, status, error) {
                            console.log(jqXHR.responseText);
                            // If the request was unsuccessful, make another attempt.
                            queue.next(true);
                        },
                    });
                },
                // When the queue completes naturally, execute this function.
                complete: function(){
                    callback(that.properties);
                }
            });
            that.properties.order.forEach(function(_id) { queue.add(_id) });
        },
        getAllStations: function(options, callback) {
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
            console.log("getStationById: " + id)
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
        getStations: function(callback) {
            var that = this;
            $.ajax({
                url: "/getStations",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    callback(data);
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                }
            });
        },
        getSelected: function() {
            return this.properties.selected;
        },
        getOrder: function() {
            return this.properties.order;
        },
        setOrder: function(order) {
            var that = this;
            $.ajax({
                url: "/subscription/reorder/" + that.properties._id,
                dataType: "json",
                type: "put",
                data: {
                    _id: that.properties._id,
                    ids: order,
                },
                success: function (data, textStatus, jqXHR) {
                    console.log(data)
                    that.properties.order = order;
                }
            })
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
                url: "/station/create",
                type: "POST",
                dataType: "json",
                data: station,
                success: function (data, textStatus, jqXHR) {
                    that.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad});
                    function onLoad(station) {
                        station.isReady = true;
                        that.properties.order.push(station._id);
                        var order = that.getOrder();
                        that.setOrder(order);
                        callback(station);
                    }
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                }
            }), !1;
        },
        setSelected: function(_id) {
            var that = this;
            that.update({_id: _id}, onUpdate);
            function onUpdate(data)
            {
                that.selected = data._id;
                console.log("subscription update ok! result: " + data);
            };
        },
        update: function(properties, callback) {
            var that = this;
            var properties = $.extend({}, this.properties, properties);
            console.log("subscription update");
            $.ajax({
                url: "/subscription/update/" + properties._id,
                dataType: "json",
                type: "put",
                data: properties,
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

    window.Subscription = myApplication;
    ///////////////////////////////////////////////////////////////////////////
    // Sammy.JS application                                                  //
    ///////////////////////////////////////////////////////////////////////////
    var app = $.sammy(function() {
        //this.element_selector = '#main';
        this.bind("station.setup", function(e, data) {
            console.log("station.setup: " + JSON.stringify(data));
            var site = $("#s" + data.id);
            if (site.hasClass("current"))
            {
                return !0;
            }
            var station_template = ich.site_template(data);
            $(station_template).appendTo('#sites').hide().fadeIn('slow');
            $("#s" + data.id).html(ich.station_preview_template(data));

            $("div.site.current").removeClass("current");
            site.addClass("current");
            $("#data").html(ich.site_data_template(data)); 
            $("body").addClass("view-nav");
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
                    var options = {
                        lines: { show: true },
                        points: { show: true },
                        xaxis: { tickDecimals: 0, tickSize: 1 }
                    };
                    var data = [];
                    var placeholder = $("#placeholder");
                    
                    $.plot(placeholder, data, options);

                    data = [[1999, 3.0], [2000, 3.9], [2001, 2.0], [2002, 1.2], [2003, 1.3], [2004, 2.5], [2005, 2.0], [2006, 3.1], [2007, 2.9], [2008, 0.9]];
                    $.plot(placeholder, data, options);
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
                //a.hide("slide", { direction: "right" }, 'swing');
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
        // Subscription Routes                                               //
        ///////////////////////////////////////////////////////////////////////
        this.post('#/subscription/new', function () {
            var that = this;
            var a = $(this.target).removeErrors();
            var b = a.find(".submit button span");
            clearTimeout(b.data("timeout"));
            b.data("text") === undefined && b.data("text", b.text()); 
            b.text("Adding...");
            MyApp.createSubscription({
                name: that.params.name,
                type: 'lab',
                stations: [],
                order: [],
                selected: null,
            }, function(a) {
                console.log(a);
            });
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
            MyApp.subscription.addStation({
                name: that.params.name,
                type: that.params.type,
                country: that.params.country
            }, function(station) {
                console.log(station)
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
            });
        });
        this.post('#/stationXX', function () {
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
                    MyApp.subscription.properties.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad}); //
                    //properties.stations
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
            console.log(this.params)
            console.log("sammy route: #/station/%s/%s", this.params.id, this.params.path);
            var station = MyApp.subscription.getStationById(this.params.id);//stations[this.params.id];
            console.log("MyApp.subscription.stations[%s].name = %s", this.params.id, station.name);
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
    });
    $(function() {
        window.sammyApp = app;
        app.run();
    });

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
    $("#new_subscription a.cancel").on("click", function () {
        return window.location.hash = "#/", $("body").removeClass("add_subscription"), !1;
    });
    $("a.toggle_delete").live("click", function () {
        return $("#site_content").toggleClass("delete"), !1;
    });
    $(".notification").on("click", function(){
        $(this).hide("slide", { direction: "up" }, 'swing');
    })
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
