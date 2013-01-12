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
            this.getUser({callback: gotUser})
            function gotUser(account)
            {
                $("#sites").prepend(ich.stations_loader(this)).hide().fadeIn('slow');       
                $( "#progressbar" ).progressbar({
                    value: 0
                });
                that.user.subscriptions.forEach(function(_id) {
                    that.getSubscription({_id: _id, callback: gotSubscription});
                });
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
                    $("#sites .notice").hide(1000, 'swing');
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
                            window.sammyApp.trigger("show_panel.g",{id: selected, path:"overview"})
                        }
                    });
                    subscription.order.forEach(function(_id) { queue.add(_id) });
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
                trash = [];
            for (i = 0, l = scripts.length; i < l; i++) {
                script = scripts[i];
                if (script && script.innerHTML && script.id && (script.type === "text/html" || script.type === "text/x-fernet")) {
                    that.addView(script.id, trim(script.innerHTML));
                    trash.unshift(script);
                }
            }
            for (i = 0, l = trash.length; i < l; i++) {
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
    var timer = null;
    var socket = io.connect('http://127.0.0.1:8080', {
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

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "amaretto";
    var defaults = {
        VERSION: 1.5,
        data: [],
        magic: 911,
        icon: 'images/markers/anniversary.png',
        loggers: [],
        properties: {
            delay: 10,
            reconnect: true,
            socket: null,
            stdinp: null,
            stdout: null,
            stderr: null
        },
        user: {
            name: "", 
            id: "", 
            last_name: null, 
            first_name: null, 
            email: "",
            subscriptions: [],
            subscription: null
        },
        subscriptions: [],
    };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
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
                    // Because we want one one
                    // TODO REFACTOR TO SELECTED SUBSCRIPTION
                    MyApp.subscription = MyApp.subscriptions[subscription._id];
                }
                function onInit(subscription)
                {
                    
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
                            window.sammyApp.trigger("show_panel.g",{id: selected, path:"overview"})
                        }
                    });
                    subscription.order.forEach(function(_id) { queue.add(_id) });
                }
            }
        },
        yourOtherFunction: function () {
            // some logic
        },
        getSubscription: function(options) {
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
        },
        getUser: function(options) {
            var that = this;
            $.ajax({
                url: "/account/getAccount",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    console.log(that.user)
                    that.user = $.extend({}, that.options.user, data);
                    options.callback(that.user);
                },
                error: function (jqXHR, status, error) {
                    console.log(jqXHR.responseText);
                },
            });
        },
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
