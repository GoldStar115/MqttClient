var express = require('express');
var expressValidator = require('express-validator');
var path = require('path');
var rfs = require('rotating-file-stream')
var favicon = require('serve-favicon');
var morgan = require('morgan');
var dotenv = require('dotenv');
dotenv.load();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var svgCaptcha = require('svg-captcha');
var app = express();
var url = require('url');
var asyncclient = require('async');
var crypto = require('crypto');
var formidable = require('formidable');
var debug = require('debug')('cryptocurrency:server');
var server = require('http').Server(app);
var usermanage = require('./controller/usermanage.js');
var MobileDetect = require('mobile-detect');
var url = require('url');
var port = normalizePort(process.env.PORT || 5000);

app.set('port', port);
app.use(expressValidator());
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
function onListening(req, res) {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);

}
//////////////////
// Morgan write log
var logDirectory = path.join(__dirname, 'log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})
app.use(morgan('combined', {stream: accessLogStream}))
//////////////////
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({//
    secret: process.env.SESSIONNAME,
    key: process.env.SESSIONSECRET,
    cookie: {maxAge: 3 * 24 * 60 * 60 * 1000},// 1 week
    saveUninitialized: true,
    resave: false,
}));
app.get('/', function(req, res){
    var redirectLink = '/index';
    var mobileredirectLink = '/mobileindex';
    md = new MobileDetect(req.headers['user-agent'])
    if (md.mobile()) {     
      return res.redirect(mobileredirectLink);
    }
    res.redirect(redirectLink);
});
app.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create({
    size: 4, //
    ignoreChars: '0o1i', //  0o1i
    noise: 1, //
    color: true, //
    background: '#c4c4c5' // background color of the svg image
  });
  req.session.captcha = captcha.text;
  console.log( req.session.captcha);
  res.set('Content-Type', 'image/svg+xml');
  res.status(200).send(captcha.data);
});

require('./route/route')(app);

app.use(function(req,res,next){
    if (req.url == "/login" || req.url == "/logout" || req.url == "/register" || req.url == "/forgot" || req.url == '/index') {
        console.log('Current url is  ' + req.url);
        next();
    }else{
        res.redirect('/');
    }
});
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/////////////////////////////////////
module.exports = app;
