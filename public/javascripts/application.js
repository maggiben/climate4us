///////////////////////////////////////////////////////////////////////////////
// @file         : application.js                                            //
// @summary      : client side application                                   //
// @version      : 0.1                                                       //
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
    // grab jquery or zepto if it's there
    //$: (typeof window !== 'undefined') ? window.jQuery || window.Zepto || null : null;
    
    // Station class
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
    // Subscription class
    var myApplication = function(a) {
        this.setup(a);
    };
    $.extend(myApplication.prototype, {
        app: { 
            VERSION: "0.10",
            lic: {},
            author: "",
        },
        stations: [],
        onSetup: null,
        setup: function (a) {
            this.onSetup = a.onSetup;
            //console.log(this.onSetup);
            var that = this;
            $.ajax({
                url: "/getStations",
                type: "GET",
                dataType: "json",
                success: function (b) {
                    for (var i = 0; i < b.length; i++) {
                        that.stations[b[i]._id] = new Station({_id: b[i]._id, type: b[i].type, onLoad: onLoad}); //that.stations[b[i]._id] = 
                        //MyApp.stations[b[i]._id] = b[i]; //that.stations[b[i]._id];
                        console.log("Attaching station id: " + that.stations[b[i]._id].id);
                    }
                    function onLoad(station) {
                        //that.stations[station._id] = station;
                        station.isReady = true;
                        //console.log("is onLoad ready: " + that.stations[station._id].isReady + " id: " + that.stations[station._id]._id);
                        a.onSetup(station);
                    }
                },
                error: function (jqXHR, status, error) {
                    var c = $.parseJSON(jqXHR);
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
                    var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                }
            });
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
                    var c = $.parseJSON(jqXHR);
                    console.log(jqXHR.responseText);
                }
            }), !1;
        },
    });

    // UI Events
    $("#new_site a.cancel").live("click", function () {
        return window.location.hash = "#/", $("body").removeClass("adding"), !1;
    });
    $("a.toggle_delete").live("click", function () {
        return $("#site_content").toggleClass("delete"), !1;
    });
    // Custom jQuery Functions
    $.fn.displayErrors = function(a, b) {
        var c = this.removeErrors();
        c.parent().addClass("error");
        for (var key in a) {
            var d = b ? b + "[" + key + "]" : key, e = a[key].join(", "), f = '<strong class="error_explanation">' + e + "</strong>";
            c.find('[name="' + d + '"]').addClass("error").closest("p").append(f);
        }
        var g = c.closest("section");
        return g.length > 0 && g.trigger("resize.g", [c.closest(".panel").height()]), this
    }
    $.fn.removeErrors = function() {
        this.parent().removeClass("error").find("input.error").removeClass("error"), this.find("strong.error_explanation").remove();
        var a = this.closest("section");
        return a.length > 0 && a.trigger("resize.g", [this.closest(".panel").height()]), this
    }
    // Sammy.JS application
    var app = $.sammy(function() {
        //this.element_selector = '#main';
        this.bind('newSensor', function(e, data) {
            alert(data['my_data']);
            var server = "http://climate4us.aws.af.cm";
            var api = "/setup";
            $.ajax({
                    url: server + api, //"/gauges/" + this.params.id,
                    dataType: "json",
                    type: "get",
                    success: function (a) {
                        alert("data back: " + JSON.stringify(a));
                    }
            });
        });
        this.bind('getSubscription', function(e, data) {
            //console.log("getSubscription");
            MyApp.subscription = new myApplication({onSetup: onSetup});
            function onSetup(a) {
                //console.log("onSetup: " + JSON.stringify(a));
                $("#sites").append(ich.site_template(a));
                $("#s" + a.id).html(ich.station_preview_template(a)); 
            };
        });
        this.bind("station.setup", function(e, data) {
            console.log("station.setup: " + JSON.stringify(data));
            var station_template = ich.site_template(data);
            $(station_template).appendTo('#sites').hide().fadeIn('slow');
            //$("#sites").append(ich.site_template(data));
            $("#s" + data.id).html(ich.station_preview_template(data));
            //this.trigger("show_station.g");
            //this.trigger('showSite', {my_data: this.params});
            
            var site = $("#s" + data.id);
            if (site.hasClass("current"))
            {
                return !0;
            }
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
            $("#data").html(ich.site_data_template(station)); 
            $("body").addClass("view-nav");
        });
        this.bind("show_panel.g", function (e, data) {
            console.log("show_panel.g: " + JSON.stringify(data));
            var b = this;
            var c = $("#s" + b.id);
            var d = data == c.data("panel") ? $("#site_content div.display").scrollTop() : 0;
            b.trigger("show_station.g", data), 
            c.data("panel", data);
            $("#data div.nav li.current").removeClass("current"); 
            $('#data div.nav a[href="#/gauges/' + b.id + "/" + data + '"]').closest("li").addClass("current");
            switch (data.path) {
                case "settings":
                    $panel = $("#site_content").html(ich.site_settings_template(this));
                break;
                case "overview":
                        console.log("[overview]");
                    break;
                case "code":
                    console.log("[code]");
                    $panel = $("#site_content").html(ich.my_info_template(this));
                    break;
                
            }
            $("body").addClass("view-panel");
            $("#site_content div.display").scrollTop(d);
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
        // Dession Routes                                                    //
        ///////////////////////////////////////////////////////////////////////
        this.get('#/sign_out', function() {
            $.ajax({
                    url: "/signout",
                    type: "GET",
                    complete: function () {
                    window.location = "/signin"
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
            //console.log("about to create a new station link: #/station");
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
                        setTimeout(function () {
                            window.location.hash = "/station/" + station._id + "/code";
                            $.scrollTo("#s" + station._id, 800);
                        }, 400); 
                        console.log("onLoad id: " + station._id);
                        //$.scrollTo("#s" + station._id, 800);
                        $("body").removeClass("adding");
                        a.removeErrors();
                        that.trigger('station.setup', station);
                    }
                },
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    a.displayErrors(c.errors);
                },
                complete: function () {
                    b.text(b.data("text"));
                }
            }), !1;
        });
        this.get("#/station/:id/:path", function () {
            //var a = MyApp.stations[this.params.id];
            //console.log("runRoute: #/station/%s/$s",this.params.id, this.params.path);
            //var a = MyApp.subscription.getStationById(this.params.id);
            //console.log("MyApp.subscription.getStationById = " + JSON.stringify(a));
            //alert(typeof this.params.id);
            //alert(MyApp.subscription.stations[this.params.id].name);
            var station = MyApp.subscription.stations[this.params.id];
            console.log("MyApp.subscription.stations[%s].name = %s", this.params.id, station.name);
            //alert("#/station/%s/%s",typeof a, this.params.path);
            //this.params.path == "overview" && a.setRecentTraffic();
            //this.trigger('station.setup', station);
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
        // Station routes
    });
    $(function() {
        app.run();
        app.trigger('getSubscription', {time: new Date()});
    });
    // Application
    var MyApp = {
        VERSION: 1.12,
        //subscription: null,
        user: null,
        timeout: null,
        hit_timeout: null,
        connection_count: 0,
        stationsxx: {},
        subscription: {},
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
        getTemperature: function(a) {
            var server = "http://c9-node-express-boilerplate.bmaggi.c9.io";
            var apiKey = "/start";
            $.ajax({
                    url: server + apiKey,
                    type: 'GET',
                    dataType: "json",
                    success: function (data) {
                        //alert($.parseJSON(data.responseText));
                        //alert("lat: " + data.latitude + " long: " + data.longitude + " temp: " + data.temperature);
                        alert(data);
                        return data;
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
    };
    MyApp = MyApp || {};

    // Use CommonJS if applicable
    if (typeof require !== 'undefined') {
        //module.exports = myApplication;
    } else {
        // else attach it to the window
        window.MyApp = MyApp;
    }
    if (typeof document !== 'undefined') {
        if (MyApp.$) {
            MyApp.$(function () {
                //ich.grabTemplates();
            });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                //ich.grabTemplates();
            }, true);
        }
    }
})(window.jQuery || window.Zepto);

$(document).ready(function () {
    
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
    $(window).scroll(function() {
    var a = $(window).height(), b = $(document).height(), c = $(window).scrollTop(), d = $("#wrapper"), e = $("body");
    if (d.data("scrollTop") < c)
        $(document.body).height(b - e.css("padding-top").replace("px", ""));
    else {
        var f = e.height() - (d.data("scrollTop") - c);
        f >= d.height() ? e.height(f) : e.height(d.height())
    }
    d.data("scrollTop", c)
    });
});