var express = require('express');
var router = express.Router();
var logger = require('../utils/logger');
var db = require('../utils/db');
var statics = require('../utils/statics');

var ip_info; // store user's ip

// =============================================
// ============REDIRECT WITHOUT LOGIN===========
// =============================================
function requireLogin(req, res, next){
	if(!req.user._id){
		logger.warn(req.connection.remoteAddress.toString().white.bold + ' User was redirected to /welcome ' + '(NO LOGON)'.red.bold);
		res.redirect('/welcome');
	}else{
		next();
	}
}

// =============================================
// WELCOME PAGE (login, registration, etc.)=====
// =============================================
router.get('/welcome', function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + '  request for ' + '/welcome'.blue.bold);

	// if user is already logged in
	// redirect to his profile
	if(req.user._id){
		logger.info(ip_info.toString().white.bold + ': ' + req.user._id.bgWhite.black.bold + ' (' + req.user.pseudonym + ') was redirected to /people/me.');
		res.redirect('/people/me');
	}else{
		res.render('welcome.jade');
	}
});

router.post('/login', function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/login'.blue.bold);
    db.login_mdb(req.body.emailpseudonym, req.body.passwd, ip_info, function(response_status, pseudonym, id, email){
        if(pseudonym && id && response_status == statics.LOGIN_SUC){
        	req.user.pseudonym = pseudonym;
        	req.user._id = id;
        	req.user.email = email;
            res.status(200).json({status: response_status});
        }else{
            res.status(403).json({status: response_status});
        }
    });
});

router.post('/signup', function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/signup'.blue.bold);
	db.insert_signup_mdb(req.body.email, req.body.name, req.body.pseudonym, req.body.passwd, ip_info, function(response_status){
		if(response_status == statics.REGISTRATION_SUC){
           	res.status(200).json({status: response_status});
        }else{
            res.status(403).json({status: response_status});
        }
	});
});

// =============================================
// =================HOME PAGE===================
// =============================================
router.get('/', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + '  request for ' + '/'.blue.bold);
	db.find_posts_by_sublist(req.user.pseudonym, ip_info, function(p_l){
		res.render('home', {
			user: req.user, 
			posts: p_l
		});
	});
});

// =============================================
// =================PROFILES====================
// =============================================
router.get('/me', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + '  request for ' + ('/me').blue.bold);

	db.find_posts_by_pseudonym(req.user.pseudonym, ip_info, function(response_status, p_l){
        res.render('people', {
            title: 'Your profile', 
            user: req.user,
            posts: p_l, 
            canEdit: true // enable's the user to edit the profile if it's his own profile
        });
    });
});

router.get('/u/:pseudonym', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + '  request for ' + ('/u/'+req.params.pseudonym).blue.bold);
	db.find_user_by_pseudonym(req.params.pseudonym, ip_info, function(response_status, pseudo, id, em){
		if(response_status == statics.ACCOUNT_NOT_FOUND){
			res.render('error', {title: 'Oops!', errormessage: 'Oops!', message: 'There was no account found by that pseudonym!', canEdit: false});
		}else if(pseudo != undefined && id != undefined && em != undefined){
			var pagetitle;
			if(req.user.pseudonym == req.params.pseudonym){
				pagetitle = 'Your profile';
			}else{
				if(req.params.pseudonym[req.params.pseudonym.length-1] == 's'){
					pagetitle = req.params.pseudonym + "' profile";
				}else{
					pagetitle = req.params.pseudonym + "'s profile";
				}
			}

			// get user's posts
			db.find_posts_by_pseudonym(req.params.pseudonym, ip_info, function(response_status, p_l){
				res.render('people', {
					title: pagetitle, 
					user: {pseudonym: pseudo, _id: id, email: em},
					posts: p_l, 
					canEdit: req.user.pseudonym == req.params.pseudonym // enable's the user to edit the profile if it's his own profile
				});
			});
		}else{
			logger.info('Something went wrong with the request for ' + ('/u/'+req.params.pseudonym).blue.bold);
			res.render('error', {title: 'Oops!', errormessage: 'Something went wrong. Sorry.', canEdit: false});
		}
	});
});

// =============================================
// ==================LOGOUT=====================
// =============================================
router.get('/logout', function(req, res){
	if(req.user._id){
		logger.info(req.connection.remoteAddress.toString().white.bold + ': ' + req.user._id.bgWhite.black.bold + ' (' + req.user.pseudonym.bold.white + ') logged out.');
		req.user.reset();
	}
	db.userlist_remove_user(req.user.pseudonym);
	res.redirect('/welcome');
});

// =============================================
// ===================SUBS======================
// =============================================
router.post('/newsub', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/newsub'.blue.bold);
	db.insert_new_sub(req.body.name, req.user._id, req.user.pseudonym, ip_info, function(response_status){
		if(response_status == statics.NEWSUB_SUC){
			res.status(200).json({status: response_status});
		}else{
			res.status(403).json({status: response_status});
		}
	});
});

router.get('/fetchsubs', function(req, res){
	ip_info = req.connection.remoteAddress;
	//logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + ' request for ' + '/fetchsubs'.blue.bold);
	db.fetch_subs(req.user.pseudonym, ip_info, function(response){
		if(response == statics.ACCOUNT_NOT_FOUND){
			res.status(403).json({status: response});
		}else if(response == statics.INTERNAL_ERROR){
			res.status(403).json({status: response});
		}else{
			res.status(200).json({subs: response});
		}
	});
});

router.get('/s/:subname', function(req, res){
	ip_info = req.connection.remoteAddress;
	db.find_posts_by_sub(req.params.subname.toLowerCase(), ip_info, function(response){
		res.render('home', {
			user: req.user
		});
	});
});

// =============================================
// ===================POSTS=====================
// =============================================
router.post('/newpost', function(req, res){
	ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/newpost'.blue.bold);
	db.insert_new_post(req.user.pseudonym, req.body.title, req.body.text, req.body.sub, ip_info, function(response){
		if(response == statics.NEWPOST_SUC){
			res.status(200).json({status: 'New post successfully created!'});
		}else{
			res.status(403).json({status: response});
		}
	});
});

router.post('/getposts', function(req, res){
    ip_info = req.connection.remoteAddress;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/getposts'.blue.bold);
    
    if(req.body.selection){
        db.find_posts_by_sub(req.body.selection, ip_info, function(p_l){
            if(p_l){
                res.status(200).json({posts: p_l});
            }else{
                res.status(403).json({error: statics.INTERNAL_ERROR});
            }
        });
    }else{
        db.find_posts_by_sublist(req.user.pseudonym, ip_info, function(p_l){
            if(p_l){
                res.status(200).json({posts: p_l});
            }else{
                res.status(403).json({error: statics.INTERNAL_ERROR});
            }
        });
    }
});

// =============================================
// ===================ETC=======================
// =============================================
router.get('/about/http', function(req, res){
	res.render('about', {title: 'Why use HTTPS?', subjecttitle:'HTTP/HTTPS', message: statics.ABOUT_HTTP_MESSAGE});
});

module.exports = router;