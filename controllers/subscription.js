///////////////////////////////////////////////////////////////////////////////
// @file         : subscription.js                                           //
// @summary      : subscription controller                                   //
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
var subscription_schema = require('../models/subscription')
  , Subscription = mongoose.model('Subscription', subscription_schema);
  
///////////////////////////////////////////////////////////////////////////////
// Route to get all Subscriptions                                            //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON Collection of Subscriptions                         //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/getall                                             //
///////////////////////////////////////////////////////////////////////////////

exports.getAll = function (req, res, next) {
    
    res.contentType('application/json');
    Subscription.find(gotSubscriptions);
    
    function gotSubscriptions (err, subscriptions) {
        if (err) {
            console.log(err);
            return next();
        }
        var subscriptionsJSON = JSON.stringify(subscriptions);
        return res.send(subscriptionsJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to a specific Subscription                                          //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON Subscription                                        //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/getbyid                                            //
///////////////////////////////////////////////////////////////////////////////
exports.getById = function (req, res, next) {
    
    res.contentType('application/json');
    Subscription.findById(req.params.id, gotSubscription);
    
    function gotSubscription (err, subscription) {
        if (err) {
            return next(err);
        }
        var subscriptionJSON = JSON.stringify(subscription);
        return res.send(subscriptionJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to add a Subscription                                               //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/create                                             //
///////////////////////////////////////////////////////////////////////////////
exports.create = function (req, res, next) {
    
    var name = req.body.name;
    console.log("name: ", name);

    //console.log("para: " + JSON.stringify(req.params));
    console.log('create-body: ' + JSON.stringify(req.body));
    
    var subscription = new Subscription({
        name: "name",
        type: "String",
        magic: 1234,
        created: new Date(),
        lastUpdate: new Date(),
        lastAccess: new Date(),
        isReady: false,
        stations: [],
        humidity: { 
            value: 5, 
            dewpoint: 5, 
            unit: 'A'
        }
    });
    
    res.contentType('application/json');
    subscription.save(onSaved);

    function onSaved (err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log("onSaved");
        return res.send(JSON.stringify(subscription));
    }
};


///////////////////////////////////////////////////////////////////////////////
// Route to remove a Subscription                                            //
//                                                                           //
// @param {Object} req                                                       //
// @param {Object} res                                                       //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/remove/:id                                         //
///////////////////////////////////////////////////////////////////////////////
exports.remove = function (req, res, next) {
    
    res.contentType('application/json');
    Subscription.remove({_id: req.params.id}, delSubscription);
    
    function delSubscription (err) {
        if (err) {
            return next(err);
        }
        var msgJSON = JSON.stringify({action: 'remove', result: 0});
        return res.send(msgJSON);
    }
};

