var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');

/* POST */
var postSchema = mongoose.Schema({
	text: { type: String, required: true },
	imgsrc: { type: String },
    comments: [
    ]
});

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.PostSchema = postSchema;