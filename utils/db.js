/**
 * Copyright (c) 2015 Michael Koeppl
 *
 * Created by mko on 24/01/15.
 *
 * database related functions
 */

var logger = require('../utils/logger');
var crypto = require('crypto');
var get_ip = require('ipware')().get_ip;
var colors = require('colors');

var userlist =[];

/*
 * MongoDB
 * comment if using MySQL
 * http://docs.mongodb.org/manual/reference/mongo-shell/
 */
var mongoose = require('mongoose');
var misc = require('../utils/misc');

module.exports = {
	db_insert_reg_mdb: function(req, res){
		// people registration 
		insert_reg_mdb(req, res);
	},
	db_login_mdb: function(req, res){
		// people login
		login_mdb(req, res);
	},
	db_pseudo_lookup_id: function(uid, res){
		// people pseudo lookup
		pseudo_lookup_id(uid, res);
	},
	db_insert_new_post: function(req, res){
		// new post
		insert_new_post(req, res);
	},
	db_insert_new_sub: function(req, res){
		// new sub
		insert_new_sub(req, res);
	},
	db_fetch_subs_for_pseudo: function(req, res){
		// fetch user's subscribed subs
		fetch_subs_for_pseudo(req, res);
	},
	db_create_ALL_sub: function(){
		create_ALL_sub();
	}
};

module.exports.user_list = userlist;

function create_ALL_sub(){
	try{
    	// connect to mongoDB database
	    // you need to have mongoDB installed to make this work
	    // apt-get install mongodb
	    // or
	    // http://www.mongodb.org/downloads
	    // start mongo server with 'mongod -dbpath <PATH>'
	    // eventually start mongo shell with 'mongo'
    	mongoose.connect('mongodb://localhost/pingdb');
		var con = mongoose.connection;

		con.on('open', function(){
		  mongoose.connection.db.collectionNames(function(error, names) {
		    if (error) {
		      throw new Error(error);
		    } else {
		      names.map(function(cname) {
		        if(cname.name == "All"){ return; }
		      });
		    }
		  });
		});

		con.on('error', function(err){
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		});
		con.once('open', function callback() {
			logger.debug('connected to mongodb.');
			var Sub = require('../utils/dbschemes/sub.js').Sub;

		    // the new user itself is created based on the model
		    // the data given by the user is inserted
		    var newSub = new Sub({
			   	name: "All",
			    admins: "iNET"
			});

			newSub.save(function(err, thor){
			   	if(err){
			   		// shut up
				}       
			});
		});
	}catch(ex){
		logger.error('ERROR: ' + ex);
	}

	mongoose.disconnect();
}

/* ==================================================================================
 *                                  PEOPLE
 */
function insert_reg_mdb(req, res){
    try{
    	// connect to mongoDB database
	    // you need to have mongoDB installed to make this work
	    // apt-get install mongodb
	    // or
	    // http://www.mongodb.org/downloads
	    // start mongo server with 'mongod -dbpath <PATH>'
	    // eventually start mongo shell with 'mongo'
    	mongoose.connect('mongodb://localhost/pingdb');
		var db = mongoose.connection;
		db.on('error', function(err){
			try{
				res.status(403).json({errorHappened:true});
			}catch(err){
				logger.error('db.js could not send response errorHappened:true'.red.bold);
				if(err != undefined){
	      			logger.error(err.toString().red);
	      		}
			}
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		});
		db.once('open', function callback() {
		    logger.debug('connected to mongodb.');
		    var User = require('../utils/dbschemes/user.js').User;

	    	// the new user itself is created based on the model
	      	// the data given by the user is inserted
	      	var newUser = new User({
		       	eaddress: req.body.vale,
		     	name: req.body.valn,
	            pseudo: req.body.valps,
	            wp: req.body.valp,
	            subs: 'All'
		    });

	      	// example for adding a friend to the user's friendlist
	      	// this has to be called and then .save
	      	//
		    //logger.debug('added friend 54c4f981aaf109c82436efcf');
            //newUser.friends.push(mongoose.Types.ObjectId('54c4f981aaf109c82436efcf'));

	      	// the new user's data gets saved
	      	newUser.save(function(err,thor){
	      		if(err){
	      			logger.error(err.toString());
	      			if(err.toString() == 'ValidationError: This pseudonym is already registered, This email address is already registered'){
	      				logger.error('user (email ("'+req.body.vale+'") and pseudo ("'+req.body.valps+'")) already exists');
	      				res.status(403).json({emailandpseudoInUse:true});
	      				mongoose.disconnect();
	      				return;
	      			}else if(err.toString() == 'ValidationError: This email address is already registered'){
	      				logger.error('user (email ("'+req.body.vale+'")) already exists.');
	      				res.status(403).json({emailInUse:true});
	      				mongoose.disconnect();
	      				return;
	      			}else if(err.toString() == 'ValidationError: This pseudonym is already registered'){
	      				logger.error('user (pseudonym ("'+req.body.valps+'")) already exists.');
	      				res.status(403).json({pseudonymInUse:true});
	      				mongoose.disconnect();
	      				return;
	      			}else{
	      				res.status(403).json({errorHappened:true});
	      				mongoose.disconnect();
		      			return;
	      			}
	      		}
	      		try{
	      			res.status(200).json({isRegistered:true});
	      		}catch(err){
	      			if(err != undefined){
	      				logger.error(err.toString().red);
	      			}
	      		}
	      		logger.info('new user ' + req.body.valn.white.bold + ' / ' + req.body.vale.white + ' registered! (' + get_ip(req).clientIp.toString().white.bold + ')');
                
	      		mongoose.disconnect();
	      	});
		});
    }catch(ex){
        logger.error('ERROR: ' + ex);
    }
}

function login_mdb(req, res){
	// connect to mongoDB database
	// you need to have mongoDB installed to make this work
	// apt-get install mongodb
	// or
	// http://www.mongodb.org/downloads
	// start mongo server with 'mongod -dbpath <PATH>'
	// eventually start mongo shell with 'mongo'
    mongoose.connect('mongodb://localhost/pingdb');
	var db = mongoose.connection;
	db.on('error', function(err){
		try{
			res.status(403).json({errorHappened:true});
		}catch(err){
			logger.error('db.js could not send response errorHappened:true'.red.bold);
			if(err != undefined){
		    	logger.error(err.toString().red);
		    }
		}
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
	});
	db.once('open', function callback() {
		// import mongoose model
    	var User = require('../utils/dbschemes/user.js').User;

		// defines what we're looking for
        // we're looking for an entry with the same email address/pseudo our user gave us
      	if(checkIfEmailInString(req.body.vale)) {
      		var query = User.findOne({'eaddress': req.body.vale.toLowerCase()});
      	}else{
        	var query = User.findOne({'pseudo': req.body.vale});
      	}

      	// this defines what values of the stored user data we want to have
      	query.select('wp salt _id');

      	query.exec(function(err, result){
      		if(err){
      			try{
					res.status(403).json({errorHappened:true});
				}catch(err){
					logger.error('db.js could not send response errorHappened:true'.red.bold);
					if(err != undefined){
				    	logger.error(err.toString().red);
				    }
				}
      		}

      		//logger.debug(result + '');

		    if(result){
		    	if(result.wp == crypto.pbkdf2Sync(req.body.valp, result.salt, 10000, 512)){
		    		try{
		    			res.status(200).json({isValid:true, valu: result._id});
		    		}catch(err){
		    			logger.error('db.js could not send response isValid:true to '.red.bold + req.body.vale.white.bold);
		    			if(err != undefined){
		    				logger.error(err.toString().red);
		    			}
		    		}
		    		logger.info("user " + req.body.vale.white.bold + " logged in. (" + get_ip(req).clientIp.toString().white.bold + ")");
		    		userlist.push(result._id + " " + req.body.vale);
		    		logger.info('Number of users online: ' + userlist.length);
				    userlist.forEach(function(entry) {
				        logger.info(entry);
				    });
                    mongoose.disconnect();
		    	}else{
		    		try{
		    			res.status(403).json({isValid:false});
		    		}catch(err){
		    			logger.error('db.js could not send response isValid:true to '.red.bold + req.body.vale.white.bold);
		    			if(err != undefined){
					    	logger.error(err.toString().red);
					    }
		    		}
                	logger.warn("user " + req.body.vale.white.bold + " entered invalid password.");
                    mongoose.disconnect();
                }
		    }else{
		    	try{
		    		res.status(403).json({userNotFound:true});
		    	}catch(err){
		    		logger.error('db.js could not send response userNotFound:true to '.red.bold + req.body.vale.white.bold);
		    		if(err != undefined){
		    			logger.error(err.toString().red);
		    		}
		    	}
		    	logger.warn("query for user " + req.body.vale.white.bold + " returned no result.")
                mongoose.disconnect();
		    }
      	});
	});
}

function pseudo_lookup_id(uid, res){
	// connect to mongoDB database
	// you need to have mongoDB installed to make this work
	// tutorial:
	// apt-get install mongodb
	// or
	// http://www.mongodb.org/downloads
	// start mongo server with 'mongod -dbpath <PATH>'
	// eventually start mongo shell with 'mongo'
    mongoose.connect('mongodb://localhost/pingdb');
	var db = mongoose.connection;
	db.on('error', function(err){
		try{
			res.status(403).json({errorHappened:true});
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		}catch(err){
			logger.error('db.js could not send response errorHappened:true to '.red.bold + uid.bgWhite.black.bold);
			if(err != undefined){
		    	logger.error(err.toString().red);
		    }
		}
	});
	db.once('open', function callback() {
		// import mongoose model
    	var User = require('../utils/dbschemes/user.js').User;

		// defines what we're looking for
        var query = User.findOne({'_id': uid});

      	// this defines what values of the stored user data we want to have
      	query.select('pseudo');

      	query.exec(function(err, result){
      		if(err){
      			try{
      				res.status(403).json({errorHappened:true});
				}catch(err){
					logger.error('db.js could not send response errorHappened:true'.red.bold);
					if(err != undefined){
		    			logger.error(err.toString().red);
		    		}
				}
                mongoose.disconnect();
      		}
            //logger.debug(result + '');

            if(result){
            	try{
            		res.status(200).json({pseudoforid:result.pseudo});
            	}catch(err){
            		logger.error('db.js could not send response pseudoforid'.red.bold);
            		if(err != undefined){
				    	logger.error(err.toString().red);
				    }
            	}
                mongoose.disconnect();
            }else{
            	try{
            		res.status(403).json({userNotFound:true});	
            	}catch(err){
            		logger.error('db.js could not send response userNotFound'.red.bold);
            		if(err != undefined){
				    	logger.error(err.toString().red);
				    }
            	}
                logger.warn("query for user with id " + uid + " returned no result.");
                mongoose.disconnect();
            }
      	});
    });
}

// return true if email is valid
function checkIfEmailInString(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}
/*
 *                                END PEOPLE
/* ==================================================================================*/


/* ==================================================================================
 *                                  POSTS
 */
function insert_new_post(req, res){
	try{
    	// connect to mongoDB database
	    // you need to have mongoDB installed to make this work
	    // apt-get install mongodb
	    // or
	    // http://www.mongodb.org/downloads
	    // start mongo server with 'mongod -dbpath <PATH>'
	    // eventually start mongo shell with 'mongo'
    	mongoose.connect('mongodb://localhost/pingdb');

		var db = mongoose.connection;
		db.on('error', function(err){
			try{
				res.status(403).json({errorHappened:true});
			}catch(err){
				logger.error('db.js could not send response errorHappened:true'.red.bold);
				if(err != undefined){
	      			logger.error(err.toString().red);
	      		}
			}
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		});

		db.once('open', function callback() {
		    logger.debug('connected to mongodb.');
		    var Post = require('../utils/dbschemes/post.js').Post;

	    	// the new post itself is created based on the model
	      	// the data given by the user is inserted
	      	var newPost = new Post({
		       	text: req.body.valt,
		     	sub: req.body.vals,
	            creators: req.body.valpseudo
		    });

	      	// the new post data gets saved
	      	newPost.save(function(err,thor){
	      		if(err){
					res.status(403).json({errorHappened:true});
	      			mongoose.disconnect();
	      			throw err;
	      		}
	      		try{
					res.status(200).json({postCreated:true});
	      		}catch(err){
	      			if(err != undefined){
	      				logger.error(err.toString().red);
	      			}
	      		}
	      		logger.info('new post ' + req.body.valt.white.bold + ' was added to ' + req.body.vals.white.bold + '. (' + get_ip(req).clientIp.toString().white.bold + ')');
                
	      		mongoose.disconnect();
	      	});
		});
    }catch(ex){
        logger.error('ERROR: ' + ex);
    }
}
/*
 *                                END POSTS
/* ==================================================================================*/


/* ==================================================================================
 *                                  SUBS
 */
function insert_new_sub(req, res){
	try{
    	// connect to mongoDB database
	    // you need to have mongoDB installed to make this work
	    // apt-get install mongodb
	    // or
	    // http://www.mongodb.org/downloads
	    // start mongo server with 'mongod -dbpath <PATH>'
	    // eventually start mongo shell with 'mongo'
    	mongoose.connect('mongodb://localhost/pingdb');
		var db = mongoose.connection;
		db.on('error', function(err){
			try{
				res.status(403).json({errorHappened:true});
			}catch(err){
				logger.error('db.js could not send response errorHappened:true'.red.bold);
				if(err != undefined){
	      			logger.error(err.toString().red);
	      		}
			}
			logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
		});

		db.once('open', function callback() {
		    logger.debug('connected to mongodb.');
		    var Sub = require('../utils/dbschemes/sub.js').Sub;

	    	// the new sub itself is created based on the model
	      	// the data given by the user is inserted
	      	var newSub = new Sub({
		       	name: req.body.valn,
		     	admins: req.body.valpseudo
		    });

	      	// the new sub data gets saved
	      	newSub.save(function(err,thor){
	      		if(err){
	      			if(err.toString() == 'ValidationError: This sub name already exists.'){
	      				logger.error('sub '+req.body.valn.white.bold+' already exists');
	      				res.status(403).json({subNameInUse:true});
	      				mongoose.disconnect();
	      				return;
	      			}
					res.status(403).json({errorHappened:true});
	      			mongoose.disconnect();
	      			throw err;
	      		}
	      		try{
					res.status(200).json({subCreated:true});
					mongoose.disconnect();
	      		}catch(err){
	      			if(err != undefined){
	      				logger.error(err.toString().red);
	      			}
	      		}
	      		logger.info('new sub ' + req.body.valn.white.bold + ' was created by ' + req.body.valpseudo + '! (' + get_ip(req).clientIp.toString().white.bold + ')');
	      	});

	      	// import mongoose model to insert the new sub
	    	var User = require('../utils/dbschemes/user.js').User;

	    	// push the new sub
	    	User.findOneAndUpdate(
			    { pseudo: req.body.valpseudo },
			    { $push: { subs: req.body.valn } },
			    function(err, model) {
			    	if(err){
			        	console.log(err);
			    	}
			    }
			);
		});
    }catch(ex){
        logger.error('ERROR: ' + ex);
    }
}

function fetch_subs_for_pseudo(req, res){
	// connect to mongoDB database
	// you need to have mongoDB installed to make this work
	// apt-get install mongodb
	// or
	// http://www.mongodb.org/downloads
	// start mongo server with 'mongod -dbpath <PATH>'
	// eventually start mongo shell with 'mongo'
    mongoose.connect('mongodb://localhost/pingdb');
	var db = mongoose.connection;
	db.on('error', function(err){
		try{
			res.status(403).json({errorHappened:true});
		}catch(err){
			logger.error('db.js could not send response errorHappened:true'.red.bold);
			if(err != undefined){
		    	logger.error(err.toString().red);
		    }
		}
		logger.error(err.toString().cyan.italic + '. Is ' + ' mongod '.red.bold + ' running?');
	});
	db.once('open', function callback() {
		// import mongoose model
    	var User = require('../utils/dbschemes/user.js').User;

		var query = User.findOne({'pseudo': req.body.valpseudo});

      	// this defines what values of the stored user data we want to have
      	query.select('subs');

      	query.exec(function(err, result){
      		if(err){
      			try{
					res.status(403).json({errorHappened:true});
				}catch(err){
					logger.error('db.js could not send response errorHappened:true'.red.bold);
					if(err != undefined){
				    	logger.error(err.toString().red);
				    }
				}
      		}

		    if(result){
		    	try{
		    		res.send(result.subs);
		    		mongoose.disconnect();
		    	}catch(ex){
		    		logger.error('db.js could not send results'.red.bold);
		    		mongoose.disconnect();
		    	}
		    }else{
		    	try{
		    		res.status(403).json({noSubsFound:true});
		    	}catch(err){
		    		logger.error('db.js could not send response noSubsFound:true to '.red.bold + req.body.valuid.white.bold);
		    		if(err != undefined){
		    			logger.error(err.toString().red);
		    		}
		    	}
		    	logger.warn("query for user " + req.body.valuid.white.bold + "'s subs returned no result.")
                mongoose.disconnect();
		    }
      	});
	});
}
 /*
 *                                END SUBS
/* ==================================================================================*/