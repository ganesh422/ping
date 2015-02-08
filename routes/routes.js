var express = require('express');
var router = express.Router();
var get_ip = require('ipware')().get_ip;
var logger = require('../utils/logger');
var db = require('../utils/db');
var status_codes = require('../utils/statics'); 

// =============================================
// ============REDIRECT WITHOUT LOGIN===========
// =============================================
function requireLogin(req, res, next){
	if(!req.ping_authenticated_user._id){
		logger.warn('User (' + get_ip(req).clientIp.toString().white.bold + ') was redirected to /welcome (NO LOGIN)');
		res.redirect('/welcome');
	}else{
		next();
	}
}

// =============================================
// WELCOME PAGE (login, registration, etc.)=====
// =============================================
router.get('/welcome', function(req, res){
	var ip_info = get_ip(req).clientIp;
  	logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + ' request for ' + '/welcome'.blue.bold);
  	// console.log(req.sessionID.toString());
	res.render('welcome.jade');
});

router.post('/login', function(req, res){
	var ip_info = get_ip(req).clientIp;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/login'.blue.bold);
    db.login_mdb(req.body.emailpseudonym, req.body.passwd, ip_info, function(response_status, pseudonym, id, email){
        if(pseudonym && id && response_status == status_codes.LOGIN_SUC){
        	req.ping_authenticated_user.pseudonym = pseudonym;
        	req.ping_authenticated_user._id = id;
        	req.ping_authenticated_user.email = email;
            res.status(200).json({status: response_status});
        }else{
            res.status(403).json({status: response_status});
        }
    });
});

router.post('/signup', function(req, res){
	var ip_info = get_ip(req).clientIp;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/signup'.blue.bold);
	db.insert_signup_mdb(req.body.email, req.body.name, req.body.pseudonym, req.body.passwd, ip_info, function(response_status){
		if(response_status == status_codes.REGISTRATION_SUC){
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
	var ip_info = get_ip(req).clientIp;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/'.blue.bold);
	console.log(req.ping_authenticated_user);
	res.render('home');
});

// =============================================
// =================PROFILES====================
// =============================================
router.get('/people/me', requireLogin, function(req, res){
	res.render('people', {title: 'Your profile', user: req.ping_authenticated_user});
});

router.get('/people/:id', function(req, res){

});

// =============================================
// ==================LOGOUT=====================
// =============================================
router.get('/logout', function(req, res){
	if(req.ping_authenticated_user._id){
		logger.info(req.ping_authenticated_user._id.bgWhite.black.bold + ' (' + req.ping_authenticated_user.pseudonym.bold.white + ') logged out.');
		req.ping_authenticated_user.reset();
	}
	db.userlist_remove_user(req.ping_authenticated_user.pseudonym);
	res.redirect('/welcome');
});

module.exports = router;