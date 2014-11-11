

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var schedule = require('./routes/schedule');
var calendar = require('./routes/calendar');
var login = require('./routes/login');
var portal = require('./routes/portal');
var db = require('./routes/createTablesPG');
var admin = require('./routes/admin');
var entry_edit = require('./routes/entry_edit');
var entry_list = require('./routes/entry_list');
var entry_post = require('./api/entry_postPG');
var entry_get = require('./api/entry_getPG');
var workitem_post = require('./api/workitem_postPG');
var workitem_get = require('./api/workitem_getPG');
var schedule_post = require('./api/schedule_postPG');
var schedule_get = require('./api/schedule_getPG');
mysql = require('mysql');
pg = require('pg');
connectionString = "tcp://drc_root:drc_r00t@@localhost:5432/drc_sch";

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
app.use(express.bodyParser());
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
app.get('/calendar', calendar.list);
app.post('/login',login.login);
app.post('/portal',portal.portal);
app.get('/portal',portal.portal);
app.get('/dbinit', db.create);
//app.get('/dbsamples', db.samples);
//app.get('/db', db.list);
//app.post('/dbpost',db.post);
app.get('/admin',admin.list);
app.get('/entry_edit/:no?',entry_edit.list);
app.get('/entry_list', entry_list.list);
app.post('/entry_post', entry_post.entry_post);
app.post('/quote_post', entry_post.quote_post);
app.post('/workitem_post', workitem_post.workitem_post);
app.post('/schedule_post', schedule_post.schedule_post);
app.get('/entry_get/:no?', entry_get.entry_get);
app.get('/entry_get/term/:start/:end/:test_type', entry_get.entry_get);
app.get('/quote_get/:entry_no?', entry_get.quote_get);
app.get('/quote_gantt/:entry_no?', entry_get.quote_gantt);
app.get('/workitem_get/:entry_no?', workitem_get.workitem_get);
app.get('/schedule_get/:schedule_id?', schedule_get.schedule_get);
app.get('/schedule_get/term/:start/:end/:base_cd?/:test_type', schedule_get.schedule_get);

pool = mysql.createPool({
	host : 'localhost',
	user : 'drc_root',
	password: 'drc_r00t@',
	database : 'drc_sch'

});	
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
