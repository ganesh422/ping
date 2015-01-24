

var mongoose = require('mongoose');

/* USER */
var userSchema = mongoose.Schema({
    eaddress: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    pseudo: {type: String, unique: true },
    wp: { type: String, required: true },
    date_joined: { type: Date, default: Date.now },
    friends: [
    	{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  	],
    subs: [
    	{ type: mongoose.Schema.Types.ObjectId, ref: 'Sub'}
    ],
    posts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
    ]
},{ strict: true });

/* COMMUNITY */
var subSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true },
	date_creation: { type: Date, default: Date.now },
});

/* POST */
var postSchema = mongoose.Schema({
	text: { type: String, required: true },
	imgsrc: { type: String },
    comments: [
    ]
});

/* COMMENT */
var commentSchema = mongoose.Schema({
    creator_uname: String,
    text: String
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Sub = mongoose.model('Sub', subSchema);
module.exports.Post = mongoose.model('Post', postSchema);
module.exports.Comment = mongoose.model('Comment', commentSchema);