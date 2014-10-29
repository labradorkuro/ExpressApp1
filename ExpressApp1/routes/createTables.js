//var mysql = require('mysql');

exports.create = function(req, res){
/*	
	var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });
*/
  	var sql = [
		"CREATE TABLE IF NOT EXISTS drc_sch.entry_info ("	// 案件データ
			+ "entry_no VARCHAR(10) NOT NULL,"	// 案件No
			+ "base_cd VARCHAR(2),"				// 拠点CD
			+ "entry_title VARCHAR(128),"		// 案件名
			+ "inquiry_date DATE,"				// 問合せ日
			+ "entry_status VARCHAR(2),"		// 案件ステータス
			+ "quote_no VARCHAR(9),"			// 見積番号
			+ "quote_issue_date DATE,"			// 見積書発行日
			+ "order_accepted_date DATE,"		// 受注日付
			+ "order_accept_check INT(1),"		// 仮受注日チェック
			+ "acounting_period_no INT(1),"		// 会計期No
			+ "order_type INT(1),"				// 受託区分
			+ "contract_type INT(1),"			// 契約区分
			+ "outsourcing_cd VARCHAR(5),"		// 委託先CD
			+ "division VARCHAR(2),"			// 事業部ID
			+ "entry_amount_price DEC(9),"		// 案件合計金額
			+ "entry_amount_billing DEC(9),"	// 案件請求合計金額
			+ "entry_amount_deposit DEC(9),"	// 案件入金合計金額
			+ "monitors_cost_prep_limit DATE,"	// 被験者費用準備期日
			+ "monitors_cost_prep_comp DATE,"	// 被験者費用準備完了日
			+ "drc_substituted_amount DEC(9),"	// DRC立替準備金額
			+ "prior_payment_limit DATE,"		// 事前入金期日
			+ "prior_payment_accept DATE,"		// 事前入金日
			+ "person_id VARCHAR(32),"			// 担当者ID
			+ "delete_check INT(1),"			// 削除フラグ
			+ "delete_reason VARCHAR(255),"		// 削除理由
			+ "input_check_date DATE,"			// 入力日
			+ "input_check INT(1),"				// 入力完了チェック
			+ "input_operator_id VARCHAR(32),"	// 入力者ID
			+ "confirm_check_date DATE,"		// 確認日
			+ "confirm_check INT(1),"			// 確認完了チェック
			+ "confirm_operator_id VARCHAR(32),"	// 確認者ID
			+ "created TIMESTAMP not null default 0,"				// 作成日
			+ "created_id VARCHAR(32),"			// 作成者ID
			+ "updated TIMESTAMP not null on update current_timestamp default current_timestamp,"				// 更新日
			+ "updated_id VARCHAR(32)"			// 更新者ID
			+ ", INDEX(entry_no));",
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_info ("	// 案件明細データ
			+ "entry_no VARCHAR(10),"			// 案件No
			+ "quote_no VARCHAR(9),"			// 見積番号
			+ "quote_detail_no VARCHAR(7),"		// 明細番号
			+ "test_item_cd VARCHAR(3),"		// 試験項目CD
			+ "test_item VARCHAR(255),"			// 試験項目名
			+ "sample_name VARCHAR(255),"		// 試料名
			+ "arrive_date DATE,"				// 到着日
			+ "test_planning_no VARCHAR(12),"	// 試験計画書番号
			+ "monitors_num INT(5),"			// 被験者数
			+ "sample_volume INT(5),"			// 検体数
			+ "final_report_no VARCHAR(12),"	// 報告書番号
			+ "final_report_limit DATE,"		// 報告書提出期限
			+ "final_report_date DATE,"			// 報告書提出日
			+ "quick_report_limit1 DATE,"		// 速報提出期限1
			+ "quick_report_date1 DATE,"		// 速報提出日1
			+ "quick_report_limit2 DATE,"		// 速報提出期限2
			+ "quick_report_date2 DATE,"		// 速報提出日2
			+ "expect_value DECIMAL(9,2),"		// 期待値・設定値
			+ "descript_value VARCHAR(255),"	// 値説明
			+ "unit_cd VARCHAR(5),"				// 単位CD
			+ "unit VARCHAR(5),"				// 単位
			+ "unit_price DECIMAL(9,2),"		// 単価
			+ "quantity INT(11),"				// 数量
			+ "quote_price DECIMAL(9,2),"		// 見積金額
			+ "test_memo VARCHAR(128),"			// 備考
			+ "quote_delete_check INT(1),"			// 削除フラグ
			+ "quote_delete_reason VARCHAR(255),"		// 削除理由
			+ "created TIMESTAMP not null default 0,"				// 作成日
			+ "created_id VARCHAR(32),"			// 作成者ID
			+ "updated TIMESTAMP not null on update current_timestamp default current_timestamp,"				// 更新日
			+ "updated_id VARCHAR(32)"			// 更新者ID
			+ ", INDEX(entry_no,quote_detail_no));",
		"CREATE TABLE IF NOT EXISTS drc_sch.base_info ("		// 拠点マスタ
			+ "base_cd VARCHAR(2),"				// 拠点CD
			+ "base_name VARCHAR(32),"			// 拠点名
			+ "created TIMESTAMP not null default 0," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP not null on update current_timestamp default current_timestamp," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", INDEX(base_cd));",
		"CREATE TABLE IF NOT EXISTS drc_sch.division_info ("	// 事業部マスタ
			+ "division VARCHAR(2),"			// 事業部ID
			+ "division_name VARCHAR(32),"		// 事業部名
			+ "created TIMESTAMP not null default 0," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP not null on update current_timestamp default current_timestamp," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", INDEX(division));",
		"CREATE TABLE IF NOT EXISTS drc_sch.entry_number (" // 案件番号管理テーブル
			+ "entry_date DATE," // 案件登録日付
			+ "entry_count INT(4)" // 案件登録数
			+ ", INDEX(entry_date));",
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_number (" // 試験（見積）番号管理テーブル
			+ "quote_date DATE," // 試験（見積）登録日付
			+ "quote_count INT(4)"	// 試験（見積）登録数
			+", INDEX(quote_date));",
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_detail_number (" // 試験（見積）明細番号管理テーブル
			+ "quote_no VARCHAR(9)," // 試験（見積）番号（yymmdd###)
			+ "quote_detail_count INT(4)," // 試験（見積）明細登録数
			+ "entry_no VARCHAR(10)" 
			+ ", INDEX(quote_no));",
		"CREATE TABLE IF NOT EXISTS drc_sch.workitem_schedule (" // ガントチャート作業項目テーブル
			+ "work_item_id INT(11) NOT NULL AUTO_INCREMENT,"		// 作業項目ID
			+ "entry_no VARCHAR(10),"		// 案件番号（yymmdd-###)
			+ "work_title VARCHAR(128),"	// 作業項目名称
			+ "start_date DATE,"			// 作業開始予定日
			+ "end_date DATE,"				// 作業終了予定日
			+ "start_date_result DATE,"		// 作業開始日
 			+ "end_date_result DATE,"		// 作業終了日
			+ "priority_item_id INT(11),"	// 先行（優先）項目
			+ "subsequent_item_id INT(11)," // 後続項目
			+ "progress INT(3),"			// 作業進捗度
			+ "delete_check VARCHAR(1),"	// 削除フラグ
			+ "created TIMESTAMP not null default 0," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP not null on update current_timestamp default current_timestamp," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", INDEX(work_item_id, entry_no));",
		"CREATE TABLE IF NOT EXISTS drc_sch.test_schedule ("	// 試験スケジュールデータ
			+ "schedule_id INT(11) NOT NULL AUTO_INCREMENT," // スケジュールID
			+ "entry_no VARCHAR(10) NOT NULL,"	// 案件No
			+ "quote_detail_no VARCHAR(7),"		// 明細番号
			+ "start_date DATE,"	// 開始日付
			+ "end_date DATE,"		// 開始日付
			+ "start_time TIME,"	// 開始時間
			+ "end_time TIME,"		// 開始時間
			+ "am_pm VARCHAR(2),"	// 午前午後
			+ "patch_no INT(2),"	// 検体番号(1～30)
			+ "delete_check VARCHAR(1)," // 削除フラグ
			+ "created TIMESTAMP not null default 0," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP not null on update current_timestamp default current_timestamp," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", INDEX(schedule_id,entry_no, start_date));",
		
		"CREATE TABLE IF NOT EXISTS drc_sch.sales_info (sales_id INT(11) NOT NULL AUTO_INCREMENT,sales_no VARCHAR(12) NOT NULL,name VARCHAR(128) NOT NULL,customer_code VARCHAR(128),estimate INT(5),regist_date DATE,order_date DATE,money_receive_date DATE,money_received_date DATE,sales_user_id VARCHAR(128),created TIMESTAMP,updated TIMESTAMP,INDEX(sales_id,sales_no));",
		"CREATE TABLE IF NOT EXISTS drc_sch.tests (test_id BIGINT(11) NOT NULL AUTO_INCREMENT,sales_no VARCHAR(12) NOT NULL,test_name VARCHAR(128) NOT NULL,description VARCHAR(256),test_type INT(4) NOT NULL,test_person_id VARCHAR(128),start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME,subject_vol INT(5) DEFAULT 0,set_subject_vol INT(5) DEFAULT 0,complete_vol INT(5) DEFAULT 0,created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128) ,INDEX(test_id)); ",
		"CREATE TABLE IF NOT EXISTS drc_sch.estimates (sales_no VARCHAR(12) NOT NULL,test_name VARCHAR(128) NOT NULL,estimate_no VARCHAR(12), order_flag INT(1),description VARCHAR(256),created TIMESTAMP,updated TIMESTAMP,INDEX(sales_no,test_name));",
		"CREATE TABLE IF NOT EXISTS drc_sch.reports (sales_no VARCHAR(12) NOT NULL,test_name VARCHAR(128) NOT NULL,report_no VARCHAR(12),description VARCHAR(256),created TIMESTAMP,updated TIMESTAMP,INDEX(sales_no,test_name));",
		"CREATE TABLE IF NOT EXISTS drc_sch.subject_schedule (id BIGINT(11) NOT NULL AUTO_INCREMENT,subject_no INT(5) NOT NULL,patch_no INT(3),test_id BIGINT(11) NOT NULL,start_date DATETIME,end_date DATETIME,start_date_r DATETIME,end_date_r DATETIME,created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128), INDEX(id,subject_no)); ",
		"CREATE TABLE IF NOT EXISTS drc_sch.subjects (subject_no INT(5) NOT NULL AUTO_INCREMENT,name VARCHAR(128) NOT NULL,name_kana VARCHAR(128) ,age INT(3),sex INT(1),affiliation VARCHAR(128),created TIMESTAMP,updated TIMESTAMP,creator VARCHAR(128),update_id VARCHAR(128),INDEX(subject_no)); "
	];
	pool.getConnection(function (err, connection) {
		for (var i = 0; i < sql.length; i++) {
			connection.query(sql[i], [], function (err, rows) {
				if (err) throw err;
				console.log(rows);
			});
		}
		//コネクション解放
		connection.release();
		res.render('tables', { title: 'DRC 試験スケジュール管理' });
	});
	
    //res.send("respond with a resource");
};
/**
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
	} else if (queryno === '3') {
		// 案件登録
		exports.postEntry(req,res);
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

exports.postEntry = function(req, res){
	console.log("test");
};
 * */
