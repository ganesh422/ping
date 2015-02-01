//modules
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var logger = require('./utils/logger');
var sys = require('sys');
var domain = require('domain');
var cluster = require('cluster');
var db = require('./utils/db');

// routes
var routes = require('./routes/index');
var people = require('./routes/people');
var posts = require('./routes/posts');
var subs = require('./routes/subs');
var home = require('./routes/home');
var users = require('./routes/users');
var ajax = require('./routes/ajax');
var images = require('./routes/images');

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

/* ==================================================================================
 *                                  VARIABLES
 */

var http_server;
var https_server;

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
app.use('/posts', posts);
app.use('/subs', subs);
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
            http_server = http.createServer(app).listen(http_port);
            logger.info(('HTTP Server started on port ' + http_port).magenta.bold);
            https_server = https.createServer(options, app).listen(https_port);
            logger.info(('HTTPS Server started on port ' + https_port).magenta.bold);
        });
    }

    process.on('uncaughtException', function (err) {
        logger.error((new Date).toUTCString() + ' uncaughtException:', err.message)
        logger.error(err.stack)
        process.exit(1)
    });
}

start();