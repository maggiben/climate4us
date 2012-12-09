var mongoose = require('mongoose'),
    Schema = mongoose.Schema

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
    lastUpdate: Date,
    lastAccess: Date,
    isReady: Boolean,
    overview: Boolean,
    temperature: {
        value: Number, 
        unit: String
    },
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
    astronomy: { 
            sunrise: Date, 
            sunset: Date 
    },
});

module.exports = mongoose.model('Station', Station);