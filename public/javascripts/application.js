/*
main app
benjamin maggi dec 2012
file: application.js
ver 1
*/
// Station
;(function($) {
    // grab jquery or zepto if it's there
    //$: (typeof window !== 'undefined') ? window.jQuery || window.Zepto || null : null;
    
    var Station = function(arg) {
        this.setup(arg);
    };
    $.extend(Station.prototype, {
        name: '',
        id: 0,
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
            that.id = a.id;
            $.ajax({
                url: "/setupStation/" + a.id,
                type: "GET",
                dataType: "json",
                success: function (b) {
                    console.log("Station[" + b._id + "] successfully created");
                    that.name = b.name;
                    that.type = b.type;
                    that.temperature = b.temperature;
                    that.humidity = b.humidity;
                    a.onLoad(that);
                },
                
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    alert(c.errors)
                },
                complete: function () {                                
                }
            });
        },
        change: function (a) {
            var that = this;
            console.log("change: " + this.id)
            $.ajax({
                url: "/changeStation/" + that.id,
                type: "post",
                dataType: "json",
                data: {
                    station: {
                        id: that.id, //Math.floor(Math.random() * 9999)
                        type: that.type,
                        lastUpdate: new Date(),
                        temperature: that.temperature
                    }
                },
                success: function (b) {
                    console.log("data back: " + JSON.stringify(b));
                },
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    alert(c.errors)
                },
                complete: function () {                                
                }
            });
        },
        getData: function() {                       
           $.ajax({
                url: 'updateStation' + this.id,
                type: 'POST',
                dataType: "json",
                data: {
                    station: {
                        id: this.id,
                        type: this.type,
                        lastAccess: new Date()
                    }
                },
                success: function (data) {
                    //alert($.parseJSON(data.responseText));
                    //alert("lat: " + data.latitude + " long: " + data.longitude + " temp: " + data.temperature);
                    //alert(data);
                    return data;
                },
                complete: function () {
                
                },
                error: function () {
                    //c.removeClass("loading")
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
    //var st1 = new Station({id: "50c42eae578d18086b000001", type: "Arduino"});
    //alert("new id: " + st1.getTemperature().value);
    //alert("temp: " + st1.getTemperature().value);
    //st1.setTemperature({value: 100, unit: 'C' });
    //alert("temp: " + st1.getTemperature().value);
    //st1.change();
    
    
    // Subscriptions
    var myApplication = function(a) {
        this.setup(a);
    };
    $.extend(myApplication.prototype, {
        app: { 
            VERSION: "0.10",
            lic: {},
        },
        sites: [],
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
                        //console.log("Station[%s].temperature.value = %d", b[i]._id, b[i].temperature.value);
                        that.sites[b[i]._id] = new Station({id: b[i]._id, type: b[i].type, onLoad: onLoad})
                        console.log("Attaching station id: " + that.sites[b[i]._id].id);
                    }
                    function onLoad(station) {
                        station.isReady = true;
                        console.log("is onLoad ready: " + station.isReady);
                        a.onSetup(station);
                    }
                },
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    alert(c.errors)
                },
                complete: function () {                                
                }
            });
        },
        onLoadX: function(a) {
            a.isReady = true;
            //console.log(this.onSetup);
            console.log("is ready: " + a.isReady);
            //this.onSetup(a);
        },
        listStations: function (a) {
            for (var key in this.sites)
            {
                if (this.sites.hasOwnProperty(key))
                console.log("key: " + key);
            }
        },
    });

    // Use CommonJS if applicable
    if (typeof require !== 'undefined') {
        module.exports = myApplication;
    } else {
        // else attach it to the window
        window.myApplication = myApplication;
    }
    
    if (typeof document !== 'undefined') {
        if (myApplication.$) {
            myApplication.$(function () {
                //ich.grabTemplates();
            });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                //ich.grabTemplates();
            }, true);
        }
    }
    
    $("#new_site a.cancel").live("click", function () {
        return window.location.hash = "#/", $("body").removeClass("adding"), !1
    });
    $("a.toggle_delete").live("click", function () {
        return $("#site_content").toggleClass("delete"), !1
    });
    $.fn.displayErrors = function(a, b) {
        var c = this.removeErrors();
        c.parent().addClass("error");
        for (key in a) {
            var d = b ? b + "[" + key + "]" : key, e = a[key].join(", "), f = '<strong class="error_explanation">' + e + "</strong>";
            c.find('[name="' + d + '"]').addClass("error").closest("p").append(f)
        }
        var g = c.closest("section");
        return g.length > 0 && g.trigger("resize.g", [c.closest(".panel").height()]), this
    }
    $.fn.removeErrors = function() {
        this.parent().removeClass("error").find("input.error").removeClass("error"), this.find("strong.error_explanation").remove();
        var a = this.closest("section");
        return a.length > 0 && a.trigger("resize.g", [this.closest(".panel").height()]), this
    }
    this.element_selector = '#main';
    
    var app = $.sammy(function() {
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
            console.log("getSubscription");
            
            var subscription = new myApplication({onSetup: onSetup});
            //var a = Object.keys(subscription.sites);
            
            function onSetup(a) {
                console.log(a);
                var obj = {
                id: a.id,
                weekend: 'test',
                name: "a.name",
                temperature: '44',
                humidity: a.humidity.value,
                overview: true,
                date: new Date(),
                last_7_dayss: [
                    { temperature_size: '05px', humidity_size: '25px' },
                    { temperature_size: '10px', humidity_size: '20px' },
                    { temperature_size: '15px', humidity_size: '15px' },
                    { temperature_size: '20px', humidity_size: '10px' },
                    { temperature_size: '25px', humidity_size: '05px' },
                    { temperature_size: '20px', humidity_size: '00px' },
                    { temperature_size: '10px', humidity_size: '10px' },
                    ],
                };
                console.log("temp: " + a.temperature.value);
                $("#sites").append(ich.site_template(a));
                $("#s" + a.id).html(ich.station_preview_template(a)); 
                return;
                for (var key in a.sites)
                {
                    
                    console.log("temp: " + a.sites[key].temperature.value);
                    $("#sites").append(ich.site_template(a.sites[key]));
                    $("#s" + key).html(ich.station_preview_template(a.sites[key])); 
                }
                //$("#sites").append(ich.site_template(a));
                //$("#s" + a.id).html(ich.station_preview_template(a)); 
            };
            return;
            for (var key in subscription.sites)
            {
                if (subscription.sites.hasOwnProperty(key))
                {
                    //console.log("key: " + JSON.stringify(window.application.sites[key]));
                    console.log("key: " + key);
                }
            }
            //console.log("keys: " + Object.keys(window.application.sites));
            $("#sites").append(ich.site_template(obj));
            $("#s" + obj.id).html(ich.station_preview_template(obj)); 
        });
        this.bind('showSite', function(e, data) {
            var a = this;
                b = $("#s" + data['my_data'].id);
            if (b.hasClass("current")) return !0;
            $("div.site.current").removeClass("current");
            b.addClass("current");
            //$("#data").html(ich.site_data_template(this)), 
            //$("body").addClass("view-nav");
            //alert(data['my_data'].id);
        });
        this.bind("show_panel.g", function (e, data) {
            var b = this;
            var c = $("#s" + b.id);
            d = data == c.data("panel") ? $("#site_content div.display").scrollTop() : 0;
            //b.trigger("show_site.g"), c.data("panel", a), 
            $("#data div.nav li.current").removeClass("current"); 
            $('#data div.nav a[href="#/gauges/' + b.id + "/" + data + '"]').closest("li").addClass("current");
            console.log("path: " + data['params'].path)
            switch (data['params'].path) {
                case "overview":
                        alert("XXX");
                    break;
                
            }
        });
        /*
        this.get('/', function() {
            this.trigger('getSubscription', {time: new Date()});
        });
        */
        this.get(/\#\/sites\/(.*)/, function () {
            //this.redirect("#", "gauges", this.params.splat)
            alert(this.params.splat);
        });
        this.get("#/", function (a) {
            $("body").removeClass("no_cancel").removeClass("my_account");
            $.trim($("#data").html()) == "" && $("#sites div.site:first a").length > 0 && a.redirect($("#sites div.site:first a").attr("href"))
        });
        this.post("#/station/add", function () {
            var a = $(this.target).removeErrors(),
            b = a.find(".submit button span");
            clearTimeout(b.data("timeout"));
            b.data("text") === undefined && b.data("text", b.text()); 
            b.text("Adding...");
            $.ajax({
                url: "/station/add",
                type: "post",
                dataType: "json",
                data: {
                    station: {
                        name: this.params.name,
                        type: this.params.type,
                        country: this.params.country,
                    }
                },
                success: function (b) {
                    var c = b.station;
                    //Gauges.sites[c.id] = new Site(c), 
                    $("#new_title").val(""), setTimeout(function () {
                        window.location.hash = "/station/" + c.id + "/code"
                    }, 400), $.scrollTo("#s" + c.id, {
                        duration: 600
                    }), $("body").removeClass("adding"), a.removeErrors()
                },
                error: function (b) {
                    var c = $.parseJSON(b.responseText);
                    a.displayErrors(c.errors)
                },
                complete: function () {
                    b.text(b.data("text"))
                }
            }), !1
        });
        this.get('#/temp', function() {
            $("body").addClass("adding");
        });
        this.get('#/map', function() {
            //alert("maposi");
            this.trigger('newSensor', {my_data: this.id});
        });
        this.get('#/gauges/new', function() {
            MyApp.start(this);
            var user_data, user;
            user_data = {
                trial_days_left_text: new Date()
            };                
            trial_template = ich.trial_template(user_data);
            $('#sites').append(trial_template);
            window.location.hash = "/";
        });
        this.get('#/sign_out', function()
        {
            $.ajax({
                    url: "/signout",
                    type: "GET",
                    complete: function () {
                    window.location = "/signin"
                }
            });
            $("body").addClass("loading").removeClass("loaded");
        });
        this.get("#/gauges/:id/:path", function () {
            //var a = Gauges.sites[this.params.id];
            //this.params.path == "overview" && a.setRecentTraffic(), a.trigger("show_panel.g", [this.params.path]), Gauges.meldSidebar()
            //alert("id: " + this.params.id + " path: " + this.params.path);
            this.trigger('showSite', {my_data: this.params});
            //return;
            //alert(this.params.path)
            this.params.path == "overview"; 
            this.trigger("show_panel.g", {params: this.params}); 
            Gauges.meldSidebar();
        });
        this.del("#/gauges/:id", function () {
            var a = $(this.target).removeErrors();
            b = a.find(".submit button span");
            b.text("Deleting...");
            window.location.hash = "/deleting";
            /*
            $.ajax({
                url: "/gauges/" + this.params.id,
                dataType: "json",
                type: "delete",
                success: function (a) {
                    var b = a.gauge,
                    c = Gauges.sites[b.id];
                    c.trigger("teardown.g"), $("#data").html(ich.deleted_site_template(b)), window.location.hash = "/"
                }
            });
            */
            $("#data").html(ich.deleted_site_template(b));
            window.location.hash = "/";
        });
        this.get("#/account", function () {
            var server = "http://climate4us.aws.af.cm";
            var apiKey = "/subscription";
            $("body").removeClass("adding"), $.ajax({
                url: server + apiKey,
                dataType: "json",
                success: function (a) {
                    //Gauges.subscription = new Subscription(a.subscription)
                }
            }), 
            $("#sites div.current").removeClass("current"), 
            $("#data").html(ich.account_template(Gauges.user)), 
            $('div.nav a[href="#/account"]').closest("li").addClass("current"), 
            $("#site_content").html(ich.my_info_template(Gauges.user))
        });
    });
    $(function() {
        app.run();
    });
    
})(window.jQuery || window.Zepto);
