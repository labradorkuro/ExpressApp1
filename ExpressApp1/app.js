

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var schedule = require('./routes/schedule');
var login = require('./routes/login');
var portal = require('./routes/portal');
var db = require('./routes/createTables');
var admin = require('./routes/admin');
var http = require('http');
var path = require('path');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/schedule', schedule.list);
app.post('/login',login.login);
app.post('/portal',portal.portal);
app.get('/portal',portal.portal);
app.get('/dbinit', db.create);
app.get('/db', db.list);
app.get('/admin',admin.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
