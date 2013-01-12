///////////////////////////////////////////////////////////////////////////////
// @file         : subscription.js                                           //
// @summary      : Subscription class                                        //
// @version      : 0.1.5                                                     //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Ene 2013                                               //
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

(function (factory) {
    "use strict";
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.Subscription = factory;
        //window.watch = window.Subscription.watch;
    }
}(function () {
    "use strict";
    var Subscription = function(options) {
        this.init(options);
    };
    $.extend(Subscription.prototype, {
        module: { 
            VERSION: "0.1.5",
            license: {},
            dependencies: {},
            author: "",
        },
        settings: {
            timeout: 500,
            debug: true,
            producction: false,
            instances: 1
        },
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
            options = $.extend({}, this.properties, options);
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
                                queue.next(false);
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
            that.properties.order.forEach(function(_id) { queue.add(_id); });
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
        getStationById: function(id) {
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
                    that.properties.order = order;
                }
            });
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
                    console.log(jqXHR.responseText);
                }
            });
        },
        addStation: function(station, callback) {
            var that = this;
            $.ajax({
                url: "/station/add",
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
            });
        },
        getSelected: function() {
            return this.properties.selected;
        },
        setSelected: function(_id) {
            var that = this;
            that.update({_id: _id}, onUpdate);
            function onUpdate(data)
            {
                that.selected = data._id;
                console.log("subscription update ok! result: " + data);
            }
        },
        update: function(properties, callback) {
            var that = this;
            properties = $.extend({}, this.properties, properties);
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
                    console.log(jqXHR.responseText);
                },
            });
        },
    });

    return Subscription;
}));
//window.Subscription = myApplication;