// Controllers
var mongoose = require('mongoose')


// Creación de variables para cargar el modelo
var station_schema = require('../models/station')
  , Station = mongoose.model('Station', station_schema);
  
  
/**
* @param {Object} req
* @param {Object} res
* @param {Object} next
*
* @api public
*
* @url GET /
*/
exports.index = function (req, res, next) {

  Station.find(gotStations);
  function gotStations (err, stations) {
    if (err) {
      console.log(err)
      return next()
    }

    //return res.render('index', {title: 'Lista de Productos', productos: productos})
    console.log(stations)
    return;
  }
}

exports.getStations = function (req, res, next) {

    res.contentType('application/json');
    Station.find(gotStations);

    function gotStations (err, stations) {
        if (err) {
            console.log(err)
            return next()
        }
        var stationsJSON = JSON.stringify(stations);
        return res.send(stationsJSON);
    }
}
exports.setupStation = function (req, res, next) {
    res.contentType('application/json');
    var id = req.params.id;
    console.log("setupStation: %s", req.params.id);
    Station.findById(id, gotStation);
    
    function gotStation (err, station) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log("temp: %s", station.temperature);
        var stationJSON = JSON.stringify(station);
        return res.send(stationJSON);
    }
}
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
            return res.send('ID Inválida!')
        } 
        else {
            /*
            var station = new Station({
            station.nombre       = nombre
            station.descripcion  = descripcion
            station.precio       = precio
            station.save(onSaved)
            */
            console.log(JSON.stringify(req.body));
        }
        var stationJSON = JSON.stringify(station);
        return res.send(stationJSON);
    }
}
exports.create = function (req, res, next) {
    
    var station = new Station({
        name: 'pepe',
        type: 'Arduino',
        country: 'ARG',
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
    
    console.log("Creating");
    station.save(onSaved)

    function onSaved (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log("onSaved");
        return res.redirect('/');
    }
}


