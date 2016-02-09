//
// ガントチャート用テンプレートデータの取得
//

var tools = require('../tools/tool');
// テンプレートデータのGET（template_id指定）
exports.template_get = function (req, res) {
	if (req.params.template_id >= 1) {
		// 個別取得
		template_get(req, res);
	}
};
// テンプレートデータのGET(テンプレート名指定、種別指定あり・なし)
exports.template_get_list = function (req, res) {
	// リスト取得
	if (! req.params.item_type) {
		// tamplate_nameに一致するすべてのリストを取得
		template_get_list_all(req, res);
	} else {
		// template_name、item_typeに一致するリストを取得
		template_get_list(req, res);
	}
};

// 登録されているテンプレートのリストを取得（item_type指定あり・なし）
exports.template_get_all = function (req, res) {
	var sql ="";
	//console.log("template_get_all:" + req.params.item_type);
	if (req.params.item_type) {
		// item_typeの指定あり
		sql = 'SELECT '
			+ 'template_id,'
			+ 'template_cd,'
			+ 'template_name,'
			+ 'test_type,'
			+ 'work_title,'
			+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,'
			+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,'
			+ 'priority_item_id,'
			+ 'item_type'
			+ ' FROM drc_sch.workitem_template WHERE delete_check = $1 AND item_type = $2 ORDER BY template_id';
		return template_get_list_for_gantt(res, sql, [req.query.delete_check,req.params.item_type]);
	} else {
		// item_typeの指定なし
		sql = 'SELECT '
			+ 'template_id,'
			+ 'template_cd,'
			+ 'template_name,'
			+ 'test_type,'
			+ 'work_title,'
			+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,'
			+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,'
			+ 'priority_item_id,'
			+ 'item_type'
			+ ' FROM drc_sch.workitem_template WHERE delete_check = $1 AND test_type = $2 ORDER BY template_id';
		return template_get_list_for_gantt(res, sql, [req.query.delete_check,req.query.test_type]);
	}
};

// テンプレート名とその名前で登録されている項目数を取得する
exports.template_name_list = function(req, res) {
//	var sql = 'SELECT template_name, count(work_title) AS item_count FROM drc_sch.workitem_template WHERE delete_check = 0 GROUP BY template_name';
	var sql = 'SELECT DISTINCT template_cd, template_name, test_type FROM drc_sch.workitem_template WHERE test_type = $1 AND delete_check = 0';
	return template_get_list_for_gantt(res, sql, [req.params.test_type]);

};


// テンプレートリストの取得
var template_get_list_all = function (req, res) {
	var sql = 'SELECT '
		+ 'template_id,'
		+ 'template_cd,'
		+ 'template_name,'
		+ 'test_type,'
		+ 'work_title,'
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,'
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,'
		+ 'priority_item_id,'
		+ 'item_type'
		+ ' FROM drc_sch.workitem_template WHERE template_cd = $1 and delete_check = $2 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.params.template_cd, req.query.delete_check]);
};

// テンプレートリストの取得
var template_get_list = function (req, res) {
	var sql = 'SELECT '
		+ 'template_id,'
		+ 'template_cd,'
		+ 'template_name,'
		+ 'test_type,'
		+ 'work_title,'
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,'
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,'
		+ 'priority_item_id,'
		+ 'item_type'
		+ ' FROM drc_sch.workitem_template WHERE template_cd = $1 and item_type = $2 and delete_check = $3 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.params.template_cd, req.params.item_type,req.query.delete_check]);
};
// テンプレートリストの取得
var template_get = function (req, res) {
	var sql = 'SELECT '
		+ 'template_id,'
		+ 'template_cd,'
		+ 'template_name,'
		+ 'test_type,'
		+ 'work_title,'
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,'
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,'
		+ 'priority_item_id,'
		+ 'item_type'
		+ ' FROM drc_sch.workitem_template WHERE template_id = $1 and delete_check = $2 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.params.template_id, req.query.delete_check]);
};



// ガントチャート用テンプレートデータリスト取得
var template_get_list_for_gantt = function (res, sql, params) {
	var result = [];
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function (results, err) {
			for (var i in rows) {
				result.push(rows[i]);
			}
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
