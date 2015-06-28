/**
 * Copyright (c) 2015 Michael Koeppl
 *
 * Created by mko on 25/01/15.
 *
 * user scheme related things
 */

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var crypto = require('crypto');
var statics = require('../../utils/statics');

/*
 * more information about the user relationships, etc.:
 * https://gist.github.com/mkocs/28a23e2e7e6f82dfa396
 * https://gist.github.com/mkocs
 * http://stackoverflow.com/questions/26008555/foreign-key-mongoose
 * http://stackoverflow.com/questions/17244825/mongoose-linking-objects-to-each-other-without-duplicating
 * http://mongoosejs.com/docs/api.html#model_Model.populate
 * http://mongoosejs.com/docs/api.html#types_array_MongooseArray-pull
 */

/* set pbkdf2 encrypted password
 * called before password is set
 * http://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_callback
 * https://crackstation.net/hashing-security.htm
 * for dart: https://pub.dartlang.org/packages/cipher
 */
function setPassword(passwd){
    return crypto.pbkdf2Sync(passwd , this.salt, statics.PBKDF2_ITERATIONS, statics.PBKDF2_LENGTH);
}

/* used to generate a random salt for each user */
function generateSalt() {
    return crypto.randomBytes(statics.SALT_LENGTH).toString('base64');
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
    email: { type: String, required: true, set: toLower, trim: true },
    name: { type: String, required: true },
    pseudonym: {type: String, trim: true },
    passwd: { type: String, required: true, set: setPassword },
    salt: { type: String, default: generateSalt },
    date_joined: { type: Date, default: Date.now },
    friends: [{ type: String }],
    subs: [{type: String, required: true}]
},{ strict: true });

// exposed method to update fields
UserSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};

// create model of user schema
User = mongoose.model('User', UserSchema);

// make sure pseudonym is unique
User.schema.path('email').validate(function (value, respond) {                                                                                           
    User.findOne({ email: value }, function (err, user) {                                                                                                
        if(user){
            respond(false);
        }else{
            respond(true);
        }                                                                                                                       
    });                                                                                                                                                  
}, statics.EMAIL_IN_USE.toString());

// make sure pseudonym is unique
User.schema.path('pseudonym').validate(function (value, respond) {                                                                                           
    User.findOne({ pseudonym: value }, function (err, user) {                                                                                                
        if(user){
            // in case the user wants no pseudonym
            // "" duplicates are allowed
            if(user.pseudonym == undefined){
                respond(true);
            }else{
                respond(false);
            }  
        }else{
            respond(true);
        }                                                                                                                       
    });                                                                                                                                                  
}, statics.PSEUDO_IN_USE.toString());

module.exports.User = User;
module.exports.UserSchema = UserSchema;