///////////////////////////////////////////////////////////////////////////////
// FileName     : subscription.js                                            //
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

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Subscription = new Schema({
    name: { type: String, required: true, trim: true },
    type: String,
    magic: Number,
    created: { type: Date, default: Date.now },
    lastUpdate: { type: Date, default: Date.now },
    lastAccess: { type: Date, default: Date.now },
    isReady: Boolean,
    stations: [],
    humidity: { 
        value: Number, 
        dewpoint: Number, 
        unit: String
    }
});

module.exports = mongoose.model('Subscription', Subscription);