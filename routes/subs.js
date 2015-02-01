/**
 * Created by mko on 01/02/15.
 */
var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var logger = require('../utils/logger'); 
var get_ip = require('ipware')().get_ip;
var colors = require('colors');
var userlist = require('../utils/db').user_list;

router.post('/new', function(req, res){
	var ip_info = get_ip(req).clientIp;
    logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/subs/new'.blue.bold);
    db.db_insert_new_sub(req, res);
});

router.post('/fetch', function(req, res){
	var ip_info = get_ip(req).clientIp;
    logger.info(ip_info.toString().white.bold + ': ' + 'POST'.yellow.bold + ' request for ' + '/subs/fetch'.blue.bold + ' with id ' + req.body.valpseudo.white.bold);
    db.db_fetch_subs_for_pseudo(req, res);
});

module.exports = router;