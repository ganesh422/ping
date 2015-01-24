var express = require('express');
var router = express.Router();
var logger = require('../utils/logger');

/* GET home page. */
router.get('/', function(req, res) {
  logger.info('GET request for /  ::--> returned index.jade');
  res.render('index.jade', {"title": "ping"});
});

module.exports = router;
