var express = require('express');
var router = express.Router();
var logger = require('../utils/logger');
var get_ip = require('ipware')().get_ip;

/* GET home page. */
router.get('/', function(req, res) {
	var ip_info = get_ip(req).clientIp;
  	logger.info(ip_info.toString().rainbow.bold + ': ' + 'GET'.yellow.bold + ' request for ' + '/'.blue.bold);
  	res.render('index.jade', {"title": "ping"});
});

module.exports = router;
