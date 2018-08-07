var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var logger = require('morgan');


var api = require('./routes/api');
var util = require('./routes/util');
var config = require('./routes/config');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(config.session))

// if *.html, use auth functions. 
app.all(/[a-zA-Z0-9]+\.html/, util.checkCrendential);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

app.use('/api', api);

module.exports = app;
