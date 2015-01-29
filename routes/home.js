/**
 * Created by mko on 29/01/15.
 */
var express = require('express');
var router = express.Router();
var db = require("../utils/db");
var logger = require('../utils/logger'); 

/* GET home page. */
router.get('/', function(req, res) {
    res.render('home.jade', {title: 'ping'});
    logger.info('GET request for home --> returned home.jade')
});

module.exports = router;