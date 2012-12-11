Climate4US
===========================

A very simple Node.js + Express boilerplate for Cloud9 projects.

## Includes

* [Express](http://expressjs.com/): 3.x Application Framework for Node.js
* [Mongoose](http://mongoosejs.com/): Node.JS ORM for Mongo
* [cluster](http://learnboost.github.com/cluster): extensible multi-core server manager
* consolidate Template engine consolidation library
* Mustache Template engine 
* Stylus expressive way to generate CSS.
* [socket.io](https://github.com/learnboost/Socket.IO-node): The cross-browser WebSocket
* Sammy A Small Web Framework with Class / RESTFul Evented JavaScript
* mongodb is a scalable, high-performance, open source NoSQL database
* mongoose object modeling tool designed to work in an asynchronous environment.
* passport Simple, unobtrusive authentication for Node.js.
* passport-facebook & passport-local-mongoose

nice and simple ...

## Requires

### You need to manually install: 

  - [Node.js](http://nodejs.org/): Amazing javascript asynchronous IO library, install manually.
  - [MongoDB](http://www.mongodb.org): NoSQL Database, install manually.
  - [NPM](http://npmjs.org/): Node package manager, used to install the remaining.

### And then install via NPM: 

  - [Express](http://expressjs.com/): Application Framework for Node.js
  - [Mongoose](http://mongoosejs.com/): Node.JS ORM for Mongo
  - [ejs](http://embeddedjs.com/): EmbeddedJS Templating
  - [cluster](http://learnboost.github.com/cluster): extensible multi-core server manager
  - log: Tiny logger with streaming reader
  - [connect](https://github.com/senchalabs/connect): High performance middleware framework
  - mime: A comprehensive library for mime-type mapping
  - qs: querystring parser
  - [expresso](https://github.com/visionmedia/expresso): TDD framework, light-weight, fast, CI-friendly
  - should: test framework agnostic BDD-style assertions
  - [socket.io](https://github.com/learnboost/Socket.IO-node): The cross-browser WebSocket

### But I've included in this project:

  - [jQuery](http://jquery.com/): Javascript Library
  - [jQuery UI](http://jqueryui.com/): UI Library
  - [jQuery scrollTo]
  - [ICanHaz](): Mustache template engine
  - [sammy](): A Small Web Framework with Class / RESTFul Evented JavaScript
  - [modernizr](): HTML5 browser feature detection

## Installation

#### Deploy on Cloud9 IDE: 

<!---->

    Just use the Github URL when creating a Cloud9 project, npm install and you are ready to go.

> For more installation detail please see Cloud9 [faq](https://c9.io/site/category/faq/)

#### Deploy Locally: 

  - Install node.js 

<!---->

      // on osx with brew
      brew update
      brew install node
    
      // build from source
      git clone git://github.com/joyent/node.git
      ./configure
      make
      make install
  
  - Ininstall mongodb
  
<!---->

      // on osx with brew
      brew update
      brew install mongodb
    
      // create db folder
      mkdir -p /usr/local/db/

> For more installation detail please see [this](http://www.mongodb.org/display/DOCS/Quickstart)
    
  - Install npm

<!---->

    curl http://npmjs.org/install.sh | clean=no sh
    
  - Install required packages


#### Account model
```js
var Account = new Schema({
    nickname: String,
    email: String,
    country: String,
    birthdate: Date
});
```

#### Stations model
```js
var Station = new Schema({
    name: { type: String, required: true, trim: true },
    id: Number,
    type: String,
    country: String,
    state: String,
    city: String,
    latitude: Number,
    longitude: Number,
    magic: Number,
    sensors: [],
    created: { type: Date, default: Date.now },
    temperature: [{
        value: Number, 
        unit: String
    }],
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
    updated: { type: Date, default: Date.now }
});

```
#### MongoDB query with JSON emitter
```js
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
```

```js
```