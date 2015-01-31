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

/*
 * MongoDB
 * comment if using MySQL
 * http://docs.mongodb.org/manual/reference/mongo-shell/
 */
var mongoose = require('mongoose');
var misc = require('../utils/misc');

module.exports = {
	db_insert_reg_mdb: function(req, res){
		insert_reg_mdb(req, res);
	},
	db_login_mdb: function(req, res){
		login_mdb(req, res);
	},
	db_pseudo_lookup_id: function(uid, res){
		pseudo_lookup_id(uid, res);
	}
};

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
	            wp: req.body.valp
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
            logger.debug(result + '');

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

/*
 * MySQL Database
 * comment if using mongoDB
 */
/*var mysql      = require('mysql');
var dbpool = mysql.createPool({
  connectionLimit: 10,	
  host     : 'localhost',
  user     : 'root',
  password : 'pingisgo',
  database : 'pingdb'
});*/

function login_sql(req, res){
	try{
    	dbpool.getConnection(function(err, connection) {
            if (err) {
                logger.error('error connecting: ' + err.stack);
                res.status(403).json({errorHappened:true});
                return;
            }

            console.log('connected as id ' + connection.threadId);

            if(misc.checkIfEmailInString(req.body.vale)){
                var query = connection.query("SELECT wp from User WHERE eaddress=?", [req.body.vale], function(err, rows, fields) {
                    if (err){
                        logger.error("ERROR AT MYSQL LOGIN QUERY");
                        logger.error(err);
                        res.status(403).json({errorHappened:true});
                        return;
                    }

                    for (var i = rows.length - 1; i >= 0; i--) {
                        logger.info(rows[i]);
                    };

                    if(rows.length > 0){
                        if(rows[0].wp == req.body.valp){
                            logger.info("password is correct");
                            res.status(200).json({isValid:true});
                        }else{
                            logger.warn("password is invalid");
                            res.status(403).json({isValid:false});
                        }
                    }else{
                        console.log("QUERY RESULT FOR USER " + req.body.vale + " RETURNED NO RESULT!")
                        res.status(403).json({userNotFound:true});
                    }

                    //debugging
                    logger.debug(query.sql);
                    logger.debug(rows[0]);
                    logger.debug(req.body.valp); 

                    // release connection for next request
                    connection.release();
                });
            }else{
                var query = connection.query("SELECT wp from User WHERE pseudo=?", [req.body.vale], function(err, rows, fields) {
                    if (err){
                        logger.error("ERROR AT MYSQL LOGIN QUERY");
                        logger.error(err);
                        res.status(403).json({errorHappened:true});
                        return;
                    }

                    for (var i = rows.length - 1; i >= 0; i--) {
                        logger.debug(rows[i]);
                    };

                    if(rows.length > 0){
                        if(rows[0].wp == req.body.valp){
                            logger.info("password is correct");
                            res.status(200).json({isValid:true});
                        }else{
                            logger.warn("password is invalid");
                            res.status(403).json({isValid:false});
                        }
                    }else{
                        logger.info("QUERY RESULT FOR USER " + req.body.vale + " RETURNED NO RESULT!")
                        res.status(403).json({userNotFound:true});
                    }

                    //debugging
                    logger.debug(query.sql);
                    logger.debug(rows[0]);
                    logger.debug(req.body.valp);

                    // release connection for next request
                    connection.release();
                });
            }
        });
	}catch(ex){
		logger.error('ERROR: ' + ex);
	}
}

function register_sql(req, res){
	try{
        dbpool.getConnection(function(err, connection) {
            if (err) {
                logger.error('error connecting: ' + err.stack);
                res.status(403).json({errorHappened:false});
                return;
            }

            console.log('connected as id ' + connection.threadId);

            var post;

            if(req.body.valps == undefined){
                post = {eaddress:req.body.vale, name:req.body.valn, wp:req.body.valp};
            }else{
                post = {eaddress:req.body.vale, name:req.body.valn, pseudo:req.body.valps, wp:req.body.valp};
            }
            
            var query = connection.query("INSERT INTO User SET ?", post, function(err, result) {
                if (err){
                    logger.error("ERROR AT MYSQL REGISTRATION QUERY");
                    console.log(err);
                    res.status(403).json({errorHappened:false});
                    return;
                }
                
                logger.debug(query.sql);
                logger.debug(result); 
                res.status(200).json({isRegistered:true});

                // release connection for next request
                connection.release();
            });
        });
	}catch(ex){
		logger.error('ERROR: ' + ex);
	}
}

// return true if email is valid
function checkIfEmailInString(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}
