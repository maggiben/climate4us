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
$(document).ready(function() {
    "use strict";
    var timer = null;
    var socket = io.connect('http://climate4us.aws.af.cm', {
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
