///////////////////////////////////////////////////////////////////////////////
// @file         : station.js                                                //
// @summary      : station controller                                        //
// @version      : 0.1                                                       //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Dec 2012                                               //
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

// Controllers
var mongoose = require('mongoose');


// Load model
var station_schema = require('../models/station')
  , Station = mongoose.model('Station', station_schema);
    
///////////////////////////////////////////////////////////////////////////////
// Route to get all Stations                                                 //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Collection of Stations                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/getall                                                  //
///////////////////////////////////////////////////////////////////////////////
exports.getAll = function(request, response, next) {

    response.contentType('application/json');
    Station.find(gotStations);
    
    function gotStations(error, stations) {
        if (error) {
            console.log(error);
            return next();
        }
        var stationsJSON = JSON.stringify(stations);
        return response.send(stationsJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to a specific Station                                               //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Station                                             //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/getbyid                                                 //
///////////////////////////////////////////////////////////////////////////////
exports.getById = function(request, response, next) {
    
    response.contentType('application/json');
    Station.findById(request.params.id, gotStation);
    
    function gotStation(error, station) {
        if (error) {
            console.log(error);
            return next(error);
        }
        var stationJSON = JSON.stringify(station);
        return response.send(stationJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove a Station                                                 //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url DELETE /station/remove/:id                                           //
///////////////////////////////////////////////////////////////////////////////
exports.remove = function(request, response, next) {
    
    response.contentType('application/json');
    Station.remove({_id: request.params.id}, delStation);
    
    function delStation(error, station) {
        if (error) {
            return next(error);
        }
        var stationJSON = JSON.stringify({_id: request.params.id, action: 'remove', result: true, station: station});
        return response.send(stationJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove all Stations                                              //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url DELETE /station/removeall                                            //
///////////////////////////////////////////////////////////////////////////////
exports.removeall = function(request, response, next) {
    
    response.contentType('application/json');
    Station.find(gotStations);

    function gotStations(error, stations) {
        if (error) {
            console.log(error)
            return next();
        }
        if (!stations || !Array.isArray(stations) || stations.length === 0)
        {
            console.log('no docs found');
            return next();
        }
        stations.forEach(function (station) {
            station.remove(function (err, product) {
                console.log('document id:%d could not be removed', station._id);
                return next();
            });
        });
        var msgJSON = JSON.stringify({action: 'removeall', result: true});
        return response.send(msgJSON);
    }
}

///////////////////////////////////////////////////////////////////////////////
// Route to remove all Stations                                              //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON updated document                                    //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url POST /station/update/:id                                             //
///////////////////////////////////////////////////////////////////////////////
    
    /*
    response.contentType('application/json');
    Station.findById(request.params.id, gotStation);
    
    function gotStation(error, station) {
        if (error) {
            console.log(error);
            return next(error);
        }
        var stationJSON = JSON.stringify(station);
        return response.send(stationJSON);
    }
    */

exports.update = function (request, response, next) {
    
    response.contentType('application/json');
    Station.findById(request.params.id, updateStation);
    
    function updateStation (error, station) {
        
        if (error) {
            console.log(error);
            return next(error);
        }
        if (!station) {
            console.log(error);
            return next(error);
        } 
        else {
            console.log("REQUEST BODY")
            console.log(JSON.stringify(request.body));
        }
            console.log("REQUEST BODY")
            console.log(JSON.stringify(request.body));
                    
        station = extendWithFilters(station, request.body);
        station.save(onSaved);

        function onSaved (error, station) {
            if (error) {
                console.log(error);
                return next(error);
            }
            console.log("onSaved");
            return response.send(JSON.stringify(station));
        }

        var stationJSON = JSON.stringify(station);
        return response.send(stationJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to create a Stations                                                //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON new document                                        //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/create                                                  //
///////////////////////////////////////////////////////////////////////////////
exports.create = function (request, response, next) {
    
    console.log('create-body: ' + JSON.stringify(request.body));
    
    var station = new Station({
        name: request.body.name,
        id: Math.floor(Math.random() * 99999999999999),
        type: request.body.type,
        country: request.body.country,
        state: 'CABA',
        city: 'CABA',
        latitude: request.body.latitude,
        longitude: request.body.longitude,
        magic: Math.floor(Math.random() * 99999999999999),
        sensors: [1, 2, 3, 4],
        created: new Date(),
        lastUpdate: new Date(),
        lastAccess: new Date(),
        temperature: {
            value: Math.floor(Math.random() * 50),
            unit: 'C'
        },
        humidity: { 
            value: Math.floor(Math.random() * 100),
            dewpoint: 44, 
            unit: '%'
        },
        wind: { 
            value: 22, 
            direction: 'SE', 
            degrees: 150, 
            unit: 'KMH'
        },
        rainfall: { 
            value: 22, 
            unit: 'MM'
        },
        pressure: { 
            value: 123, 
            unit: 'HPA', 
            type: 'absolute'
        }, 
        visibility: { 
            value: 10, 
            unit: 'KM'
        },
        astronomy: { 
                sunrise: new Date(), 
                sunset: new Date() 
        },
        
    });
    
    response.contentType('application/json');
    station.save(onSaved);

    function onSaved (error, station) {
        if (error) {
            console.log(error);
            return next(error);
        }
        console.log("onSaved");
        return response.send(JSON.stringify(station));
    }
};


exports.setupStation = function(request, response, next) {
    response.contentType('application/json');
    var id = request.params.id;
    console.log("setupStation: %s", request.params.id);
    Station.findById(id, gotStation);
    
    function gotStation(error, station) {
        if (error) {
            console.log(error);
            return next(error);
        }
        console.log("temp: %s", station.temperature);
        var stationJSON = JSON.stringify(station);
        return response.send(stationJSON);
    }
};


///////////////////////////////////////////////////////////////////////////////
// Helpers                                                                   //
///////////////////////////////////////////////////////////////////////////////

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i],
            keys = Object.keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

function extendWithFilters(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i],
            keys = Object.keys(source)
        for (var j = 0; j < keys.length; j++) {
            var name = keys[j];
            if(target.hasOwnProperty(name)) {
                target[name] = source[name];
            }
        }
    }
    return target;
}


// browser:

/*
;(function (global) {
    global.extendWithFilters = extendWithFilters

    function extendWithFilters(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i],
                keys = Object.keys(source)
            for (var j = 0; j < keys.length; j++) {
                var name = keys[j];
                if(target.hasOwnProperty(name)) {
                    target[name] = source[name];
                }
            }
        }
        return target;
    }
}(window))
*/