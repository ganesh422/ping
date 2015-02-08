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
var get_ip = require('ipware')().get_ip;

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
// ============USER RELATED FUNCTIONS===========
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
		      	logger.error('user (email ("'+email+'") and pseudo ("'+pseudonym+'")) already exists' + ' (' + ip.bold.white + ')');
                returnData(statics.EMAILPSEUDO_IN_USE);
		    }else if(err.toString() == 'ValidationError: ' + statics.EMAIL_IN_USE){
		      	logger.error('user (email ("'+email+'")) already exists.' + ' (' + ip.bold.white + ')');
                returnData(statics.EMAIL_IN_USE);
		    }else if(err.toString() == 'ValidationError: ' + statics.PSEUDO_IN_USE){
		      	logger.error('user (pseudonym ("'+pseudonym+'")) already exists.' + ' (' + ip.bold.white + ')');
                returnData(statics.PSEUDO_IN_USE);
		    }else{
		      	logger.error(err + ' (' + ip.bold.white + ')');
                returnData(statics.INTERNAL_ERROR);
		    }
		}else {
            // successful registration
            logger.info('new user ' + name.white.bold + ' / ' + email.white.bold + ' registered! (' + ip.white.bold + ')');
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
				logger.info("user (credentials: " + emailpseudonym.white.bold + ") logged in. (" + ip.white.bold + ")");
		    	userlist_add_user(result.pseudonym);
				returnData(statics.LOGIN_SUC, result.pseudonym, result._id, result.email);
			}else{
				logger.warn("user (credentials: " + emailpseudonym.white.bold + ") entered invalid password.");
				returnData(statics.INVALID_WP);
			}
		}else{
			logger.warn("query for user (credentials: " + emailpseudonym.white.bold + ") returned no result.");
			returnData(statics.ACCOUNT_NOT_FOUND);
		}
	});
}

function userlist_add_user(pseudonym){
	userlist.push(pseudonym);
	logger.info('Number of users online: ' + userlist.length);
	userlist.forEach(function(entry) {
		logger.info(entry);
	});
}

function userlist_remove_user(pseudonym){
	userlist.splice(userlist.indexOf(pseudonym, 1));
	logger.info('Number of users online: ' + userlist.length);
	userlist.forEach(function(entry) {
		logger.info(entry);
	});
}

// =============================================
// ============SUB RELATED FUNCTIONS============
// =============================================
function insert_new_sub(){
	
}