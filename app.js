//modules
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var logger = require("./utils/logger");

// routes
var routes = require('./routes/index');
var people = require('./routes/people');
var home = require('./routes/home');
var users = require('./routes/users');
var ajax = require('./routes/ajax');
var images = require('./routes/images');
var sys = require('sys');

// allow input in console
// react to input in console
var stdin = process.openStdin();
stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then substring() 
    switch(d.toString().substring(0, d.length-1)){
        case 'exit':
            process.exit();
            break;
        case 'clear':
            process.stdout.write('\033c');
            break;
    }
});

/* ==================================================================================
 *                                  VARIABLES
 */

// port variables
var http_port = process.env.port || 1337;
var https_port = process.env.port || 1338;

var privateKey  = fs.readFileSync('./sslcert/key.pem');
var certificate = fs.readFileSync('./sslcert/cert.pem');

var options = {key: privateKey, cert: certificate};

/*
 *                                END VARIABLES
/* ==================================================================================*/




// initialise express
var app = express();

logger.debug("Overriding 'Express' logger");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.set('development', function () { app.locals.pretty = true; });

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/people', people);
app.use('/home', home);
app.use('/users', users);
app.use('/ajax', ajax);
app.use('/images', images);
app.use('/hello/:name', function(req, res){
    res.send('Hello, ' + req.params.name);
});
/* GET demo page. */
app.get('/demo', function(req, res) {
  logger.info('GET request for /  ::--> returned demo.jade');
  res.render('demo.jade', {"title": "ping"});
});

// logging
app.use(require('morgan')({ "stream": logger.stream }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


try {
    http.createServer(app).listen(http_port);
    logger.info('HTTP Server listening on ' + http_port + '...');
}catch(ex){
    logger.error("COULDN'T START HTTP SERVER!");
    logger.error(ex);
}

try {
    https.createServer(options, app).listen(https_port);
    logger.info('HTTPS Server listening on ' + https_port + '...');
}catch(ex){
    logger.error("COULDN'T START HTTPS SERVER!");
    logger.error(ex);
}
