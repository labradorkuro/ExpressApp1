


exports.list = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });
	var result = {
		from:'2014/05/07',
		to:'2014/05/13',
		name:'被験者名',
		desc:'検体No',
		data:[]
	};
	var sql = "";
	var resultJSON = "";
	sql = "SELECT subject_schedule.subject_no, subjects.name, tests.name AS testname, subject_schedule.patch_no, subject_schedule.start_date, subject_schedule.end_date"
		+ " FROM subject_schedule JOIN subjects ON (subject_schedule.subject_no=subjects.subject_no) JOIN tests ON (subject_schedule.test_id=tests.test_id)";

	console.log("sql=" + sql);
    connection.query(sql,[],function(err,rows){
	if (err)    throw err;
		result.data = rows;
		console.log(result);
		resultJSON = JSON.stringify(result);
    });
    //コネクションクローズ
    connection.end();
    res.render('schedule', { title: 'DRC 試験スケジュール管理' ,schedule_list: resultJSON});
    //res.send("respond with a resource");
};
