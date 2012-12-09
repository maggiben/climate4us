Climate4US
===========================

A very simple Node.js + Express boilerplate for Cloud9 projects.

## Install

Just use the Github URL when creating a Cloud9 project, npm install and you are ready to go.

## Includes

* Express 3.x framework
* consolidate Template engine consolidation library
* Mustache Template engine 
* Stylus expressive way to generate CSS.
* jQuery and jQuery UI (JavaScript Library)
* Sammy A Small Web Framework with Class / RESTFul Evented JavaScript
* mongodb is a scalable, high-performance, open source NoSQL database
* mongoose object modeling tool designed to work in an asynchronous environment.
* passport
** Simple, unobtrusive authentication for Node.js.
* passport-facebook & passport-local-mongoose

nice and simple ...

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


