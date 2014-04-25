exports.create = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });

    connection.query("CREATE TABLE IF NOT EXISTS drc_sch.tests (test_id BIGINT(11) NOT NULL AUTO_INCREMENT,name VARCHAR(128) NOT NULL,description VARCHAR(256),test_type INT(4) NOT NULL,client_id VARCHAR(128) NOT NULL,sales_id VARCHAR(128),test_person_id VARCHAR(128),start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME,subject_vol INT(5),set_subject_vol INT(5),complete_vol INT(5),report_date DATE,report_date_r DATE,money_receive_date DATE,money_receive_date_r DATE, INDEX(test_id)); ",[],function(err,rows){
            if (err)    throw err;
            console.log(rows);
        });
    connection.query("CREATE TABLE IF NOT EXISTS drc_sch.subject_schedule (id BIGINT(11) NOT NULL AUTO_INCREMENT,subject_no INT(5) NOT NULL,test_id BIGINT(11) NOT NULL,start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME, INDEX(id,subject_no)); ",[],function(err,rows){
            if (err)    throw err;
            console.log(rows);
        });
    connection.query("CREATE TABLE IF NOT EXISTS drc_sch.subjects (subject_no INT(5) NOT NULL AUTO_INCREMENT,name VARCHAR(128) NOT NULL,name_kana VARCHAR(128) ,age INT(3),sex INT(1),affiliation VARCHAR(128),INDEX(subject_no)); ",[],function(err,rows){
            if (err)    throw err;
            console.log(rows);
        });
	
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
    connection.query("select * from drc_sch.subjects",[],function(err,rows){
            if (err)    throw err;
			result.rows = rows;
            console.log(result);
			var resultJSON = JSON.stringify(result);
			res.send(resultJSON);
        });
    //コネクションクローズ
    connection.end();
};