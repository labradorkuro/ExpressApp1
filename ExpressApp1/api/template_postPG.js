//
// ガントチャートテンプレートのPOSTを処理する
//
var tools = require('../tools/tool');
// テンプレート作業項目データのPOST
exports.template_post = function (req, res) {
	var template = template_check(req.body);
	console.log(template);
	if (template.delete_check === 1) {
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
	console.log(template);
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET '
			+ "template_name = $1,"	// テンプレート名
			+ "test_type = $2,"			// 試験大分類CD
			+ "updated_id = $3,"		// 更新者ID
			+ "updated = $4"
			+ " WHERE template_cd = $5";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.template_name,
			template.template_test_type,
			updated_id, // 更新者ID
			updated,
			template.template_cd
		]);
		query.on('end', function (result, err) {
			console.log(sql);
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
			connection.end();
			res.send(template);
		});
	});
};

// テンプレートの削除（削除フラグのセット）
// 同一CDのすべての項目の削除フラグを立てる
exports.template_delete  = function(req, res) {
	var template = req.body;
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET '
			+ "delete_check = $1," // 削除フラグ
			+ "updated_id = $2," // 更新者ID
			+ "updated = $3" // 更新者ID
			+ " WHERE template_cd = $4";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			1,
			updated_id, // 更新者ID
			updated,
			template.template_cd
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
			connection.end();
			res.send(template);
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
			+ "test_type,"			// 試験大分類CD
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
			+ "$3,"	// テンプレート名称
			+ "$4," // 作業項目名称
			+ "$5," // 作業開始予定日
			+ "$6," // 作業終了予定日
			+ "$7," // 先行項目
			+ "$8," // 種別
			+ "$9," // 削除フラグ
			+ "$10," // 作成日
			+ "$11," // 作成者ID
			+ "$12," // 更新日
			+ "$13" // 更新者ID
			+ ")";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.template_cd,
			template.template_name,
			template.template_test_type,
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
			connection.end();
			res.send(template);
		});
	});
};
// 作業項目データの更新
var update_template = function (template, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET '
			+ "template_cd = $1,"	// テンプレートCD
			+ "template_name = $2," // テンプレート名称
			+ "test_type = $3," 		// 試験大分類CD
			+ "work_title = $4,"	// 作業項目名称
			+ "start_date = $5,"	// 作業開始予定日
			+ "end_date = $6,"		// 作業終了予定日
			+ "priority_item_id = $7," // 先行（優先）項目
			+ "item_type = $8,"		// 種別
			+ "updated_id = $9,"		// 更新者ID
			+ "updated = $10"
			+ " WHERE template_id = $11";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.template_cd,
			template.template_name,
			template.template_test_type,
			template.work_title,
			template.start_date,
			template.end_date,
			template.priority_item_id,
			template.item_type,
			updated_id, // 更新者ID
			updated,
			template.template_id
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
			connection.end();
			res.send(template);
		});
	});
};
// 作業項目データの削除
var delete_template = function (template, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.workitem_template SET '
			+ "delete_check = $1," // 削除フラグ
			+ "updated_id = $2," // 更新者ID
			+ "updated = $3"
			+ " WHERE template_id = $4";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
			template.delete_check,
			updated_id, // 更新者ID
			updated,
			template.template_id
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(template);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
			connection.end();
			res.send(template);
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
