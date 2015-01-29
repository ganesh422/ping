var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var User = require('User').User;

/* POST */
var postSchema = mongoose.Schema({
	text: { type: String, required: true },
	imgsrc: { type: String },
	creators[{ type: ObjectId, ref: 'User' }]
    comments: [
    	creator: { type: ObjectId, ref: 'User' },
    	text: String
    ]
});

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.PostSchema = postSchema;