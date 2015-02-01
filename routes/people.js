/**
 * Created by mko on 15/11/14.
 */
var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var logger = require('../utils/logger'); 
var get_ip = require('ipware')().get_ip;
var colors = require('colors');
var userlist = require('../utils/db').user_list;

// handle registration post request here
// request goes to /people/new from client
router.post('/new', function(req, res){
    var ip_info = get_ip(req).clientIp;
    logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + 'request for ' + '/people/new'.blue.bold);
    db.db_insert_reg_mdb(req, res);
});

router.post('/login', function(req, res){
    var ip_info = get_ip(req).clientIp;
	logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/people/login'.blue.bold);
    db.db_login_mdb(req, res);
});

/* pseudonym lookup via ID */
router.post('/pseudolookup', function(req, res){
    var ip_info = get_ip(req).clientIp;
    logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request pseudonym lookup for ID ' + req.body.valuid.bgWhite.black.bold + ' for ' + '/people/pseudolookup'.blue.bold);
    db.db_pseudo_lookup_id(req.body.valuid, res);
});

/* logout */
router.post('/bye', function(req){
    var ip_info = get_ip(req).clientIp;
    logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/people/bye'.blue.bold);

    // remove the user from the list of currently active users
    db.user_list.splice(db.user_list.indexOf(req.body.valuid));
    logger.info('user ' + req.body.valuid.bgWhite.black.bold + ' logged out/closed session.');
});

router.get('/:name', function(req, res){
    res.send('Welcome to ' + req.params.name + "'s profile!");
});

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.jade', {title: 'ping People'});
});

module.exports = router;