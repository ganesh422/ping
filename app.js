require('dotenv').load();

//modules
var express      = require('express');
var http         = require('http');
var https        = require('https');
var path         = require('path');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('client-sessions');
var fs           = require('fs');
var logger       = require('./utils/logger');
var util         = require('util');
var domain       = require('domain');
var cluster      = require('cluster');
var config       = require('./config');

require('events').EventEmitter.prototype._maxListeners = 100; // fix event memory leak

// routes
var routes = require('./routes/routes');

/* ==================================================================================
 *                                  VARIABLES
 */

var http_server;
var https_server;

var privateKey  = fs.readFileSync('./sslcert/key.pem');
var certificate = fs.readFileSync('./sslcert/cert.pem');

var options = {key: privateKey, cert: certificate};

/*
 *                                END VARIABLES
/* ==================================================================================*/


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
        case 'close':
            process.exit();
            break;
        case 'clear':
            process.stdout.write('\033c');
            break;
        case 'restart':
            logger.warn('shutting down http server.'.red.bold);
            http_server.close();
            logger.warn('shutting down https server.'.red.bold);
            https_server.close();
            start();
            break;
        case 'res':
            logger.warn('shutting down http server.'.red.bold);
            http_server.close();
            logger.warn('shutting down https server.'.red.bold);
            https_server.close();
            start();
            break;
        case 'users':
            // to do
            break;
    }
});


// initialise express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'jade');
app.set('development', function () { app.locals.pretty = true; });

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

// authentication cookies
var auth_session = session({
    cookieName: config.userCookie.name, 
    requestKey: config.userCookie.key, /*overrides cookieName for the key name added to the request object*/ 
    secret: config.userCookie.secret, 
    duration: config.userCookie.defaultLifeTime /*2 hours*/,
    activeDuration: config.userCookie.defaultActiveLifeTime, /*if the client performs an action within 1 hour, the cookie will live for another 2 hours*/
    httpOnly: true, /*client side js can not access the cookie*/
    secure: true/*,
    ephemeral: true /*cookie gets deleted when browser is closed*/
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth_session);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

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

// cluster start
function start(){
    //db.db_create_ALL_sub();

    var workers = process.env.WORKERS || require('os').cpus().length;

    if (cluster.isMaster) {

    logger.info('start cluster with %s workers', workers);

    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork().process;
        logger.info('worker %s started.', worker.pid);
    }

    cluster.on('exit', function(worker) {
        logger.warn('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    });

    } else {
        var d = domain.create();
        d.on('error', function(er) {
            logger.error('error at starting http/https server'.red.bold, er.stack);
            throw new Error('error at starting http/https server');
        });
        d.run(function(){
            http_server = http.createServer(app).listen(config.http.port);
            logger.info(('HTTP Server started on port ' + config.http.port).magenta.bold);
            https_server = https.createServer(options, app).listen(config.https.port);
            logger.info(('HTTPS Server started on port ' + config.https.port).magenta.bold);
        });
    }

    process.on('uncaughtException', function (err) {
        logger.error((new Date).toUTCString() + ' uncaughtException:', err.message)
        logger.error(err.stack)
        process.exit(1)
    });
}

start();