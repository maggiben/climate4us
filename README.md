Climate4US
===========================

A very simple Node.js + Express boilerplate for Cloud9 projects.

## Install

Just use the Github URL when creating a Cloud9 project, npm install and you are ready to go.

## Includes

* Express framework
* Mustache template engine with consolidate.JS
* Stylus CSS engine
* jQuery and jQuery UI
* mongodb with mongoose
* passport with passport-facebook & passport-local-mongoose

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


