/**
 * Created by mko on 15/11/14.
 */
var express = require('express');
var router = express.Router();
var dbpool = require("../src/db");

// handle registration post request here
// request goes to /people/new from client
router.post('/new', function(req, res){
    console.log('\nPOST request for /people/new  ::--> got data');
    try{
        dbpool.getConnection(function(err, connection) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                res.status(403).json({errorHappened:false});
                return;
            }

            console.log('connected as id ' + connection.threadId);

            var post;

            if(req.body.valps == undefined){
                post = {eaddress:req.body.vale, name:req.body.valn, wp:req.body.valp};
            }else{
                post = {eaddress:req.body.vale, name:req.body.valn, pseudo:req.body.valps, wp:req.body.valp};
            }
            
            var query = connection.query("INSERT INTO User SET ?", post, function(err, result) {
                if (err){
                    console.log("ERROR AT MYSQL QUERY");
                    console.log(err);
                    res.status(403).json({errorHappened:false});
                    return;
                }
                
                console.log(query.sql);
                console.log(result); 
                res.status(200).json({isRegistered:true});

                // release connection for next request
                connection.release();
            });
        });
	}catch(ex){
		console.log('ERROR: ' + ex);
	}
});

router.post('/login', function(req, res){
	console.log('\nPOST request for /people/login  ::--> got data');
	try{
    	dbpool.getConnection(function(err, connection) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                res.status(403).json({errorHappened:true});
                return;
            }

            console.log('connected as id ' + connection.threadId);

            var query = connection.query("SELECT wp from User WHERE eaddress=?", [req.body.vale], function(err, rows, fields) {
                if (err){
                    console.log("ERROR AT MYSQL QUERY");
                    console.log(err);
                    res.status(403).json({errorHappened:true});
                    return;
                }

                if(rows[0].wp == req.body.valp){
                    console.log("password is correct");
                    res.status(200).json({isValid:true});
                }else{
                    console.log("password is invalid");
                    res.status(403).json({isValid:false});
                }

                console.log(query.sql);
                console.log(rows[0]);
                console.log(req.body.valp);
                console.log(rows[0].wp); 

                // release connection for next request
                connection.release();
            });
        });
	}catch(ex){
		console.log('ERROR: ' + ex);
	}
});


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.jade', {title: 'Qi People'});
});

module.exports = router;