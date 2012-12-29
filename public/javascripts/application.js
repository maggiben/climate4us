///////////////////////////////////////////////////////////////////////////////
// @file         : application.js                                            //
// @summary      : client side application                                   //
// @version      : 0.1      3                                                //
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
        setup: function (a) {
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
    var myApplication = function(a) {
        this.setup(a);
    };
    $.extend(myApplication.prototype, {
        module: { 
            VERSION: "0.10",
            license: {},
            dependencies: {},
            author: "",
        },
        _id: null,
        stations: [],
        order: [],
        selected: null,
        onSetup: null,
        setup: function (a) {
            this.onSetup = a.onSetup;
            var that = this;
            $.ajax({
                url: "/station/getall",
                type: "GET",
                dataType: "json",
                success: function (b) {
                    for (var i = 0; i < b.length; i++) {
                        that.stations[b[i]._id] = new Station({_id: b[i]._id, type: b[i].type, onLoad: onLoad}); //that.stations[b[i]._id] = 
                        console.log("Attaching station id: " + that.stations[b[i]._id].id);
                    }
                    function onLoad(station) {
                        station.isReady = true;
                        //console.log("is onLoad ready: " + that.stations[station._id].isReady + " id: " + that.stations[station._id]._id);
                        a.onSetup(station);
                    }
                },
                error: function (jqXHR, status, error) {
                    //var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                },
                complete: function () {                                
                }
            });
        },
        listStations: function (a) {
            for (var key in this.stations)
            {
                if (this.stations.hasOwnProperty(key))
                {
                    console.log("key: " + key);
                }
            }
            return !1;
        },
        getStationById: function(id) {
            console.log("getStationById(%s)", id);
            console.log("getStationById(%s) = %s", id, JSON.stringify(this.stations[id]));
            return this.stations[id];
        },
        getAllStationsIds: function() {
            var stations = [];
            for (var station in this.stations)
            {
                if (this.stations.hasOwnProperty(station))
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
          return this.selected;
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
                    delete that.stations[data._id];
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
                type: "post",
                dataType: "json",
                data: station,
                success: function (data, textStatus, jqXHR) {
                    that.stations[data._id] = new Station({_id: data._id, type: data.type, onLoad: onLoad});
                    function onLoad(station) {
                        station.isReady = true;
                        callback(data);
                    }
                },
                error: function (jqXHR, status, error) {
                    //var c = $.parseJSON(jqXHR);
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
            callback("coso")
            /*
            $.ajax({
                url: "/subscription/update",
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
            */
        },
    });

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
    
    ///////////////////////////////////////////////////////////////////////////
    // Sammy.JS application                                                  //
    ///////////////////////////////////////////////////////////////////////////
    var app = $.sammy(function() {
        //this.element_selector = '#main';
        this.bind('getSubscription', function(e, data) {
            //console.log("getSubscription");
            MyApp.subscription = new myApplication({onSetup: onSetup});
            function onSetup(a) {
                //console.log("onSetup: " + JSON.stringify(a));
                $("#sites").append(ich.site_template(a));
                $("#s" + a.id).html(ich.station_preview_template(a));
                MyApp.meldSidebar();
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
            $("#data").html(ich.site_data_template(MyApp.subscription.stations[data.id])); 
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
                    $("#site_content").html(ich.overview_template(MyApp.subscription.stations[data.id]));
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
                    /*
                    $('#map_wrapper').gmap().bind('init', function(ev, map) {
                        $('#map_wrapper').gmap('addMarker', {'position': '57.7973333,12.0502107', 'bounds': true}).click(function() {
                    		$('#map_wrapper').gmap('openInfoWindow', {'content': 'Hello World!'}, this);
                    	});
                    });
                    */
                    var options = {
                        zoom: 8,
                        center: new google.maps.LatLng(-34.6036, -58.3817),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    }
                    var map = new window.map({id: "map_wrapper", latitude: -34.6036, longitude: -58.3817, mapOptions: options});
                    break;
                case "settings":
                    console.log("[settings]");
                    $("#site_content").html(ich.station_settings_template(MyApp.subscription.getStationById(data.id)));
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
                    $("#clients_list").removeClass("loading").addClass("empty").text("Could not load API Keys")
                }
            }) : $("#clients_list").removeClass("loading").html(ich.clients_list_template(MyApp))
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
            //var a = MyApp.stations[this.params.id];
            console.log("sammy route: #/station/%s/$s", this.params.id, this.params.path);
            //var a = MyApp.subscription.getStationById(this.params.id);
            //console.log("MyApp.subscription.getStationById = " + JSON.stringify(a));
            //alert(typeof this.params.id);
            //alert(MyApp.subscription.stations[this.params.id].name);
            var station = MyApp.subscription.stations[this.params.id];
            MyApp.subscription.setSelected(this.params.id);
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
        app.trigger('getSubscription', {time: new Date()});
    });
    
    ///////////////////////////////////////////////////////////////////////////
    // Main Client application                                               //
    ///////////////////////////////////////////////////////////////////////////
    var MyApp = {
        VERSION: 1.23,
        $: (typeof window !== 'undefined') ? window.jQuery || window.Zepto || null : null,
        timeout: null,
        clients: null,
        hit_timeout: null,
        connection_count: 0,
        subscription: {},
        mousecoords: {
            pageX: 0, 
            pageY: 0,
        },
        user: {
                name:"pirulo12345@mailinator.com", 
                urls: {
                    self: "https://secure.gaug.es/me", 
                    gauges: "https://secure.gaug.es/gauges", 
                    clients: "https://secure.gaug.es/clients"
                }, 
                id: "50c9e8b9f5a1f56713000002", 
                last_name: null, 
                first_name: null, 
                email: "pirulo12345@mailinator.com"
        },
        start: function (a) {
            //a === 0 ? app.runRoute("get", "#/map") : window.location.hash == "#/" && (window.location.hash = "");
            //jQuery.get('http://laboratory.bmaggi.c9.io/cors.php', null, function(data){alert(data);});
            $.ajax({
                url: 'http://climate4us.aws.af.cm',
                type: 'GET',
                dataType: "json",
                success: function (data) {

                },
                complete: function () {
                
                },
                error: function () {
                    //c.removeClass("loading")
                }
            });
        },
        reset: function () {},
        setUser: function (a) {
            //this.user = a.user, a.subscription && (this.subscription = new Subscription(a.subscription))
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
            console.log("DOMContentLoaded starting MyApp.version: %f", this.VERSION);
            $("body").height(0);
        }
    };
    MyApp = MyApp || {};

    ///////////////////////////////////////////////////////////////////////////
    // Use CommonJS if applicable                                            //
    ///////////////////////////////////////////////////////////////////////////
    if (typeof require !== 'undefined') {
        //module.exports = myApplication;
    } else {
        // else attach it to the window
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
                url: "/stations/reorder",
                dataType: "json",
                type: "put",
                data: {
                    ids: $.map($(this).sortable("toArray"), function (a) {
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
// Plus Object template                                                      //
///////////////////////////////////////////////////////////////////////////////
(function($) {
    
    "use strict";
    
    var fernet = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exists.');
        }
    };
    var VERSION = 1.0;
    var methods = {};
    //Set defauls for the control
    var defaults = {
        data: [],
        magic: 911,
        icon: 'images/markers/anniversary.png',
        title: 'fernet',
        loggers: []
    };
    //Public methods 
    methods.init = function (object, callback, options) {
        //Preserve the original defaults by passing an empty object as the target
        var options = $.extend({}, defaults, options);
        var io = document.getElementById(object);
        io.addEventListener("input", _onInput, false);
    };
    //Public:
    methods.addLogger = function(logger) {
        loggers.push(logger);
    };
    //Private:
    function _onInput(options)
    {
        console.log("io has new input")
    };
    function _domready()
    {
        console.log("Starting fernet.version: %f", VERSION);
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // Use CommonJS if applicable                                            //
    ///////////////////////////////////////////////////////////////////////////
    if (typeof require !== 'undefined') {
        //module.exports = myApplication;
    } else {
        // else attach it to the window
        window.fernet = fernet;
    }
    if (typeof document !== 'undefined') {
        if (fernet.$) {
            fernet.$(function () {
                fernet.domready();
            });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                _domready();
            }, true);
        }
    }
})(window.jQuery || window.Zepto);      
      
      
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