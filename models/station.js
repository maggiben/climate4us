///////////////////////////////////////////////////////////////////////////////
// @file         : station.js                                                //
// @summary      : station model                                             //
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

var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var Station = new Schema({
    name: { type: String, required: true, trim: true },
    type: String,
    country: String,
    state: String,
    city: String,
    latitude: Number,
    longitude: Number,
    magic: Number,
    sensors: [],
    created: { type: Date, default: Date.now },
    lastUpdate: Date,
    lastAccess: Date,
    isReady: Boolean,
    overview: Boolean,
    temperature: {
        value: Number, 
        unit: String
    },
    feelslike: [],
    humidity: { 
        value: Number, 
        dewpoint: Number, 
        unit: String
    },
    wind: { 
        value: Number, 
        direction: String, 
        degrees: Number, 
        unit: String
    },
    rainfall: { 
        value: Number, 
        unit: String
    },
    pressure: { 
        value: Number, 
        unit: String, 
        type: String
    }, 
    visibility: { 
        value: Number, 
        unit: String
    },
    astronomy: { 
            sunrise: Date, 
            sunset: Date 
    },
});

module.exports = mongoose.model('Station', Station);