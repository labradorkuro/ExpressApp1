//
// ガントチャートテンプレートのPOSTを処理する
//
var tools = require('../tools/tool');
// 作業項目データのPOST
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

// 作業項目データの追加
var insert_template = function (template, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.workitem_template (' 
			+ "template_name," // テンプレート名称
			+ "work_title," // 作業項目名称
			+ "start_date," // 作業開始予定日
			+ "end_date," // 作業終了予定日
			+ "priority_item_id," // 先行（優先）項目
			+ "item_type," // 種別
			+ "delete_check," // 削除フラグ
			+ "created," // 作成日
			+ "created_id," // 作成者ID
			+ "updated," // 更新日
			+ "updated_id" // 更新者ID
			+ ") values (" 
			+ "$1," // テンプレート名称
			+ "$2," // 作業項目名称
			+ "$3," // 作業開始予定日
			+ "$4," // 作業終了予定日
			+ "$5," // 先行項目
			+ "$6," // 種別
			+ "$7," // 削除フラグ
			+ "$8," // 作成日
			+ "$9," // 作成者ID
			+ "$10," // 更新日
			+ "$11" // 更新者ID
			+ ")";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
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
			+ "template_name = $1," // テンプレート名称
			+ "work_title = $2," // 作業項目名称
			+ "start_date = $3," // 作業開始予定日
			+ "end_date = $4," // 作業終了予定日
			+ "priority_item_id = $5," // 先行（優先）項目
			+ "item_type = $6," // 種別
			+ "updated_id = $7" // 更新者ID
			+ " WHERE template_id = $8";
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [
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
	template.start_date = dateCheck(template.start_date);
	template.end_date = dateCheck(template.end_date);
	// 数値変換
	template.template_id = Number(template.template_id);
	template.priority_item_id = Number(template.priority_item_id);
	return template;
};

