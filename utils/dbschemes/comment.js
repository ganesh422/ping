var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');

/* COMMENT */
var commentSchema = Schema({
    creator_uname: String,
    text: String
});

module.exports.Comment = mongoose.model('Comment', commentSchema);
module.exports.CommentSchema = commentSchema;