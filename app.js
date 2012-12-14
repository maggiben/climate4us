///////////////////////////////////////////////////////////////////////////////
// FileName     : app.js                                                     //
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

///////////////////////////////////////////////////////////////////////////////
// Module dependencies.                                                      //
///////////////////////////////////////////////////////////////////////////////
var express = require('express'),
    routes = require('./routes'),
    conf = require('./config'),
    cons = require('consolidate'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Account = require('./models/account'),
    //Station = require('./models/station'),
    Station = require('./controllers/station'),
    Subscription = require('./controllers/subscription'),
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
var mongourl = generate_mongo_url(mongo);

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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
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
function ensureAuthenticated(req, res, next) {
    console.log(ensureAuthenticated);
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin'); // if failed...
}

///////////////////////////////////////////////////////////////////////////////
// Application rutes                                                         //
///////////////////////////////////////////////////////////////////////////////
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
})
app.get('/app', routes.index);
app.post('/station', function(request, response){
  console.log(request.body);      // your JSON
  response.send(request.body);    // echo the result back
});
app.get('/start', function(request, response) {
    // We want to set the content-type header so that the browser understands
    //  the content of the response.
    response.contentType('application/json');

    // Normally, the would probably come from a database, but we can cheat:
    var last_7_days = [
    { views_size: '05px', people_size: '25px' },
    { views_size: '10px', people_size: '20px' },
    { views_size: '15px', people_size: '15px' },
    { views_size: '20px', people_size: '10px' },
    { views_size: '25px', people_size: '05px' },
    { views_size: '20px', people_size: '00px' },
    { views_size: '10px', people_size: '10px' },
    ];
    
  // Since the request is for a JSON representation of the people, we
  //  should JSON serialize them. The built-in JSON.stringify() function
  //  does that.
  var last_7_daysJSON = JSON.stringify(last_7_days);

  // Now, we can use the response object's send method to push that string
  //  of people JSON back to the browser in response to this request:
  response.send(last_7_daysJSON);
});
app.get('/subscription', function(request, response) {
    // We want to set the content-type header so that the browser understands
    //  the content of the response.
    response.contentType('application/json');

    var user = {
    "user":
        {
        	name: "MrX",
            last_name:null,
    		first_name:null,
            email: "benjaminmaggi@gmail.com",
            id: "50bc04d3613f5d6105000002",
    		urls:
    			{
    				"self":"https://secure.gaug.es/me",
    				"gauges":"https://secure.gaug.es/gauges",
    				"clients":"https://secure.gaug.es/clients"
    			},
    	}
    };
    // Since the request is for a JSON representation of the people, we
    //  should JSON serialize them. The built-in JSON.stringify() function
    //  does that.
    var userJSON = JSON.stringify(user);

    // Now, we can use the response object's send method to push that string
    //  of people JSON back to the browser in response to this request:
    response.send(userJSON);
});
// test
app.get('/test', function(request, response) {
    console.log("test"); 
    if(request.isAuthenticated()) {
        console.log("no auth"); 
    }
    else {
        console.log("no auth"); 
    }
    response.contentType('application/json');
    response.send(JSON.stringify({isAuthenticated: request.isAuthenticated(),message: "what happened"}));
});
// Mongoose
app.post('/station/add', Station.create, function(req, res) {
    console.log('body: ' + JSON.stringify(req.body));
    res.contentType('application/json');
    return res.send(JSON.stringify({ack:{type:"test",message:"received ok", code:"441"}}));
});
app.get('/mongo', Station.create);
app.get('/setupStation/:id', Station.setupStation);
app.get('/getStations', Station.getStations);
app.post('/changeStation/:id', Station.update);

///////////////////////////////////////////////////////////////////////////////
// User authentication  rutes                                                //
///////////////////////////////////////////////////////////////////////////////
app.get('/signin', function(req, res) {
        res.render('signin', { title: 'signin', locale: 'en_US', user: req.user });
});
app.post('/signin', function(req, res, next) {
    console.log("autenticating")
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
    console.log("forgot: email", email);
    //res.writeHead(401, {"Content-Type": "application/json"});
    res.contentType('application/json');

    Account.findOne({email : email }, function(err, existingUser) {
            if (err) {
                var ret = {"message":"Error","status":"fail"}
                res.statusCode = 401;
                var retJSON = JSON.stringify(ret);
                return res.send(retJSON);
            }
            else if (existingUser) {
                console.log("sending email with new password to: %s", email);
                var ret = {"message":"Sucess found email sent","status":"ok"}
                var retJSON = JSON.stringify(ret);
                return res.send(retJSON);
            }
            else {
                // Invalid login/password
                //res.writeHead(401, {"Content-Type": "application/json"});
                //res.end(JSON.stringify({error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}}));
                res.statusCode = 401;
                var ret = {error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}};
                var retJSON = JSON.stringify(ret);
                return res.send(retJSON);
            }
    });
});
app.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
});

///////////////////////////////////////////////////////////////////////////////
// Subscription rutes                                                        //
///////////////////////////////////////////////////////////////////////////////
app.get('/subscription/getall', Subscription.getAll);
app.get('/subscription/getbyid/:id', Subscription.getById);
app.get('/subscription/create', Subscription.create);
app.delete('/subscription/remove/:id', Subscription.remove);

///////////////////////////////////////////////////////////////////////////////
// Station rutes                                                             //
///////////////////////////////////////////////////////////////////////////////
app.get('/station/getall', Station.getAll);
app.get('/station/getbyid/:id', Station.getById);
app.get('/station/create', Station.create);
app.post('/station/update/:id', Station.update);
app.delete('/station/remove/:id', Station.remove);
app.get('/station/removeall', Station.removeall);

app.listen(conf.listenPort, function(){
  console.log("Express server listening on port %d in %s mode", process.env.PORT, app.settings.env);
});
