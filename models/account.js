var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('../node_modules/passport-local-mongoose/lib/passport-local-mongoose.js');

var Account = new Schema({
    nickname: String,
    email: String,
    country: String,
    birthdate: Date,
    subscription: String,
    subscriptions: { type: Array, required: false },
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);