
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'),
    conf = require('./config'),
    cons = require('consolidate');
    mongoose = require('mongoose'),
    passport = require('passport'),
    Account = require('./models/account');
    LocalStrategy = require('passport-local').Strategy;


//console.log(cons);

var app = express();

// ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
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

// Configuration
app.configure(function(){
    app.engine('html', cons.mustache);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(allowCrossDomain);
    app.use(express.cookieParser());
    app.use(express.session({ secret: conf.sessionSecret }));
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

// Configure passport
var Account = require('./models/account');

passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
// Connect mongoose
mongoose.connect('mongodb://admin:12345@alex.mongohq.com:10062/cloud-db');
//var conn_db = mongo.db('admin:12345@alex.mongohq.com:10062/cloud-db');
mongoose.connection.on("open", function(){
  console.log("mongodb is connected!!");
});

// Routes
app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
 

app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
})
app.get('/app', routes.index);
app.post('/station', function(request, response){
  console.log(request.body);      // your JSON
  response.send(request.body);    // echo the result back
});
app.get('/setup', function(request, response) {
    response.contentType('application/json');
    /*
    var conn_db = mongo.db('admin:12345@alex.mongohq.com:10062/cloud-db');
    var collection = conn_db.collection('ladies');
    collection.insert({name: 'Hollywood Rose', members: ['Axl Rose', 'Izzy Stradlin', 'Chris Weber'], year: 1984}); 
    */
    var user = {
        "user":
        {
        	name: "MrX",
            last_name: null,
    		first_name: null,
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
// User validation 
app.get('/register', routes.register);
app.post('/register', function(req, res) {
        
        var username = req.body.username;
        console.log("registering: user: %s pass: %s", req.body.username, req.body.password);
        
        Account.findOne({username : username }, function(err, existingUser) {
            if (err || existingUser) {
                console.log("existingUser");
                return res.render('register', { account : account });
            }
            var account = new Account({ username : req.body.username, email: 'benja@benja.com'});
            account.setPassword(req.body.password, function(err) {
                if (err) {
                    return res.render('register', { account : account });
                }
                account.save(function(err) {
                    if (err) {
                        return res.render('register', { account : account });
                    }
                    res.redirect('/');
                });
            });
        });
    });
app.get('/login', function(req, res) {
        res.render('login', { user : req.user });
});
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

    
app.listen(conf.listenPort, function(){
  console.log("Express server listening on port %d in %s mode", process.env.PORT, app.settings.env);
});
