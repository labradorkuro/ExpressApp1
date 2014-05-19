
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
		"CREATE TABLE IF NOT EXISTS drc_sch.sales_info (sales_id INT(11) NOT NULL AUTO_INCREMENT,sales_no VARCHAR(12) NOT NULL,name VARCHAR(128) NOT NULL,customer_code VARCHAR(128),estimate INT(5),regist_date DATE,order_date DATE,money_receive_date DATE,money_received_date DATE,sales_user_id VARCHAR(128),created TIMESTAMP,updated TIMESTAMP,INDEX(sales_id,sales_no));",
		"CREATE TABLE IF NOT EXISTS drc_sch.tests (test_id BIGINT(11) NOT NULL AUTO_INCREMENT,sales_no VARCHAR(12) NOT NULL,test_name VARCHAR(128) NOT NULL,description VARCHAR(256),test_type INT(4) NOT NULL,test_person_id VARCHAR(128),start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME,subject_vol INT(5) DEFAULT 0,set_subject_vol INT(5) DEFAULT 0,complete_vol INT(5) DEFAULT 0,created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128) ,INDEX(test_id)); ",
		"CREATE TABLE IF NOT EXISTS drc_sch.estimates (sales_no VARCHAR(12) NOT NULL,test_name VARCHAR(128) NOT NULL,estimate_no VARCHAR(12), order_flag INT(1),description VARCHAR(256),created TIMESTAMP,updated TIMESTAMP,INDEX(sales_no,test_name));",
		"CREATE TABLE IF NOT EXISTS drc_sch.reports (sales_no VARCHAR(12) NOT NULL,test_name VARCHAR(128) NOT NULL,report_no VARCHAR(12),description VARCHAR(256),created TIMESTAMP,updated TIMESTAMP,INDEX(sales_no,test_name));",
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
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名1-1','試験説明1-1',1,'顧客ID001','sales-0001','test-0001','2014/05/07 09:00:00','2014/05/09 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名1-2','試験説明1-2',1,'顧客ID002','sales-0001','test-0001','2014/05/07 09:00:00','2014/05/09 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名1-3','試験説明1-3',1,'顧客ID003','sales-0001','test-0001','2014/05/07 09:00:00','2014/05/09 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名1-4','試験説明1-4',1,'顧客ID004','sales-0001','test-0001','2014/05/07 09:00:00','2014/05/09 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名2','試験説明2',2,'顧客ID002','sales-0002','test-0002','2014/05/12 09:00:00','2014/05/14 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名3','試験説明3',3,'顧客ID003','sales-0003','test-0003','2014/05/12 09:00:00','2014/05/14 17:00:00',10);",
		"insert into drc_sch.tests (name,description,test_type,client_id,sales_id,test_person_id,start_date,end_date,subject_vol) values ('試験名4','試験説明4',4,'顧客ID004','sales-0004','test-0004','2014/05/12 09:00:00','2014/05/14 17:00:00',10);",
		"insert into drc_sch.subjects (name,name_kana,age,sex,affiliation) values('山田　太郎','ヤマダ　タロウ',20,1,'社内登録被験者')",
		"insert into drc_sch.subjects (name,name_kana,age,sex,affiliation) values('山田　花子','ヤマダ　ハナコ',30,2,'社内登録被験者')",
		"insert into drc_sch.subjects (name,name_kana,age,sex,affiliation) values('鈴木　一郎','スズキ　イチロウ',40,1,'社内登録被験者')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,1,1,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,2,2,'2014/05/12 09:00:00','2014/05/14 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,3,3,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,4,4,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,1,1,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,2,2,'2014/05/12 09:00:00','2014/05/14 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,3,3,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,4,4,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,1,1,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,2,2,'2014/05/12 09:00:00','2014/05/14 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,3,3,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,4,4,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,1,5,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,1,5,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,1,5,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(1,1,6,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(2,1,6,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
		"insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date) values(3,1,6,'2014/05/07 09:00:00','2014/05/09 17:00:00')",
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

exports.post = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });
	var queryno = req.body.q;
	var sql = "";
	if (queryno === '1') {
		// 試験スケジュール登録
		sql = "insert into drc_sch.subject_schedule (subject_no,patch_no,test_id,start_date,end_date,start_date_r,end_date_r) ";
		var sd = req.body.start_date;
		var ed = req.body.end_date;
		var sdr = req.body.start_date_r;
		var edr = req.body.end_date_r;
		if (sd === '') sd = null; else sd = "'" + sd + "'";
		if (sdr === '') sdr = null; else sdr = "'" + sdr + "'";
		if (ed === '') ed = null; else ed = "'" + ed + "'";
		if (edr === '') edr = null; else edr = "'" + edr + "'";

		var subjects = req.body.subjects.split(",");
		for(var i = 0;i < subjects.length;i++) {
			var values = sql + "values(" + subjects[i] + "," + req.body.patch_no + "," + req.body.test_id + "," 
						+ sd + "," + ed + "," + sdr + "," + edr + ")";
			console.log(values);
			connection.query(values, [], function (err, rows) {
				if (err)    throw err;
				console.log(rows);
			});
		}
	} else if (queryno === '2') {
		// 営業管理登録
		var rd = req.body.regist_date;
		var mrd = req.body.money_receive_date;
		var mrdd = req.body.money_received_date;
		if (rd === '') rd = null; else rd = "'" + rd + "'";
		if (mrd === '') mrd = null; else mrd = "'" + mrd + "'";
		if (mrdd === '') mrdd = null; else mrdd = "'" + mrdd + "'";
		sql = "INSERT INTO drc_sch.sales_info (sales_no,name,customer_code,regist_date,money_receive_date,money_received_date,sales_user_id) ";
		values = "VALUES( " 
					+ "'" + req.body.sales_no + "'," 
					+ "'" + req.body.name + "'," 
					+ "'" + req.body.customer_code + "'," 
					+ rd + "," 
					+ mrd + "," 
					+ mrdd + "," 
					+ "'" + req.body.sales_user_id + "'" 
				+ ")";
		console.log(sql + values);
		connection.query(sql + values, [], function (err, rows) {
			if (err)    throw err;
			console.log(rows);
		});
	}
    //コネクションクローズ
    connection.end();
    res.render('sales_management', { title: 'DRC 営業管理' });
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
	var sql = "";
	var resultJSON = "";
	var queryno = req.query.q;
	var test_type = '';
	var disp_mode = req.query.disp_mode;
	//console.log("q=" + req.query.q);
	if (queryno === '1') {
		sql = "select * from drc_sch.subjects";
	} else if (queryno === '2') {
		sql = "select test_id,name,description,test_type,client_id,sales_id,test_person_id,"
			+ "DATE_FORMAT(start_date,'%Y/%m/%d') AS start_date,DATE_FORMAT(end_date,'%Y/%m/%d') AS end_date,"
			+ "DATE_FORMAT(start_date_r,'%Y/%m/%d') AS start_date_r,DATE_FORMAT(end_date_r,'%Y/%m/%d') AS end_date_r,"
			+ "subject_vol,set_subject_vol,complete_vol,DATE_FORMAT(report_date,'%Y/%m/%d') AS report_date,"
			+ "DATE_FORMAT(report_date_r,'%Y/%m%d') AS report_date_r,DATE_FORMAT(money_receive_date,'%Y/%m%d') AS money_receive_date,"
			+ "DATE_FORMAT(money_receive_date_r,'%Y/%m/%d') AS money_receive_date_r from drc_sch.tests";
	} else if (queryno === '3') {
		var sd = req.query.sd;
		var ed = req.query.ed;
		test_type = req.query.test_type;
		sql = "SELECT subject_schedule.subject_no, subjects.name, tests.name AS testname, subject_schedule.patch_no, DATE_FORMAT(subject_schedule.start_date,'%Y/%m/%d') AS sd, DATE_FORMAT(subject_schedule.end_date,'%Y/%m/%d') AS ed,tests.subject_vol,tests.set_subject_vol,tests.complete_vol"
			+ " FROM subject_schedule JOIN subjects ON (subject_schedule.subject_no=subjects.subject_no) JOIN tests ON (subject_schedule.test_id=tests.test_id)"
			+ " WHERE tests.test_type = " + test_type + " AND ((subject_schedule.start_date >= '" + sd + "' AND " + "subject_schedule.start_date <= '" + ed + "') OR (subject_schedule.end_date >= '" + sd + "' AND " + "subject_schedule.end_date <= '" + ed + "'))" ;
		if (disp_mode === '1') {
			sql += " ORDER BY subject_schedule.subject_no,subject_schedule.patch_no";
		} else if (disp_mode === '2') {
			sql += " ORDER BY subject_schedule.patch_no,subject_schedule.subject_no";
		}
	} else if (queryno === '4') {
		sql = "SELECT sales_no,name,customer_code,DATE_FORMAT(regist_date,'%Y/%m/%d') AS regist_date,DATE_FORMAT(money_receive_date,'%Y/%m%d') AS money_receive_date,"
			+ "DATE_FORMAT(money_received_date,'%Y/%m/%d') AS money_received_date,sales_user_id FROM drc_sch.sales_info ";
	}
	//console.log("sql=" + sql);
    connection.query(sql,[],function(err,rows){
		if (err)    throw err;
		if ((queryno === '1') || (queryno === '2') || (queryno === '4')) {
			var result = {
				page:'1',
				total:'1',
				records:'2',
				rows:[]
			};
			result.rows = rows;
			console.log(result);
			resultJSON = JSON.stringify(result);
			res.send(resultJSON);
		} else if (queryno === '3') {
			// スケジュールの検索
			var result = {
				from:sd,
				to:ed,
				name:'被験者名',
				desc:'検体No',
				data:[]
			};
			if (test_type === '1') {
				// 安全性試験の検索
				if (disp_mode === '1') {
					for(var i = 0;i < rows.length;i++) {
						var v = {name:'',desc:'',subject_vol:0,set_subject_vol:0,complete_vol:0,values:[]};
						v.name = rows[i].name;
						v.desc = rows[i].patch_no;
					
						var t = {from:'',to:'',label:'',color:''};
						t.from = rows[i].sd;
						t.to = rows[i].ed;
						t.label = rows[i].testname;
						t.color = 'limegreen';
						if (i > 0) {
							if ((rows[i].subject_no === rows[i - 1].subject_no) && (rows[i].patch_no === rows[i - 1].patch_no)) {
						
								result.data[result.data.length - 1].values.push(t);
							} else {
								if (rows[i].name === rows[i - 1].name) {
									// サプレス表示のため
									v.name = '';
								}
								v.values.push(t);
								result.data.push(v);
							}		
						} else {
							v.values.push(t);
							result.data.push(v);
						}
					}
				} else if (disp_mode === '2') {
					result.name = '検体No';
					result.desc = '被験者名';
					for(var i = 0;i < rows.length;i++) {
						var v = {name:'',desc:'',subject_vol:0,set_subject_vol:0,complete_vol:0,values:[]};
						v.name = rows[i].patch_no;
						v.desc = rows[i].name;
						if (rows[i].subject_vol != null) v.subject_vol = rows[i].subject_vol;
						if (rows[i].set_subject_vol != null) v.set_subject_vol = rows[i].set_subject_vol;
						if (rows[i].complete_vol != null) v.complete_vol = rows[i].complete_vol;
						var t = {from:'',to:'',label:'',color:''};
						t.from = rows[i].sd;
						t.to = rows[i].ed;
						t.label = rows[i].testname;
						t.color = 'limegreen';
						if (i > 0) {
							if ((rows[i].patch_no === rows[i - 1].patch_no) && (rows[i].name === rows[i - 1].name)) {
						
								result.data[result.data.length - 1].values.push(t);
							} else {
								if (rows[i].patch_no === rows[i - 1].patch_no) {
									// サプレス表示のため
									v.name = '';
								}
								v.values.push(t);
								result.data.push(v);
							}		
						} else {
							v.values.push(t);
							result.data.push(v);
						}
					}
				}
				resultJSON = JSON.stringify(result);
				res.send(resultJSON);
				console.log(result);
			} else if (test_type >= '2') {
				// SPF試験検索
				result.name = '試験名';
				result.desc = '被験者名';
				for(var i = 0;i < rows.length;i++) {
					var v = {name:'',desc:'',subject_vol:0,set_subject_vol:0,complete_vol:0,values:[]};
					v.name = rows[i].testname;
					v.desc = rows[i].name;
					if (rows[i].subject_vol != null) v.subject_vol = rows[i].subject_vol;
					if (rows[i].set_subject_vol != null) v.set_subject_vol = rows[i].set_subject_vol;
					if (rows[i].complete_vol != null) v.complete_vol = rows[i].complete_vol;
					var t = {from:'',to:'',label:'',color:''};
					t.from = rows[i].sd;
					t.to = rows[i].ed;
					t.label = rows[i].patch_no;
					t.color = 'limegreen';
					if (i > 0) {
						if ((rows[i].testname === rows[i - 1].testname) && (rows[i].name === rows[i - 1].name)) {
						
							result.data[result.data.length - 1].values.push(t);
						} else {
							if (rows[i].testname === rows[i - 1].testname) {
								// サプレス表示のため
								v.name = '';
							}
							v.values.push(t);
							result.data.push(v);
						}		
					} else {
						v.values.push(t);
						result.data.push(v);
					}
				}
				resultJSON = JSON.stringify(result);
				res.send(resultJSON);
				console.log(result);
			}
		}
    });
    //コネクションクローズ
    connection.end();
};