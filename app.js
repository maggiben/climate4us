///////////////////////////////////////////////////////////////////////////////
// @file         : app.js                                                    //
// @summary      : main application module                                   //
// @version      : 0.1.3                                                     //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Dec 2012                                               //
// @milestones   :                                                           //
//                11 Ene 2012 - Account, Subscription and Stations           //
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

///////////////////////////////////////////////////////////////////////////////
// Module dependencies.                                                      //
///////////////////////////////////////////////////////////////////////////////
var express = require('express'),
    cons = require('consolidate'),
    mongoose = require('mongoose'),
    routes = require('./routes'),
    conf = require('./config'),    
    Station = require('./controllers/station'),
    Subscription = require('./controllers/subscription'),    
    Account = require('./models/account'),    
    Account_controller = require('./controllers/account');
    passport = require('passport'),    
    LocalStrategy = require('passport-local').Strategy;

///////////////////////////////////////////////////////////////////////////////
// Mongo setup middleware                                                    //
///////////////////////////////////////////////////////////////////////////////
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
        "hostname":"alex.mongohq.com",
        "port":10062,
        "username":"admin",
        "password":"12345",
        "name":"",
        "db":"cloud-db"
    };
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
};
var mongourl = generate_mongo_url(conf.mongohq);

///////////////////////////////////////////////////////////////////////////////
// Run app                                                                   //
///////////////////////////////////////////////////////////////////////////////
var app = express();

///////////////////////////////////////////////////////////////////////////////
// CORS middleware (only to test on cloud9)                                  //
///////////////////////////////////////////////////////////////////////////////
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

///////////////////////////////////////////////////////////////////////////////
// Configuration                                                             //
///////////////////////////////////////////////////////////////////////////////
app.configure(function(){
    app.engine('html', cons.mustache);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
    app.use(express.cookieParser());
    app.use(express.session({ secret: conf.sessionSecret }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
  app.use(express.errorHandler());
});

///////////////////////////////////////////////////////////////////////////////
// passport setup & strategy                                                 //
///////////////////////////////////////////////////////////////////////////////
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
// Connect mongoose 
mongoose.connect(mongourl);
// Check if connected
mongoose.connection.on("open", function(){
    console.log("mongodb connected at: %s", mongourl);
});

///////////////////////////////////////////////////////////////////////////////
// Rutes                                                                     //
///////////////////////////////////////////////////////////////////////////////
app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
// reusable middleware to test authenticated sessions
function ensureAuthenticated(request, response, next) {
    console.log(ensureAuthenticated);
    if(request.isAuthenticated()) {
        return next();
    }
    response.redirect('/signin'); // if failed...
}

///////////////////////////////////////////////////////////////////////////////
// Application rutes                                                         //
///////////////////////////////////////////////////////////////////////////////
app.get('/', ensureAuthenticated, function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
});
app.get('/app', routes.index);
app.get('/mobile', routes.mobile);

///////////////////////////////////////////////////////////////////////////////
// User authentication  rutes                                                //
///////////////////////////////////////////////////////////////////////////////
app.get('/signin', function(req, res) {
        res.render('signin', { title: 'signin', locale: 'en_US', user: req.user });
});
app.post('/signin', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            console.log("unauthorized");
            return res.render('signin', { title: 'bad login', locale: 'en_US', user: req.user });
        }
        req.logIn(user, function(err) {
            if (err) { 
                return next(err);
            }
        });
        console.log("auth okay");
        // redirect but pass route to client application
        return res.redirect('/');
    })(req, res, next);
});
app.get('/signup', function(req, res) {
        res.render('signup', { title: 'signin', locale: 'en_US', user: req.user });
});
app.post('/signup', function(req, res) {
        
        var username = req.body.username;
        console.log("registering: user: %s pass: %s", req.body.username, req.body.password);
        
        Account.findOne({username : username }, function(err, existingUser) {
            if (err || existingUser) {
                console.log("existingUser");
                return res.render('signup', { account : account });
            }
            var account = new Account({ username : req.body.username, email: req.body.username});
            account.setPassword(req.body.password, function(err) {
                if (err) {
                    return res.render('signup', { account : account });
                }
                account.save(function(err) {
                    if (err) {
                        return res.render('signup', { account : account });
                    }
                    return res.redirect('/');
                });
            });
        });
});
app.post('/forgot', function(req, res) {

    var email = req.body.email;
    var retJSON = "";
    console.log("forgot: email", email);
    //res.writeHead(401, {"Content-Type": "application/json"});
    res.contentType('application/json');

    Account.findOne({email : email }, function(err, existingUser) {
            if (err) {
                res.statusCode = 401;
                retJSON = JSON.stringify({"message":"Error","status":"fail"});
                return res.send(retJSON);
            }
            else if (existingUser) {
                console.log("sending email with new password to: %s", email);
                retJSON = JSON.stringify({"message":"Error","status":"fail"});
                return res.send(retJSON);
            }
            else {
                // Invalid login/password
                //res.writeHead(401, {"Content-Type": "application/json"});
                //res.end(JSON.stringify({error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}}));
                res.statusCode = 401;
                var ret = {error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}};
                retJSON = JSON.stringify(ret);
                return res.send(retJSON);
            }
    });
});
app.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/account/getbyid/:id', ensureAuthenticated, Account_controller.getAccountById);
app.get('/account/getAccount', ensureAuthenticated, Account_controller.getAccount);
app.put('/account/subscription', ensureAuthenticated, Account_controller.setSubscription);


///////////////////////////////////////////////////////////////////////////////
// Subscription rutes                                                        //
///////////////////////////////////////////////////////////////////////////////
app.get('/subscription/getall', Subscription.getAll);
app.get('/subscription/getbyid/:id', ensureAuthenticated, Subscription.getById);
app.post('/subscription/create', Subscription.create);
app.delete('/subscription/remove/:id', Subscription.remove);
app.put('/subscription/reorder/:id', Subscription.reorder);
app.put('/subscription/update/:id', Subscription.update);

///////////////////////////////////////////////////////////////////////////////
// Station rutes                                                             //
///////////////////////////////////////////////////////////////////////////////
app.get('/station/getall', Station.getAll);
app.get('/station/getbyid/:id', Station.getById);
app.post('/station/create', Station.create);
app.put('/station/update/:id', Station.update);
app.delete('/station/remove/:id', Station.remove);
app.get('/station/removeall', Station.removeall);

///////////////////////////////////////////////////////////////////////////////
// API Key Generation rutes                                                  //
///////////////////////////////////////////////////////////////////////////////
app.get('/clients',  function(request, response, next) {
    response.contentType('application/json');
    var mock = {"clients":[{"created_at":"2012-12-18T04:50:25Z","urls":{"self":"https://secure.gaug.es/clients/5ddfdb50358f68fa55670adbc3d86ea2"},"description":"popopo","key":"5ddfdb50358f68fa55670adbc3d86ea2"}]}
    var retJSON = JSON.stringify(mock);
    return response.send(retJSON);
});
app.post('/clients',  function(request, response, next) {
    var description = request.body.description;
    var key = Math.floor(Math.random() * 99999999999999);
    var self = "http://" + process.env.IP + "/clients/" + key;

    console.log("Generating new API Key for: ", description);
    response.contentType('application/json');
    var mock = { 
        "client":[{
            "created_at": new Date(),
            "urls": { "self": self},
            "description": description,
            "key": key
        }]
    };
    mock = {"client":{"created_at":"2012-12-18T16:27:56Z","urls":{"self":"https://secure.gaug.es/clients/429edc9f0fae89c849b7b335dbf5c760"},"description":"octo","key":"429edc9f0fae89c849b7b335dbf5c760"}};
    var retJSON = JSON.stringify(mock);
    return response.send(retJSON);
});

///////////////////////////////////////////////////////////////////////////////
// socket.io                                                                 //
///////////////////////////////////////////////////////////////////////////////
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

server.listen(conf.listenPort);

///////////////////////////////////////////////////////////////////////////////
// socket.io event listeners                                                 //
///////////////////////////////////////////////////////////////////////////////
io.sockets.on('connection', function (socket) {
    
    io.sockets.emit('this', { will: 'be received by everyone'});
    
    socket.on('message', function (message) {
        console.log("Got message: " + message);
        ip = socket.handshake.address.address;
        url = message;
        io.sockets.emit('news', { 'connections': Object.keys(io.connected).length, 'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1), 'url': url, 'xdomain': socket.handshake.xdomain, 'timestamp': new Date()});
    });
    socket.on('my other event', function (data) {
        console.log('my other event' + data);
    });
    socket.on('consoleio', function (data) {
        console.log('consoleio' + JSON.stringify(data));
        data.message = data.message || {};
        switch(data.message)
        {
            case 'exec':
                
                var spawn = require('child_process').spawn;
                var exec = spawn(data.command, data.arguments); //spawn(data.command, data.arguments);
                exec.stdout.setEncoding('ascii');
                exec.stderr.setEncoding('ascii');
                
                exec.stdout.on('data', function (data) {
                  console.log('stdout: ' + data);
                  io.sockets.emit('consoleio', { message: 'exec', io: 'stdout', command: data.command, result: data });
                });
                
                exec.stderr.on('data', function (data) {
                    console.log('stderr: ' + data);
                    io.sockets.emit('consoleio', { message: 'exec', io: 'stderr', command: data.command, result: data });
                });
                
                exec.on('exit', function (code) {
                    console.log('child process exited with code ' + code);
                    io.sockets.emit('consoleio', { message: 'exec', command: data.command, result: 'exit' });
                });
                break;
                
        }
        io.sockets.emit('consoleio', { event: 'message received', data: data});
    });
    socket.on('disconnect', function () {
        console.log("Socket disconnected");
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length });
    });

});
