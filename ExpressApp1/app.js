

/**
 * Module dependencies.
 */
var fs = require('fs');
var express = require('express');
var routes = require('./routes');
var client_list = require('./routes/client_list');
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
connectionString = "tcp://drc_root:drc_r00t@@localhost:5432/drc_sch";

var http = require('http');
var path = require('path');


var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.cookieParser('secret', 'drc_secreted_key'));
app.use(express.session({ key: 'session_id' }));
var logs = fs.createWriteStream('./access.log', {flags: 'w'});
app.use(express.logger({
  format: 'default',
  stream: logs
}));

app.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
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

app.get('/index', routes.index);
app.get('/', routes.index);
app.get('/client_list', client_list.list);			// 顧客マスタ
app.get('/user_list', user_list.list);				// 社員マスタ
app.get('/test_item_list', test_item_list.list);	// 試験分類リスト
app.get('/division_list', division_list.list);		// 部門リスト
app.get('/schedule', schedule.list);				// ガントチャート
app.get('/template', template.list);				// ガントチャートのテンプレート
app.get('/calendar', calendar.list);				// 試験スケジュール
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
app.post('/entry_post', entry_post.entry_post);
app.post('/quote_post', entry_post.quote_post);
app.post('/workitem_post', workitem_post.workitem_post);
app.post('/template_post', template_post.template_post);
app.post('/template_update', template_post.template_update);
app.post('/template_delete', template_post.template_delete);
app.post('/schedule_post', schedule_post.schedule_post);
app.post('/user_post', user_post.user_post);
app.post('/password_post', user_post.password_post);
app.post('/division_post', division_post.division_post);
app.get('/entry_get/:no?', entry_get.entry_get);
app.get('/entry_get/gantt/:start/:end/:test_type', entry_get.entry_get_list_gantt);
app.get('/entry_get/cal/:start/:end/:test_type', entry_get.entry_get_list_cal);
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
app.post('/client_post', client_post.client_post);
app.post('/client_division_post', client_post.client_division_post);
app.post('/client_person_post', client_post.client_person_post);
app.post('/billing_info_post', billing_post.billing_post);
app.get('/billing_info_get', billing_get.billing_get);
app.get('/billing_get_total/:entry_no', billing_get.billing_get_total);
app.post('/test_item_post', test_item_post.test_item_post);
app.get('/test_item_get/:class', test_item_get.test_item_get);
app.post('/config_post/:id', config_post.configuration_post);
app.get('/config_get/:id', config_get.configuration_get);
app.post('/auth_post', auth_settings_post.auth_settings_post);
app.get('/auth_get_all', auth_settings_get.auth_settings_get_all);
app.get('/auth_get/:pno', auth_settings_get.auth_settings_get);
/** mysql -> pg に変更 2014.11.13
pool = mysql.createPool({
	host : 'localhost',
	user : 'drc_root',
	password: 'drc_r00t@',
	database : 'drc_sch'

});
 * **/	
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
