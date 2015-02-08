var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var User = require('../dbschemas/user').User;
var Sub = require('../dbschemas/sub').Sub;

/* used to generate a random id for each post
 * because the normal mongodb id would be too short to be unique forever
 */
function generateId() {
    return crypto.randomBytes(64).toString('base64');
}

/* POST */
var postSchema = mongoose.Schema({
	id: { type: String, default: generateId },
	text: { type: String, required: true },
	imgsrc: { type: String },
	creators: [{ type: String, required:true }],
    /*comments: [
    	creator: { type: ObjectId, ref: 'User' },
    	text: String
    ],*/
    /*sub: { type: ObjectId, ref: 'Sub' }*/
    sub: { type: String, required: true },
	date_created: { type: Date, default: Date.now },
});

module.exports.Post = mongoose.model('Post', postSchema);
module.exports.PostSchema = postSchema;