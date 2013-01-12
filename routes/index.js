///////////////////////////////////////////////////////////////////////////////
// @file         : routes.js                                                 //
// @summary      : Routing controller                                        //
// @version      : 0.1                                                       //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 11 Ene 2013                                               //
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

var assets = {
    favicon: ['images/favicon.ico'],
    styles: ['http://fonts.googleapis.com/css?family=Comfortaa:400,300'
        , 'stylesheets/jquery-ui.css'
        , 'stylesheets/codemirror.css'
        , 'stylesheets/codemirror.themes/monokai.css'
        , 'stylesheets/jquery.terminal.css'
        , 'stylesheets/site.css'
    ],
    javascripts: ['javascripts/jquery-1.8.2.js'
        , 'javascripts/jquery.observable.js'
        , 'javascripts/jquery.ba-jqmq.js'
        , 'javascripts/jquery-ui.js'
        , 'javascripts/jquery.scrollTo.js'
        , 'javascripts/jquery.mousewheel.js'
        , 'javascripts/jquery.flot.js'
        , 'javascripts/jquery.ui.map.js'
        , 'javascripts/ICanHaz.js'
        , 'javascripts/sammy.js'
        , 'javascripts/modernizr.js'
        , 'javascripts/codemirror.js'
        , 'javascripts/mode/javascript.js'
        , 'javascripts/jquery.terminal-0.4.22.js'
        , 'javascripts/raphael.js'
        , 'javascripts/justgage.js'
        , 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places'
        , 'https://maps.gstatic.com/cat_js/intl/en_us/mapfiles/api-3/11/5/%7Bmain,places%7D.js'
        , 'javascripts/infobubble.js'
        , 'javascripts/application.js'
        , '/socket.io/socket.io.js'
        , 'javascripts/fernet.js'
    ]
}


exports.index = function(req, res){
    console.log("index");
    res.render('index', {
        title: 'Express',
        css: 'style.css',
        content: 'Hello Wold Express 3.x'
    });
};
exports.mobile = function(req, res){
    console.log("mobile");
    res.render('mobile', {
        title: 'Express',
        css: 'style.css',
        content: 'Hello Wold Express 3.x'
    });
};
exports.signin = function(req, res){
    console.log("signin");
    res.render('signin', {
        title: 'signin',
        css: 'style.css',
    });
};
