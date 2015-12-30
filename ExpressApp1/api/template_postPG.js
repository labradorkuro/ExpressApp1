//
// ガントチャートテンプレートのPOSTを処理する
//
var tools = require('../tools/tool');
// テンプレート作業項目データのPOST
exports.template_post = function (req, res) {
	var template = template_check(req.body);
	if (template.delete_check === '1') {
		// 削除
		delete_template(template, req, res);
		return;
	}
	if (template.template_id === -1) {
		// 追加
		insert_template(template, req, res);
	} else {
		// 更新
		update_template(template, req, res);
	}
};
exports.template_update = function(req, res) {
	var template = req.body;
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET ' 
			+ "template_name = $1,"	// テンプレート名
			+ "updated_id = $2"		// 更新者ID
			+ " WHERE template_cd = $3";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.template_name,
			updated_id, // 更新者ID
			template.template_cd
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};

// テンプレートの削除（削除フラグのセット）
// 同一CDのすべての項目の削除フラグを立てる
exports.template_delete  = function(req, res) {
	var template = req.body;
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET ' 
			+ "delete_check = $1," // 削除フラグ
			+ "updated_id = $2" // 更新者ID
			+ " WHERE template_cd = $3";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			1,
			updated_id, // 更新者ID
			template.template_cd
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
	
};

// 作業項目データの追加
var insert_template = function (template, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.workitem_template (' 
			+ "template_cd,"	// テンプレートCD
			+ "template_name,"	// テンプレート名称
			+ "work_title,"		// 作業項目名称
			+ "start_date,"		// 作業開始予定日
			+ "end_date,"		// 作業終了予定日
			+ "priority_item_id," // 先行（優先）項目
			+ "item_type,"		// 種別
			+ "delete_check,"	// 削除フラグ
			+ "created,"		// 作成日
			+ "created_id,"		// 作成者ID
			+ "updated,"		// 更新日
			+ "updated_id"		// 更新者ID
			+ ") values (" 
			+ "$1," // テンプレートCD
			+ "$2,"	// テンプレート名称
			+ "$3," // 作業項目名称
			+ "$4," // 作業開始予定日
			+ "$5," // 作業終了予定日
			+ "$6," // 先行項目
			+ "$7," // 種別
			+ "$8," // 削除フラグ
			+ "$9," // 作成日
			+ "$10," // 作成者ID
			+ "$11," // 更新日
			+ "$12" // 更新者ID
			+ ")";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.template_cd,
			template.template_name,
			template.work_title,
			template.start_date,
			template.end_date,
			template.priority_item_id,
			template.item_type,
			"0", // 削除フラグ
			created, // 作成日
			created_id, // 作成者ID
			updated, // 更新日
			updated_id // 更新者ID
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
// 作業項目データの更新
var update_template = function (template, req, res) {
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET ' 
			+ "template_cd = $1,"	// テンプレートCD
			+ "template_name = $2," // テンプレート名称
			+ "work_title = $3,"	// 作業項目名称
			+ "start_date = $4,"	// 作業開始予定日
			+ "end_date = $5,"		// 作業終了予定日
			+ "priority_item_id = $6," // 先行（優先）項目
			+ "item_type = $7,"		// 種別
			+ "updated_id = $8"		// 更新者ID
			+ " WHERE template_id = $9";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.template_cd,
			template.template_name,
			template.work_title,
			template.start_date,
			template.end_date,
			template.priority_item_id,
			template.item_type,
			updated_id, // 更新者ID
			template.template_id
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
// 作業項目データの削除
var delete_template = function (template, req, res) {
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET ' 
			+ "delete_check = $1," // 削除フラグ
			+ "updated_id = $2" // 更新者ID
			+ " WHERE template_id = $3";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.delete_check,
			updated_id, // 更新者ID
			template.work_item_id
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};

// 日付項目のチェックと値変換
var dateCheck = function (dt) {
	var rtn = null;
	if ((dt === '') || (dt === null)) {
		rtn = null;
	} else {
		rtn = dt;
	}
	return rtn;
};

var template_check = function (template) {
	// 日付項目チェック
//	var d = new Date(2000, 0,1 ,0,0,0,0);
//	var sd = template_addDate(d, Number(template.start_date));
//	var ed = template_addDate(d, Number(template.end_date));
	template.start_date = dateCheck(template.start_date_date);
	template.end_date = dateCheck(template.end_date_date);
	//template.start_date = sd;
	//template.end_date = ed;
	// 数値変換
	template.template_id = Number(template.template_id);
	template.priority_item_id = Number(template.priority_item_id);
	template.delete_check = Number(template.delete_check);
	return template;
};
var template_addDate = function (start_date, count) {
	var t = start_date.getTime();
	t = t + (count * 86400000);
	var d = new Date();
	d.setTime(t);
	return d;
};
