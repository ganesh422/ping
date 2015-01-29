var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var Post = require('post.js').Post;
var User = require('user.js').User;

/* COMMUNITY */
var subSchema = Schema({
	name: { type: String, required: true, unique: true },
	date_creation: { type: Date, default: Date.now },
	posts [{ type: ObjectId, ref: 'Post' }]
});

module.exports.Sub = mongoose.model('Sub', subSchema);
module.exports.SubSchema = subSchema;