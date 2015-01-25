/**
 * Copyright (c) 2015 Michael Koeppl
 *
 * Created by mko on 25/01/15.
 *
 * user scheme related things
 */

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var sha1 = require('sha1');
var logger = require('../logger');

/*
 * more information about the user relationships, etc.:
 * https://gist.github.com/mkocs/28a23e2e7e6f82dfa396
 * https://gist.github.com/mkocs
 * http://stackoverflow.com/questions/26008555/foreign-key-mongoose
 * http://stackoverflow.com/questions/17244825/mongoose-linking-objects-to-each-other-without-duplicating
 * http://mongoosejs.com/docs/api.html#model_Model.populate
 */

var SAFE_COLS_TO_RETURN = function() {
    return {
        _id:1,
        pseudo:1,
        eaddress:1,
        name: 1
    };
};

/* password encryption sha1 */
function hash(wp) {
    return sha1(wp);
}

/* set encrypted password
 * called before password is set
 */
function setPassword(wp){
    wp = hash(wp);
    logger.debug('pw sha1 ' + wp);
    return wp;
}

/* used to make sure that an email address
 * is lower case when saved into the db
 * otherwise one email could create multiple
 * account
 */
function toLower(str){
    return str.toLowerCase();
}


/* USER SCHEMA */
var UserSchema = mongoose.Schema({
    eaddress: { type: String, required: true, set: toLower, trim: true },
    name: { type: String, required: true },
    pseudo: {type: String, trim: true },
    wp: { type: String, required: true, set: setPassword },
    date_joined: { type: Date, default: Date.now },
    friends: [{ type: ObjectId, ref: 'User' }],
    subs: [ObjectId],
    posts: [ObjectId]
},{ strict: true });

// create model of user schema
User = mongoose.model('User', UserSchema);

// make sure pseudonym is unique (unique keyword above doesn't work)
User.schema.path('eaddress').validate(function (value, respond) {                                                                                           
    User.findOne({ eaddress: value }, function (err, user) {                                                                                                
        if(user){
            respond(false);
        }else{
            respond(true);
        }                                                                                                                       
    });                                                                                                                                                  
}, 'This email address is already registered');

// make sure pseudonym is unique (unique keyword above doesn't work)
User.schema.path('pseudo').validate(function (value, respond) {                                                                                           
    User.findOne({ pseudo: value }, function (err, user) {                                                                                                
        if(user){
            // in case the user wants no pseudonym
            // "" duplicates are allowed
            if(user.pseudo == undefined){
                respond(true);
            }else{
                respond(false);
            }  
        }else{
            respond(true);
        }                                                                                                                       
    });                                                                                                                                                  
}, 'This pseudonym is already registered');

module.exports.User = User;
module.exports.UserSchema = UserSchema;