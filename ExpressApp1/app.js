var express = require('express');
var router = express.Router();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var config = require('config');
var routes = require('./routes/index');
//var users = require('./routes/users');
var session = require('express-session');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var Sequelize = require('sequelize');
var app = express();


/**
 * Module dependencies.
 */
var fs = require('fs');
var client_list = require('./routes/client_list');
var itakusaki_list = require('./routes/itakusaki_list');
var user_list = require('./routes/user_list');
var division_list = require('./routes/division_list');
var schedule = require('./routes/schedule');
var template = require('./routes/template');
var calendar = require('./routes/calendar');
var login = require('./routes/login');
var portal = require('./routes/portal');
var db = require('./routes/createTablesPG');
var admin = require('./routes/admin');
var entry_edit = require('./routes/entry_edit');
var entry_list = require('./routes/entry_list');
var quote_form = require('./routes/quote_form');
var test_item_list = require('./routes/test_item_list');
var configuration = require('./routes/configuration');
var auth_settings = require('./routes/auth_settings');

var entry_post = require('./api/entry_postPG');
var entry_get = require('./api/entry_getPG');
var workitem_post = require('./api/workitem_postPG');
var workitem_get = require('./api/workitem_getPG');
var template_post = require('./api/template_postPG');
var template_get = require('./api/template_getPG');
var schedule_post = require('./api/schedule_postPG');
var schedule_get = require('./api/schedule_getPG');
var user_post = require('./api/user_postPG');
var user_get = require('./api/user_getPG');
var division_post = require('./api/division_postPG');
var division_get = require('./api/division_getPG');
var login_post = require('./api/login_post');
var print_pdf = require('./api/print_pdf');
var client_get = require('./api/client_getPG');
var client_post = require('./api/client_postPG');
var itakusaki_get = require('./api/itakusaki_getPG');     // 2016.01.29 委託先マスタ
var itakusaki_post = require('./api/itakusaki_postPG');   // 2016.01.29 委託先マスタ
var billing_post = require('./api/billing_postPG');
var billing_get = require('./api/billing_getPG');
var test_item_post = require('./api/test_item_postPG');
var test_item_get = require('./api/test_item_getPG');
var config_post = require('./api/configuration_postPG');
var config_get = require('./api/configuration_getPG');
var auth_settings_post = require('./api/auth_settings_postPG');
var auth_settings_get = require('./api/auth_settings_getPG');
//mysql = require('mysql');
pg = require('pg');
var sequelize = require('./libs/dbconn')(config);
var models = require('./models')(sequelize);


//var sequelize = new Sequelize('postgres://drc_root:drc_r00t@@localhost:5432/drc_sch');
connectionString = "tcp://drc_root:drc_r00t@@localhost:5432/drc_sch";

var http = require('http');
var path = require('path');

// Version
drc_version = '(Ver.1.0.3 (作業中))';

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cookieParser());

app.use(session({ key: 'session_id',resave: false,saveUninitialized: false,secret:'ExpressApp1' }));
var logs = fs.createWriteStream('./access.log', {flags: 'w'});
//app.use(morgan({ stream: logs }));
//app.use(logger({
//  format: 'default',
//  stream: logs
//}));

app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(methodOverride());
//app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

// development only

if ('development' == app.get('env')) {
  app.use(errorHandler());
	// Database migration
	var sync = require('./routes/sync');
	app.get('/devel/sync/:table', sync.one(models));
	app.post('/devel/sync', sync.all(sequelize));
  app.use(logger('dev',{imediate:true}));
}
if ('production' == app.get('env')) {
  app.use(logger('dev',{imediate:true,stream:logs}));
}
//router.get('/',routes.index);
//router.get('/index',routes.index);
app.get('/client_list', client_list.list);			//
app.get('/itakusaki_list', itakusaki_list.list);			//
app.get('/user_list', user_list.list);				//
app.get('/test_item_list', test_item_list.list);	//
app.get('/division_list', division_list.list);		//
app.get('/schedule', schedule.list);				//
app.get('/template', template.list);				//
app.get('/calendar', calendar.list);				//
app.post('/login',login.login);
app.post('/portal',portal.portal);
app.get('/portal',portal.portal);
app.get('/dbinit', db.create);
//app.get('/dbsamples', db.samples);
//app.get('/db', db.list);
//app.post('/dbpost',db.post);
app.get('/admin',admin.list);
app.get('/configuration',configuration.list);
app.get('/auth_settings',auth_settings.list);
app.get('/entry_edit/:no?',entry_edit.list);
app.get('/entry_list', entry_list.list);
app.post('/entry_post', upload.array(), entry_post.entry_post);
app.post('/quote_post', upload.array(), entry_post.quote_post);
app.post('/workitem_post', upload.array(), workitem_post.workitem_post);
app.post('/template_post', upload.array(), template_post.template_post);
app.post('/template_update', upload.array(), template_post.template_update);
app.post('/template_delete', upload.array(), template_post.template_delete);
app.post('/schedule_post', upload.array(), schedule_post.schedule_post);
app.post('/user_post', upload.array(), user_post.user_post);
app.post('/password_post', upload.array(), user_post.password_post);
app.post('/division_post', upload.array(), division_post.division_post);
app.get('/entry_get/:no?', entry_get.entry_get);
app.get('/entry_get/cal/:start/:end/:test_type', entry_get.entry_get_list_cal);
app.get('/entry_get/gantt/:start/:end/:test_type', entry_get.entry_get_list_gantt);
app.get('/quote_get/:entry_no?', entry_get.quote_get);
app.get('/report_gantt/:entry_no?', entry_get.report_gantt);
app.get('/quote_specific_get_grid/:entry_no/:quote_no', entry_get.quote_specific_get_grid);
app.get('/quote_specific_get_list/:entry_no/:quote_no?', entry_get.quote_specific_get_list);
app.get('/quote_specific_get_list_for_entryform/:entry_no', entry_get.quote_specific_get_list_for_entryform);
app.get('/quote_specific_get_list_for_calendar/:entry_no', entry_get.quote_specific_get_list_for_calendar);
app.get('/workitem_get/:entry_no/:item_type', workitem_get.workitem_get);
app.get('/template_get_all/:item_type?', template_get.template_get_all);
app.get('/template_get_list/:template_cd/:item_type?', template_get.template_get_list);
app.get('/template_get/:template_id', template_get.template_get);
app.get('/template_name_list', template_get.template_name_list);
app.get('/schedule_get/:schedule_id?', schedule_get.schedule_get);
app.get('/schedule_get/term/:start/:end/:base_cd/:test_large_item_cd', schedule_get.schedule_get);
app.get('/user_get/:uid?', user_get.user_get);
app.get('/division_get/:division?', division_get.division_get);
app.post('/', login_post.login_post);
app.get('/logout', login_post.logout_post);
app.get('/quote_form', quote_form.form);
app.post('/print_pdf/:entry_no?', print_pdf.print_pdf);
app.get('/client_get/:no?', client_get.client_get);
app.get('/client_division_get', client_get.client_division_get);
app.get('/client_person_get', client_get.client_person_get);
app.post('/client_post', upload.array(), client_post.client_post);
app.post('/client_division_post', upload.array(), client_post.client_division_post);
app.post('/client_person_post', upload.array(), client_post.client_person_post);

app.get('/itakusaki_get/:no?', itakusaki_get.itakusaki_get);                  // 2016.01.29 委託先マスタ
app.get('/itakusaki_division_get', itakusaki_get.itakusaki_division_get);     // 2016.01.29 委託先マスタ
app.get('/itakusaki_person_get', itakusaki_get.itakusaki_person_get);         // 2016.01.29 委託先マスタ
app.post('/itakusaki_post', upload.array(),itakusaki_post.itakusaki_post);                      // 2016.01.29 委託先マスタ
app.post('/itakusaki_division_post', upload.array(),itakusaki_post.itakusaki_division_post);    // 2016.01.29 委託先マスタ
app.post('/itakusaki_person_post', upload.array(),itakusaki_post.itakusaki_person_post);        // 2016.01.29 委託先マスタ

app.post('/billing_info_post', upload.array(), billing_post.billing_post);
app.get('/billing_info_get', billing_get.billing_get);
app.get('/billing_get_total/:entry_no', billing_get.billing_get_total);
app.post('/test_item_post', upload.array(), test_item_post.test_item_post);
app.get('/test_item_get/:class', test_item_get.test_item_get);
app.post('/config_post/:id', upload.array(), config_post.configuration_post);
app.get('/config_get/:id', config_get.configuration_get);
app.post('/auth_post', upload.array(), auth_settings_post.auth_settings_post);
app.get('/auth_get_all', auth_settings_get.auth_settings_get_all);
app.get('/auth_get/:pno', auth_settings_get.auth_settings_get);
/** mysql -> pg �ɕύX 2014.11.13
pool = mysql.createPool({
	host : 'localhost',
	user : 'drc_root',
	password: 'drc_r00t@',
	database : 'drc_sch'

});
 * **/

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


module.exports = app;

process.on('uncaughtException',function(err) {
	console.log(err);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  var msg = 'System Build:2016.01.21';
  console.log(msg);
});
