var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var Post = require('../dbschemas/post.js').Post;
var User = require('../dbschemas/user.js').User;

/* COMMUNITY */
var subSchema = Schema({
	name: { type: String, required: true, unique: true },
	admins: [{ type:String, required: true }],
	date_creation: { type: Date, default: Date.now },
});

Sub = mongoose.model('Sub', subSchema);

// make sure pseudonym is unique (unique keyword above doesn't work)
Sub.schema.path('name').validate(function (value, respond) {                                                                                           
    Sub.findOne({ name: value }, function (err, sub) {                                                                                                
        if(sub){
            respond(false);
        }else{
            respond(true);
        }                                                                                                                       
    });                                                                                                                                                  
}, 'This sub name already exists.');

module.exports.Sub = Sub;
module.exports.SubSchema = subSchema;