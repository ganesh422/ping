/**
 * Created by mko on 15/11/14.
 */
var express = require('express');
var router = express.Router();
var db = require("../utils/db");
var logger = require('../utils/logger'); 

// handle registration post request here
// request goes to /people/new from client
router.post('/new', function(req, res){
    logger.info('POST request for /people/new');
    //db.register_sql(req, res);
    db.db_insert_reg_mdb(req, res);
});

router.post('/login', function(req, res){
	logger.info('POST request for /people/login');
	//db.login_sql(req, res);
    db.db_login_mdb(req, res);
});

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.jade', {title: 'ping People'});
});

module.exports = router;