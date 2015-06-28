var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var User = require('../dbmodels/user').User;
var Sub = require('../dbmodels/sub').Sub;

/* used to generate a random id for each post
 * because the normal mongodb id would be too short to be unique forever
 */
function generateId() {
    return crypto.randomBytes(64).toString('base64');
}

function toLower(str){
    return str.toLowerCase();
}

/* POST */
var postSchema = mongoose.Schema({
	id: { type: String, default: generateId },
    title: { type: String, required: true },
	text: { type: String, required: true },
	imgsrc: { type: String },
	creators: [{ type: String, required:true }],
    /*comments: [
    	creator: { type: ObjectId, ref: 'User' },
    	text: String
    ],*/
    /*sub: { type: ObjectId, ref: 'Sub' }*/
    sub: { type: String, set: toLower, required: true },
	date_created: { type: Date, default: Date.now },
});

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.PostSchema = postSchema;