/**
 * Copyright (c) 2015 Michael Koeppl
 *
 * Created by mko on 04/02/15.
 *
 * database related functions
 */

// general dependencies
var logger = require('../utils/logger');
var statics = require('../utils/statics');
var misc = require('../utils/misc');
var crypto = require('crypto');
var colors = require('colors');

// store all the user's usernames
var userlist =[];

module.exports = {
	insert_signup_mdb: function(email, name, pseudonym, passwd, ip, callback){
		insert_signup_mdb(email, name, pseudonym, passwd, ip, callback);
	}, login_mdb: function(emailpseudonym, passwd, ip, callback){
		login_mdb(emailpseudonym, passwd, ip, callback);
	}, userlist_add_user: function(pseudonym){
		userlist_add_user(pseudonym);
	}, userlist_remove_user: function(pseudonym){
		userlist_remove_user(pseudonym);
	}, find_user_by_pseudonym: function(pseudonym, ip, callback){
		find_user_by_pseudonym(pseudonym, ip, callback);
	}, insert_new_sub: function(name, id, admin, ip, callback){
		insert_new_sub(name, id, admin, ip, callback);
	}, fetch_subs: function(pseudonym, ip, callback){
		fetch_subs(pseudonym, ip, callback);
	}, insert_new_post: function(creator, title, text, sub, ip, callback){
		insert_new_post(creator, title, text, sub, ip, callback);
	}
};

module.exports.user_list = userlist;

/*
 * mongoDB dependencies
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pingdb', {server:{poolSize: 5}});
logger.debug('connected to mongodb.');
var dbcon = mongoose.connection;

// schemas
var User = require('../utils/dbschemas/user.js').User;
var Sub = require('../utils/dbschemas/sub.js').Sub;
var Post = require('../utils/dbschemas/post.js').Post;


// =============================================
// =======LOGIN/SIGNUP RELATED FUNCTIONS========
// =============================================
/*
 * Registration method
 *
 * callback is where we return our status codes
 */
function insert_signup_mdb(email, name, pseudonym, passwd, ip, returnData /*callback*/){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(result_status = statics.INTERNAL_ERROR);
	});

	// the new user itself is created based on the model
	// the data given by the user is inserted
	var newUser = new User({
		email: email,
		name: name,
	    pseudonym: pseudonym,
	    passwd: passwd,
	    subs: 'All'
	});

	newUser.save(function(err){
		if(err){
			if(err.toString() == 'ValidationError: ' + statics.PSEUDO_IN_USE.toString() + ', ' + statics.EMAIL_IN_USE.toString()){
		      	logger.error(ip.bold.white + ': user (email ("'+email.white+'") and pseudo ("'+pseudonym.white+'")) already exists');
                returnData(statics.EMAILPSEUDO_IN_USE);
		    }else if(err.toString() == 'ValidationError: ' + statics.EMAIL_IN_USE){
		      	logger.error(ip.bold.white + ': user (email ("'+email.white+'")) already exists.');
                returnData(statics.EMAIL_IN_USE);
		    }else if(err.toString() == 'ValidationError: ' + statics.PSEUDO_IN_USE){
		      	logger.error(ip.bold.white + ': user (pseudonym ("'+pseudonym.white+'")) already exists.');
                returnData(statics.PSEUDO_IN_USE);
		    }else{
		      	logger.error(err + ' (' + ip.bold.white + ')');
                returnData(statics.INTERNAL_ERROR);
		    }
		}else {
            // successful registration
            logger.info(ip.white.bold + ': new user ' + name.white.bold + ' / ' + email.white.bold + ' registered!');
            returnData(statics.REGISTRATION_SUC);
        }
	});
}

/*
 * login method
 *
 * callback is where we return our status codes
 */
function login_mdb(emailpseudonym, passwd, ip, returnData /*callback*/){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(statics.INTERNAL_ERROR);
	});

	if(misc.checkIfEmailInString(emailpseudonym)){
		var query = User.findOne({'email': emailpseudonym.toLowerCase()});
	}else{
		var query = User.findOne({'pseudonym': emailpseudonym});
	}

	query.select('passwd salt pseudonym _id email');

	query.exec(function(err, result){
		if(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        	returnData(statics.INTERNAL_ERROR);
		}

		if(result){
			if(result.passwd == crypto.pbkdf2Sync(passwd, result.salt, statics.PBKDF2_ITERATIONS, statics.PBKDF2_LENGTH)){
				logger.info(ip.white.bold + ': user (credentials: ' + emailpseudonym.white + ') logged in.');
		    	userlist_add_user(result.pseudonym);
				returnData(statics.LOGIN_SUC, result.pseudonym, result._id, result.email);
			}else{
				logger.warn(ip.white.bold + ': user (credentials: ' + emailpseudonym.white + ') entered invalid password.');
				returnData(statics.INVALID_WP);
			}
		}else{
			logger.warn(ip.white.bold + ': query for user (credentials: ' + emailpseudonym.white + ') returned no result.');
			returnData(statics.ACCOUNT_NOT_FOUND);
		}
	});
}

// add user to list of currently online users
function userlist_add_user(pseudonym){
	userlist.push(pseudonym);
	logger.info('Number of users online: ' + userlist.length);
	userlist.forEach(function(entry) {
		logger.info(entry);
	});
}

// remove user from list of currently online users
function userlist_remove_user(pseudonym){
	userlist.splice(userlist.indexOf(pseudonym, 1));
	logger.info('Number of users online: ' + userlist.length);
	userlist.forEach(function(entry) {
		logger.info(entry);
	});
}

// =============================================
// ==========PROFILE RELATED FUNCTIONS==========
// =============================================
function find_user_by_pseudonym(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(statics.INTERNAL_ERROR);
	});

	var query = User.findOne({'pseudonym': pseudonym});

	query.select('_id pseudonym email');

	query.exec(function(err, result){
		if(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        	returnData(statics.INTERNAL_ERROR);
		}

		if(result){
			returnData(null, result.pseudonym, result._id, result.email);
		}else{
			logger.warn(ip.white.bold + ': query for user (credentials: ' + pseudonym.white + ') returned no result.');
			returnData(statics.ACCOUNT_NOT_FOUND);
		}
	});
}

// =============================================
// ============SUB RELATED FUNCTIONS============
// =============================================
function insert_new_sub(name, id, admin, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(result_status = statics.INTERNAL_ERROR);
	});

	// the new user itself is created based on the model
	// the data given by the user is inserted
	var newSub = new Sub({
		name: name,
	    admins: admin
	});

	newSub.save(function(err){
		if(err){
			if(err.toString() == 'ValidationError: ' + statics.SUB_NAME_IN_USE.toString()){
		      	logger.error(ip.bold.white + ': sub with name "'+name.white+'" already exists');
                returnData(statics.SUB_NAME_IN_USE);
		    }else{
		      	logger.error(err + ' (' + ip.bold.white + ')');
                returnData(statics.INTERNAL_ERROR);
		    }
		}else {
            // successful

            // add newly created sub to the creator's subs
            User.findByIdAndUpdate(
		    	id,
		    	{$push: {"subs": name}},
		    	{safe: true, upsert: true},
		    	function(err, model) {
		    		if(err){
		        		logger.error(err.toString());
		        	}
		    	}
			);
            logger.info(ip.white.bold + ': new sub ' + name.white.bold + ' with admin ' + admin.white.bold + ' created!');
            returnData(statics.NEWSUB_SUC);
        }
	});
}

function fetch_subs(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(result_status = statics.INTERNAL_ERROR);
	});

	var query = User.findOne({'pseudonym': pseudonym});

    query.select('subs');

    query.exec(function(err, result){
    	if(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        	returnData(statics.INTERNAL_ERROR);
		}

		if(result){
		    returnData(result.subs)
		}else{
		    logger.warn(ip.white.bold + ': query for user (credentials: ' + pseudonym + ') returned no result.');
			returnData(statics.ACCOUNT_NOT_FOUND);
		}
    });
}

// =============================================
// ============POST RELATED FUNCTIONS===========
// =============================================
function insert_new_post(creator, title, text, sub, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(result_status = statics.INTERNAL_ERROR);
	});

	// the new user itself is created based on the model
	// the data given by the user is inserted
	var newPost = new Post({
		title: title,
		text: text,
	    creators: creator,
	    sub: sub
	});

	newPost.save(function(err){
		if(err){
			logger.error(err + ' (' + ip.bold.white + ')');
            returnData(statics.INTERNAL_ERROR);
		}else {
            logger.info(ip.white.bold + ': new post "' + title.white.bold + '" from user ' + creator.white.bold + ' created in ' + sub.white.bold + '!');
            returnData(statics.NEWPOST_SUC);
        }
	});
}