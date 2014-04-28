


exports.list = function(req, res){
/**
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
	sql = "SELECT subject_schedule.subject_no, subjects.name, tests.name AS testname, subject_schedule.patch_no, DATE_FORMAT(subject_schedule.start_date,'%Y/%m/%d') AS sd, DATE_FORMAT(subject_schedule.end_date,'%Y/%m/%d') AS ed"
		+ " FROM subject_schedule JOIN subjects ON (subject_schedule.subject_no=subjects.subject_no) JOIN tests ON (subject_schedule.test_id=tests.test_id) ORDER BY subject_schedule.subject_no,subject_schedule.patch_no";

	console.log("sql=" + sql);
    connection.query(sql,[],function(err,rows){
		if (err)    throw err;
		var data = [];
		for(var i = 0;i < rows.length;i++) {
			var v = {name:'',desc:'',values:[]};
			v.name = rows[i].name;
			v.desc = rows[i].patch_no;
			var t = {from:'',to:'',label:'',color:''};
			t.from = rows[i].sd;
			t.to = rows[i].ed;
			t.label = rows[i].testname;
			t.color = 'green';
			if (i > 0) {
				if ((rows[i].subject_no === rows[i - 1].subject_no) || (rows[i].patch_no === rows[i - 1].patch_no)) {
					result.data[result.data.length - 1].values.push(t);
				} else {
					v.values.push(t);
					result.data.push(v);
				}		
			} else {
				v.values.push(t);
				result.data.push(v);
			}
		}
		resultJSON = JSON.stringify(result);
		console.log(resultJSON);
    });
    //コネクションクローズ
    connection.end();
**/
    res.render('schedule', { title: 'DRC 試験スケジュール管理' });
    //res.send("respond with a resource");
};
