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
// @version      : 0.1.1                                                     //
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
            this.getUser({callback: gotUser})
            function gotUser(account)
            {
                console.log("account")
                that.user.subscriptions.forEach(function(_id) {
                    that.getSubscription({_id: _id, callback: gotSubscription});
                });
                function gotSubscription(subscription) {
                    console.log("subscription")
                    MyApp.subscriptions[subscription._id] = new Subscription({_id: subscription._id, callback: onInit});
                    MyApp.subscription = MyApp.subscriptions[subscription._id];
                }
                function onInit(subscription)
                {
                    subscription.order.forEach(function(_id) {
                        var station = subscription.stations[_id];
                        $("#sites").append(ich.site_template(station.properties)).hide().fadeIn(200);
                        $("#s" + station.properties._id).html(ich.station_preview_template(station.properties));
                    });
                }
            }
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
        getSubscription: function(options) {
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
    var timer = null;
    var socket = io.connect('http://localhost:8080', {
        closeTimeout: 2000,
        });
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { message: 'data' });
    });
    socket.on('consoleio', function (data) {
        switch(data.message)
        {
            case 'heartbeat':
                echo("[[b;#777;]heartbeat]")
                break;
            case 'exec':
                switch(data.io)
                {
                    case 'stdout': 
                        echo(data.result);
                        console.log(data);
                        break;
                    case 'stderr':
                        echo("[[b;#f00;]" + data.result +"]");
                        console.log(data.result);
                        break;
                    
                }
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
            }, 1000);
        }, 2000);
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
// Plus Object template                                                      //
///////////////////////////////////////////////////////////////////////////////
/*
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
    var properties = {
        delay: 10,
        reconnect: true,
        socket: null,
        stdinp: null,
        stdout: null,
        stderr: null
    };
    var user = {
        name: "", 
        id: "", 
        last_name: null, 
        first_name: null, 
        email: "",
        subscriptions: [],
        subscription: null
    };
    var subscriptions = [];
    var plugin = this;
    //Public methods 
    methods.init = function (object, callback, options) {
        //Preserve the original defaults by passing an empty object as the target
        var options = $.extend({}, defaults, options);
        getUser({callback: gotUser})
        function gotUser(account)
        {
            user.subscriptions.forEach(function(_id) {
                getSubscription({_id: _id, callback: gotSubscription});
            });
            function gotSubscription(subscription) {
                subscriptions[subscription._id] = new Subscription({_id: subscription._id, callback: onInit});
            }
            function onInit(subscription)
            {
                subscription.order.forEach(function(_id) {
                    var station = subscription.stations[_id];
                    console.log("hasta acaaaa")
                    //$("#sites").append(ich.site_template(station.properties)).hide().fadeIn(200);
                    //$("#s" + station.properties._id).html(ich.station_preview_template(station.properties));
                });
            }
        }
    };
    //Public:
    methods.addLogger = function(logger) {
        console.log("addLogger")
        //loggers.push(logger);
    };
    //Private:
    function getSubscription(options) {
        console.log("fernet.getSubscription(%s)", options._id);
        $.ajax({
            url: "/subscription/getbyid/" + options._id,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                console.log(data);
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
    };
    function getUser(options) {
        $.ajax({
            url: "/account/getAccount",
            type: "GET",
            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                user = $.extend({}, user, data);
                options.callback(user);
            },
            error: function (jqXHR, status, error) {
                console.log(jqXHR.responseText);
            },
        });    
    };
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
        //module.exports = Subscription;
    } else {
        // else attach it to the window
        window.fernet = new fernet();
        window.fernet.addLogger()
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
*/

