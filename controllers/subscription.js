///////////////////////////////////////////////////////////////////////////////
// @file         : subscription.js                                           //
// @summary      : subscription model                                        //
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
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Collection of Subscriptions                         //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/getall                                             //
///////////////////////////////////////////////////////////////////////////////
exports.getAll = function (request, response, next) {
    
    response.contentType('application/json');
    Subscription.find(gotSubscriptions);
    
    function gotSubscriptions(err, subscriptions) {
        if (err) {
            console.log(err);
            return next();
        }
        var subscriptionsJSON = JSON.stringify(subscriptions);
        return response.send(subscriptionsJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to a specific Subscription                                          //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Subscription                                        //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/getbyid                                            //
///////////////////////////////////////////////////////////////////////////////
exports.getById = function (request, response, next) {
    
    response.contentType('application/json');
    Subscription.findById(request.params.id, gotSubscription);
    
    function gotSubscription(err, subscription) {
        if (err) {
            return next(err);
        }
        if(!subscription)
        {
            response.statusCode = 404;
            errJSON = JSON.stringify({"title": "error", "message":"Not Found","status":"fail"});
            return response.send(errJSON);
        }
        var subscriptionJSON = JSON.stringify(subscription);
        return response.send(subscriptionJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to add a Subscription                                               //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/create                                             //
///////////////////////////////////////////////////////////////////////////////
exports.create = function (request, response, next) {

    console.log('create-body: ' + JSON.stringify(request.body));
    var subscription = new Subscription({
        name: request.body.name,
        type: request.body.type,
        magic: Math.floor(Math.random() * 99999),
        created: new Date(),
        lastUpdate: new Date(),
        lastAccess: new Date(),
        isReady: false,
        stations: request.body.stations,
        order: request.body.order,
        selected: request.body.selected,
    });
    
    response.contentType('application/json');
    subscription.save(onSaved);

    function onSaved(err, subscription) {
        if (err) {
            console.log(err);
            return next(err);
        }
        console.log("onSaved");
        return response.send(JSON.stringify(subscription));
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to update a Subscription                                            //
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
exports.update = function (request, response, next) {
    
    response.contentType('application/json');
    console.log(JSON.stringify(request.body));

    Subscription.findById(request.params.id, updateSubscription);//findByIdAndUpdate({_id : request.params.id}, request.body, updateSubscription);
    
    function updateSubscription (error, subscription) {
        if (error) {
            console.log(error);
            return next(error);
        }
        if (!subscription) {
            console.log(error);
            return next(error);
        } 
        else {
            // is Ok
            console.log(JSON.stringify(request.body));
        }
        subscription.name = request.body.name || subscription.name;
        subscription.type = request.body.type || subscription.type;
        //subscription.magic = request.body.magic || subscription.magic;
        //subscription.created
        subscription.lastUpdate = new Date();
        subscription.lastAccess = new Date();
        //subscription.isReady 
        subscription.stations = request.body.stations || subscription.stations;
        subscription.order = request.body.order || subscription.order;
        subscription.selected = request.body.selected || subscription.selected;

        subscription.save(onSaved);

        function onSaved(error, station) {
            if (error) {
                console.log(error);
                return next(error);
            }
            console.log("onSaved");
            var subscriptionJSON = JSON.stringify(subscription);
            return response.send(subscriptionJSON);
        }
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove a Subscription                                            //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/remove/:id                                         //
///////////////////////////////////////////////////////////////////////////////
exports.remove = function (request, response, next) {
    
    response.contentType('application/json');
    Subscription.remove({_id: request.params.id}, delSubscription);
    
    function delSubscription(error, subscription) {
        if (error) {
            return next(error);
        }
        var msgJSON = JSON.stringify({action: 'remove', result: 0});
        return response.send(msgJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to store stations order                                             //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/reorder                                            //
///////////////////////////////////////////////////////////////////////////////
exports.reorder = function (request, response, next) {
    
    response.contentType('application/json');
    console.log('new order: %s', JSON.stringify(request.body));
    
    Subscription.findById(request.body._id, gotSubscription);
    
    function gotSubscription(error, subscription) {
        if (error) {
            return next(error);
        }
        subscription.order = request.body.ids;
        subscription.save(onSaved);
        function onSaved(error, subscription) {
            if (error) {
                console.log(error);
                return next(error);
            }
            console.log('subscription %s', JSON.stringify(subscription));
            return response.send(JSON.stringify(subscription));
        }
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove all Subscriptions                                         //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /subscription/removeall                                          //
///////////////////////////////////////////////////////////////////////////////
exports.removeall = function (request, response, next) {
    
    response.contentType('application/json');
    Subscription.find(gotSubscriptions);

    function gotSubscriptions(error, subscriptions) {
        if (error) {
            console.log(error)
            return next();
        }
        if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0)
        {
            console.log('no docs found');
            return next();
        }
        subscriptions.forEach(function (subscription) {
            subscription.remove(function (err, product) {
                console.log('document id:%d could not be removed', subscription._id);
                return next();
            });
        });
        var msgJSON = JSON.stringify({action: 'removeall', result: true});
        return response.send(msgJSON);
    }
};

