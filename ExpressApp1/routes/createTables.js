
exports.create = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });
	var sql = [
		"CREATE TABLE IF NOT EXISTS drc_sch.tests (test_id BIGINT(11) NOT NULL AUTO_INCREMENT,name VARCHAR(128) NOT NULL,description VARCHAR(256),test_type INT(4) NOT NULL,client_id VARCHAR(128) NOT NULL,sales_id VARCHAR(128),test_person_id VARCHAR(128),start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME,subject_vol INT(5),set_subject_vol INT(5),complete_vol INT(5),report_date DATE,report_date_r DATE,money_receive_date DATE,money_receive_date_r DATE,created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128) ,INDEX(test_id)); ",
		"CREATE TABLE IF NOT EXISTS drc_sch.subject_schedule (id BIGINT(11) NOT NULL AUTO_INCREMENT,subject_no INT(5) NOT NULL,patch_no INT(3),test_id BIGINT(11) NOT NULL,start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME,created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128), INDEX(id,subject_no)); ",
		"CREATE TABLE IF NOT EXISTS drc_sch.subjects (subject_no INT(5) NOT NULL AUTO_INCREMENT,name VARCHAR(128) NOT NULL,name_kana VARCHAR(128) ,age INT(3),sex INT(1),affiliation VARCHAR(128),created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128),INDEX(subject_no)); "
	];
	for(var i = 0;i < sql.length;i++) {
		connection.query(sql[i],[],function(err,rows){
            if (err)    throw err;
            console.log(rows);
        });
	}
	
    //コネクションクローズ
    connection.end();
    res.render('tables', { title: 'DRC 試験スケジュール管理' });
    //res.send("respond with a resource");
};

exports.samples = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });
	var sql = [
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名1','試験説明1',1,'顧客ID001','sales-0001','test-0001','2014/05/07 09:00:00','2014/05/09 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名2','試験説明2',2,'顧客ID002','sales-0002','test-0002','2014/05/12 09:00:00','2014/05/14 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名3','試験説明3',3,'顧客ID003','sales-0003','test-0003','2014/05/12 09:00:00','2014/05/14 17:00:00',10);",
		"insert into drc_sch.subjects (name,name_kana,age,sex,affiliation) values('山田　太郎','ヤマダ　タロウ',20,1,'社内登録被験者')",
		"insert into drc_sch.subjects (name,name_kana,age,sex,affiliation) values('山田　花子','ヤマダ　ハナコ',30,2,'社内登録被験者')",
		"insert into drc_sch.subjects (name,name_kana,age,sex,affiliation) values('鈴木　一郎','スズキ　イチロウ',40,1,'社内登録被験者')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,1,1,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,2,2,'2014/05/12 09:00:00','2014/05/14 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,3,3,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,1,1,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,2,2,'2014/05/12 09:00:00','2014/05/14 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,3,3,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,1,1,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,2,2,'2014/05/12 09:00:00','2014/05/14 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,3,3,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
	];
	for(var i = 0;i < sql.length;i++) {
		connection.query(sql[i],[],function(err,rows){
            if (err)    throw err;
            console.log(rows);
        });
	}
    //コネクションクローズ
    connection.end();
    res.render('tables', { title: 'DRC 試験スケジュール管理' });
    //res.send("respond with a resource");
};

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
		page:'1',
		total:'1',
		records:'2',
		rows:[]
	};
	var sql = "";
	var resultJSON = "";
	var queryno = req.query.q;
	//console.log("q=" + req.query.q);
	if (queryno === '1') {
		sql = "select * from drc_sch.subjects";
	} else if (queryno === '2') {
		sql = "select * from drc_sch.tests";
	} else if (queryno === '3') {
		sql = "SELECT subject_schedule.subject_no, subjects.name, tests.name AS testname, subject_schedule.patch_no, subject_schedule.start_date, subject_schedule.end_date"
		+ " FROM subject_schedule JOIN subjects ON (subject_schedule.subject_no=subjects.subject_no) JOIN tests ON (subject_schedule.test_id=tests.test_id)";
	} 
	console.log("sql=" + sql);
    connection.query(sql,[],function(err,rows){
		if (err)    throw err;
		if ((queryno === '1') || (queryno === '2')) {
			result.rows = rows;
			console.log(result);
			resultJSON = JSON.stringify(result);
			res.send(resultJSON);
		} else if (queryno === '3') {
			result = {rows:[]};
			result.rows = rows;
			console.log(result);
			resultJSON = JSON.stringify(result);
			res.send(resultJSON);
		}
    });
    //コネクションクローズ
    connection.end();
};