///////////////////////////////////////////////////////////////////////////////
// FileName     : station.js                                                 //
// Version      : 0.1                                                        //
// Project      : Node.JS + Express boilerplate for cloud9 and appFog        //
// Author       : Benjamin Maggi                                             //
// Email        : benjaminmaggi@gmail.com                                    //
// Date         : 12 Dec 2012                                                //
// ------------------------------------------------------------------------- //
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
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON Collection of Stations                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/getall                                                  //
///////////////////////////////////////////////////////////////////////////////
exports.getAll = function (req, res, next) {

  Station.find(gotStations);
  function gotStations(err, stations) {
    if (err) {
      console.log(err)
      return next();
    }
    console.log(stations)
    return;
  }
};

///////////////////////////////////////////////////////////////////////////////
// Route to a specific Station                                               //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON Station                                             //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/getbyid                                                 //
///////////////////////////////////////////////////////////////////////////////
exports.getById = function(req, res, next) {
    
    res.contentType('application/json');
    Station.findById(id, gotStation);
    
    function gotStation(err, station) {
        if (err) {
            console.log(err);
            return next(err);
        }
        var stationJSON = JSON.stringify(station);
        return res.send(stationJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove a Station                                                 //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/remove/:id                                              //
///////////////////////////////////////////////////////////////////////////////
exports.remove = function(req, res, next) {
    res.contentType('application/json');
    Station.remove({_id: req.params.id}, delStation);
    
    function delStation(err, station) {
        if (err) {
            return next(err);
        }
        var stationJSON = JSON.stringify({action: 'remove', result: true});
        return res.send(stationJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove all Stations                                              //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /station/removeall                                               //
///////////////////////////////////////////////////////////////////////////////
exports.removeall = function(req, res, next) {
    
    res.contentType('application/json');
    Station.find(gotStations);

    function gotStations(err, stations) {
        if (err) {
            console.log(err)
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
        var stationsJSON = JSON.stringify({action: 'removeall', result: true});
        return res.send(stationsJSON);
    }
}

exports.getStations = function(req, res, next) {

    res.contentType('application/json');
    Station.find(gotStations);

    function gotStations(err, stations) {
        if (err) {
            console.log(err)
            return next();
        }
        var stationsJSON = JSON.stringify(stations);
        return res.send(stationsJSON);
    }
};
exports.setupStation = function(req, res, next) {
    res.contentType('application/json');
    var id = req.params.id;
    console.log("setupStation: %s", req.params.id);
    Station.findById(id, gotStation);
    
    function gotStation(err, station) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log("temp: %s", station.temperature);
        var stationJSON = JSON.stringify(station);
        return res.send(stationJSON);
    }
};
exports.update = function (req, res, next) {
    res.contentType('application/json');
    var id = req.params.id;

    console.log("update: %s", req.params.id);
    Station.findById(id, gotStation);
    
    function gotStation (err, station) {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!station) {
            console.log('ERROR: ID no existe')
            return res.send('ID Inválida!');
        } 
        else {
            console.log(JSON.stringify(req.body));
        }
        var stationJSON = JSON.stringify(station);
        return res.send(stationJSON);
    }
};
exports.create = function (req, res, next) {
    
    var name = req.body.name;
    console.log("name: ", name);

    //console.log("para: " + JSON.stringify(req.params));
    console.log('create-body: ' + JSON.stringify(req.body));
    
    var station = new Station({
        name: req.body.name,
        id: Math.floor(Math.random() * 99999999999999),
        type: req.body.type,
        country: req.body.country,
        state: 'CABA',
        city: 'CABA',
        latitude: 38,
        longitude: 54,
        magic: Math.floor(Math.random() * 99999999999999),
        sensors: [1, 2, 3, 4],
        created: new Date(),
        lastUpdate: new Date(),
        lastAccess: new Date(),
        temperature: {
            value: 34,
            unit: 'C'
        },
        humidity: { 
            value: 66, 
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
    
    res.contentType('application/json');
    station.save(onSaved);

    function onSaved (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log("onSaved");
        return res.send(JSON.stringify(station));
    }
}


