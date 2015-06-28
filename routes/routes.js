var express = require('express');
var router = express.Router();
var logger = require('../utils/logger');
var printer = require('../utils/prtr');
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
	printer.printRouteRequest(req);

	// if user is already logged in
	// redirect to his/her profile
	if(req.user._id){
		logger.info(ip_info.toString().white.bold + ': ' + req.user._id.bgWhite.black.bold + ' (' + req.user.pseudonym + ') was redirected to /people/me.');
		res.redirect('/');
	}else{
		res.render('welcome.jade');
	}
});

router.post('/login', function(req, res){
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
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
	printer.printRouteRequest(req);
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
router.get('', requireLogin, function(req, res){
	// can't just redirect, because safari wouldn't allow it --> "security"
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
	res.render('home', {
		user: req.user,
		subPage: false
	});
});

router.get('/', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
	res.render('home', {
		user: req.user,
		subPage: false
	});
});

// =============================================
// =================PROFILES====================
// =============================================
router.get('/me', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
	db.find_posts_by_creator_pseudonym(req.user.pseudonym, ip_info, function(response_status, p_l){
        res.render('people', {
            title: 'Your profile',
            user: req.user,
            posts: p_l,
            canEdit: true,
            canFollow: false
        });
    });
});

router.get('/u/:pseudonym', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
	db.find_user_by_pseudonym(req.params.pseudonym, ip_info, function(response_status, pseudo, id, em){
		if(response_status == statics.ACCOUNT_NOT_FOUND){
			res.render('error', {title: 'Oops!', errormessage: 'Oops!', message: 'There was no account found by that pseudonym!', canEdit: false});
		}else if(pseudo != undefined && id != undefined && em != undefined){
			var pagetitle;
			if(req.user.pseudonym == req.params.pseudonym){
				pagetitle = 'Your profile';
			}else{
				if(req.params.pseudonym[req.params.pseudonym.length-1] == 's'){
					pagetitle = req.params.pseudonym;
				}else{
					pagetitle = req.params.pseudonym;
				}
			}

			// get user's posts
			db.find_posts_by_creator_pseudonym(req.params.pseudonym, ip_info, function(response_status, p_l){
				res.render('people', {
					title: pagetitle,
					user: {pseudonym: pseudo, _id: id, email: em},
					posts: p_l,
					canEdit: (req.user.pseudonym == req.params.pseudonym),
					canFollow: !(req.user.pseudonym == req.params.pseudonym)
				});
			});
		}else{
			logger.info('Something went wrong with the request for ' + ('/u/'+req.params.pseudonym).blue.bold);
			res.render('error', {title: 'Oops!', errormessage: 'Something went wrong. Sorry.', canEdit: false});
		}
	});
});

router.post('/follow/:pseudonym', function(req, res){
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
	db.follow(req.user.pseudonym, req.params.pseudonym, ip_info, function(response){
		if(response == statics.FOLLOW_SUC){
			res.status(200).json({status: 'You started following ' + req.params.pseudonym});
		}else{
			res.status(400).json({status: response});
		}
	});
});

// =============================================
// ==================LOGOUT=====================
// =============================================
router.get('/logout', function(req, res){
	if(req.user._id && req.user.pseudonym){
		logger.info(req.connection.remoteAddress.toString().white.bold + ': ' + req.user._id.black.bold + ' (' + req.user.pseudonym.bold.white + ') logged out.');
		req.user.reset();
		db.userlist_remove_user(req.user.pseudonym);
	}
	res.redirect('/welcome');
});

// =============================================
// ===================SUBS======================
// =============================================
router.post('/newsub', requireLogin, function(req, res){
	ip_info = req.connection.remoteAddress;
	req.printRouteRequest(req);
	db.insert_new_sub(req.body.name, req.user.pseudonym, ip_info, function(response_status){
		if(response_status == statics.NEWSUB_SUC){
			res.status(200).json({status: response_status});
		}else{
			res.status(403).json({status: response_status});
		}
	});
});

router.get('/fetchsubs', function(req, res){
	ip_info = req.connection.remoteAddress;
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
			user: req.user,
			subPage: true
		});
	});
});

router.get('/join/:subname', function(req, res){
	ip_info = req.connection.remoteAddress;
	db.add_sub_to_pseudonym(req.user.pseudonym, req.params.subname, ip_info, function(response){
		if(response != statics.INTERNAL_ERROR){
			res.status(200).json({status: response});
		}else{
			res.status(403).json({status: response});
		}
	});
});

// =============================================
// ===================POSTS=====================
// =============================================
router.post('/newpost', function(req, res){
	ip_info = req.connection.remoteAddress;
	printer.printRouteRequest(req);
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
    if(req.body.selection){
        db.find_posts_by_sub(req.body.selection, ip_info, function(p_l){
            if(p_l){
                res.status(200).json({posts: p_l});
            }else{
                res.status(403).json({error: statics.INTERNAL_ERROR});
            }
        });
    }else{
        db.find_posts_by_pseudonym(req.user.pseudonym, ip_info, function(response){
			if(response){
				if(response == statics.NO_POSTS_FOUND){
					res.status(403).json({error: statics.NO_POSTS_FOUND});
				}else if(response == statics.INTERNAL_ERROR){
					res.status(403).json({error: statics.INTERNAL_ERROR});
				}else{
					res.status(200).json({posts:response});
				}
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
