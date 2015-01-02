/**
 * Created by mko on 15/11/14.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');

// handle registration post request here
// request goes to /people/new from client
router.post('/new', function(req, res){
    // return successful json
    res.json({ 'status': 'success' });

    console.log('\nPOST request for /people/new  ::--> got data');
    try{
    	console.log(req.body.vale + '\n' + req.body.valn + '\n' + req.body.valps + '\n' + req.body.valp + '\n');
	}catch(ex){
		console.log('ERROR: ' + ex);
	}

    // to do
    // work with passport to authenticate
    //
});

router.post('/login', function(req, res){
	res.json({'status': 'success'});

	console.log('\nPOST request for /people/login  ::--> got data');
	try{
    	console.log(req.body.vale + '\n' + req.body.valp + '\n');
	}catch(ex){
		console.log('ERROR: ' + ex);
	}
});

/* GET home page. */
router.get('/', function(req, res) {
    res.render('people', {title: 'Qi People'});
});

module.exports = router;