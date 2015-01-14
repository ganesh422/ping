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

            if(checkIfEmailInString(req.body.vale)){
                var query = connection.query("SELECT wp from User WHERE eaddress=?", [req.body.vale], function(err, rows, fields) {
                    if (err){
                        console.log("ERROR AT MYSQL QUERY");
                        console.log(err);
                        res.status(403).json({errorHappened:true});
                        return;
                    }

                    for (var i = rows.length - 1; i >= 0; i--) {
                        console.log(rows[i]);
                    };

                    if(rows.length > 0){
                        if(rows[0].wp == req.body.valp){
                            console.log("password is correct");
                            res.status(200).json({isValid:true});
                        }else{
                            console.log("password is invalid");
                            res.status(403).json({isValid:false});
                        }
                    }else{
                        console.log("QUERY RESULT FOR USER " + req.body.vale + " RETURNED NO RESULT!")
                        res.status(403).json({userNotFound:true});
                    }

                    //debugging
                    console.log(query.sql);
                    console.log(rows[0]);
                    console.log(req.body.valp); 

                    // release connection for next request
                    connection.release();
                });
            }else{
                console.log("GOT HERE!");
                var query = connection.query("SELECT wp from User WHERE pseudo=?", [req.body.vale], function(err, rows, fields) {
                    if (err){
                        console.log("ERROR AT MYSQL QUERY");
                        console.log(err);
                        res.status(403).json({errorHappened:true});
                        return;
                    }

                    for (var i = rows.length - 1; i >= 0; i--) {
                        console.log(rows[i]);
                    };

                    if(rows.length > 0){
                        if(rows[0].wp == req.body.valp){
                            console.log("password is correct");
                            res.status(200).json({isValid:true});
                        }else{
                            console.log("password is invalid");
                            res.status(403).json({isValid:false});
                        }
                    }else{
                        console.log("QUERY RESULT FOR USER " + req.body.vale + " RETURNED NO RESULT!")
                        res.status(403).json({userNotFound:true});
                    }

                    //debugging
                    console.log(query.sql);
                    console.log(rows[0]);
                    console.log(req.body.valp); 

                    // release connection for next request
                    connection.release();
                });
            }
        });
	}catch(ex){
		console.log('ERROR: ' + ex);
	}
});


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.jade', {title: 'Qi People'});
});

// return true if email is valid
function checkIfEmailInString(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}

module.exports = router;