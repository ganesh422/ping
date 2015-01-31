/**
 * Created by mko on 29/01/15.
 */
var express = require('express');
var router = express.Router();
var db = require("../utils/db");
var logger = require('../utils/logger'); 
var get_ip = require('ipware')().get_ip;

/* GET home page. */
router.get('/', function(req, res) {
    res.render('home.jade', {title: 'ping'});
    var ip_info = get_ip(req).clientIp;
  	logger.info(ip_info.toString().white.bold + ': ' + 'GET'.yellow.bold + ' request for ' + '/home'.blue.bold);
});

module.exports = router;