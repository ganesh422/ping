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
var config = require('../config');
var async = require('async');

// store all the user's usernames
var userlist =[];

module.exports = {
	insert_signup_mdb: function(email, name, pseudonym, passwd, ip, callback){ // register using mongodb
		insert_signup_mdb(email, name, pseudonym, passwd, ip, callback);
	}, login_mdb: function(emailpseudonym, passwd, ip, callback){ // login using mongodb
		login_mdb(emailpseudonym, passwd, ip, callback);
	}, userlist_add_user: function(pseudonym){ // show a new user online
		userlist_add_user(pseudonym);
	}, userlist_remove_user: function(pseudonym){ // remove a user from the list of online people
		userlist_remove_user(pseudonym);
	}, find_user_by_pseudonym: function(pseudonym, ip, callback){ // basic information about the user using the pseudonym
		find_user_by_pseudonym(pseudonym, ip, callback);
	}, find_posts_by_creator_pseudonym: function(pseudonym, ip, callback){ // fetch the posts a certain pseudonym created
		find_posts_by_creator_pseudonym(pseudonym, ip, callback);
	}, find_posts_by_sub: function(subname, ip, callback){ // find posts for a specific community
		find_posts_by_sub(subname, ip, callback);
	}, find_posts_by_sublist: function(pseudonym, ip, callback){ // find posts by the user's list of communities
		find_posts_by_sublist(pseudonym, ip, callback);
	}, find_posts_by_friend: function(pseudonym, ip, callback){
		find_posts_by_friend(pseudonym, ip, callback);
	}, find_posts_by_pseudonym: function(pseudonym, ip, callback){ // find posts for a user (communities, followed people)
		find_posts_by_pseudonym(pseudonym, ip, callback)
	}, follow: function(senderpseudonym, whouserwantstofollow, ip, callback){
		follow(senderpseudonym, whouserwantstofollow, ip, callback);
	}, insert_new_sub: function(name, admin, ip, callback) { // create a new community
		insert_new_sub(name, admin, ip, callback);
	}, add_sub_to_pseudonym: function(pseudonym, subname, ip, callback){
		add_sub_to_pseudonym(pseudonym, subname, ip, callback);
	}, fetch_subs: function(pseudonym, ip, callback){ // get the list of communities the user followed
		fetch_subs(pseudonym, ip, callback);
	}, insert_new_post: function(creator, title, text, sub, ip, callback){ // create a new post
		insert_new_post(creator, title, text, sub, ip, callback);
	}
};

module.exports.user_list = userlist;

/*
 * mongoDB dependencies
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pingdb', {server:{poolSize: config.mongodb.defaultPoolSize}});
logger.debug('connected to mongodb.');
var dbcon = mongoose.connection;

// schemas
var User = require('../utils/dbmodels/user.js').User;
var Sub = require('../utils/dbmodels/sub.js').Sub;
var Post = require('../utils/dbmodels/post.js').Post;


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
	    subs: 'all'
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

	var query;

	if(misc.checkIfEmailInString(emailpseudonym)){
		query = User.findOne({'email': emailpseudonym.toLowerCase()});
	}else{
		query = User.findOne({'pseudonym': emailpseudonym});
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

function follow(senderpseudonym, whouserwantstofollow, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(statics.INTERNAL_ERROR);
	});

	User.findAndModify({'pseudonym': senderpseudonym}, [], {$addToSet: {'friends': whouserwantstofollow}}, {}, function(err){
		if(err){
			logger.error(err.toString());
			returnData(statics.INTERNAL_ERROR);
		}else{
			returnData(statics.FOLLOW_SUC);
		}
	});
}

// =============================================
// ============SUB RELATED FUNCTIONS============
// =============================================
function insert_new_sub(name, admin, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(result_status = statics.INTERNAL_ERROR);
	});

	// the new user itself is created based on the model
	// the data given by the user is inserted
	var newSub = new Sub({
		name: name.toLowerCase(),
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
			User.findAndModify({'pseudonym': admin}, [], {$addToSet: {'subs': name.toLowerCase()}}, {}, function(err){
					if(err){
						logger.error(err.toString());
					}else{
						logger.info(ip.white.bold + ': new sub ' + name.white.bold + ' with admin ' + admin.white.bold + ' created!');
						returnData(statics.NEWSUB_SUC);
					}
				}
			);
        }
	});
}

function add_sub_to_pseudonym(pseudonym, subname, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		returnData(result_status = statics.INTERNAL_ERROR);
	});

	User.findAndModify({'pseudonym': pseudonym}, [], {$addToSet: {'subs': subname.toLowerCase()}}, {}, function(err){
			if(err){
				logger.error(err.toString());
			}else{
				logger.info(ip.white.bold + ': ' + pseudonym.white.bold + ' joined ' + subname.white.bold + '!');
				returnData('You joined ' + subname + '.');
			}
		}
	);
}

function fetch_subs(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
        returnData(result_status = statics.INTERNAL_ERROR);
	});

	User.findOne({'pseudonym': pseudonym}).select('subs').lean().exec(function(err, result){
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
	    sub: sub.toLowerCase()
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

/*
 * get list of posts posted by the user
 */
function find_posts_by_creator_pseudonym(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		returnData(statics.INTERNAL_ERROR);
	});

	Post.find({'creators':pseudonym}).sort({'date_created': 'desc'}).limit(20).lean().exec(function(err, result){ //lean() returns the data as a JS object instead of mongoose object
		if(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
			returnData(statics.INTERNAL_ERROR);
		}

		if(result){
			returnData(null, result); // reverse to turn the whole array around
		}else{
			logger.warn(ip.white.bold + ': query for posts by user (credentials: ' + pseudonym.white + ') returned no results.');
			returnData(statics.NO_POSTS_FOUND);
		}
	});
}

function find_posts_by_sub(subname, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		returnData(statics.INTERNAL_ERROR);
	});

	Post.find({'sub': subname}).sort({'date_created': 'desc'}).limit(20).lean().exec(function(err, result){
		if(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
			returnData(statics.INTERNAL_ERROR);
		}

		if(result){
			returnData(result);
		}else{
			logger.warn(ip.white.bold + ': query for posts by sub ' + subname.white + ' returned no results.');
			returnData(statics.NO_POSTS_FOUND);
		}
	});
}

/*
 * get list of posts contained in subs the user subscribed to
 */
function find_posts_by_sublist(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		returnData(statics.INTERNAL_ERROR);
	});

	fetch_subs(pseudonym, ip, function(response){
		if(response){
			Post.find({'sub': {$in: response}}).sort({'date_created': 'desc'}).limit(20).lean().exec(function(err, result){
				if(err){
					logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
					returnData(statics.INTERNAL_ERROR);
				}

				if(result){
					returnData(result);
				}else{
					returnData(statics.NO_POSTS_FOUND);
				}
			});
		}
	});
}

/*
 * get list of posts by the user's list of followed people
 */
function find_posts_by_friend(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		returnData(statics.INTERNAL_ERROR);
	});

	User.findOne({'pseudonym': pseudonym}).select('friends').lean().exec(function(err, result){
		if(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
			returnData(statics.INTERNAL_ERROR);
		}

		if(result){
			var postlist = [];
			var index = 0;

			(function fetchLoop(){
				if(index <= result.friends.length){
					Post.find({'creators': result.friends[index]}).limit(5).sort({'date_created': 'desc'}).lean().exec(function(err, res){
						if(err){
							logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
						}

						if(res){
							res.forEach(function(entry){
								postlist.push(entry);
								fetchLoop();
							});
						}else{
							fetchLoop();
						}
					});
				}

				index++;
			}());
			returnData(postlist);
		}else{
			returnData(statics.NO_POSTS_FOUND);
		}
	});
}

/*
 * find the posts of the communities and the people a user (pseudonym) followed combined
 * probably needs a rename :D
 */
function find_posts_by_pseudonym(pseudonym, ip, returnData){
	dbcon.on('error', function(err){
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		returnData(statics.INTERNAL_ERROR);
	});

	find_posts_by_friend(pseudonym, ip, function(response_friendlist){
		if(response_friendlist && response_friendlist != statics.NO_POSTS_FOUND && response_friendlist != statics.INTERNAL_ERROR){
			find_posts_by_sublist(pseudonym, ip, function(response_subs){
				if(response_subs && response_subs != statics.NO_POSTS_FOUND && response_subs != statics.INTERNAL_ERROR) {
					response_friendlist.forEach(function (ent1) {
						response_subs.forEach(function (ent2) {
							if (ent1.id == ent2.id) {
								response_subs.splice(response_subs.indexOf(ent2));
							}
						});
					});
					if (response_subs != undefined && response_friendlist != undefined) {
						// combine arrays and sort by date
						returnData(response_friendlist.concat(response_subs).sort(function (date1, date2) {
							return date2.date_created - date1.date_created
						}));
					}
				}
			});
		}
	});
}