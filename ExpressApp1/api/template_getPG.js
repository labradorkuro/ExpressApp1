//
// ガントチャート用テンプレートデータの取得
//

var tools = require('../tools/tool');
// テンプレートデータのGET
exports.template_get = function (req, res) {
	if (req.params.template_id >= 1) {
		// 個別取得
		template_get(req, res);
	} else {
		// リスト取得
		if (req.params.item_type == 2) {
			template_get_list_all(req, res);
		} else {
			template_get_list(req, res);
		}
	}
};
exports.template_get_all = function (req, res) {
	var sql = 'SELECT ' 
		+ 'template_id,' 
		+ 'template_name,' 
		+ 'work_title,' 
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'priority_item_id,' 
		+ 'item_type' 
		+ ' FROM drc_sch.workitem_template WHERE delete_check = $1 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.query.delete_check]);
};

// テンプレートリストの取得
var template_get_list_all = function (req, res) {
	var sql = 'SELECT ' 
		+ 'template_id,' 
		+ 'template_name,' 
		+ 'work_title,' 
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'priority_item_id,' 
		+ 'item_type' 
		+ ' FROM drc_sch.workitem_template WHERE template_name = $1 and delete_check = $2 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.params.template_name, req.query.delete_check]);
};

// テンプレートリストの取得
var template_get_list = function (req, res) {
	var sql = 'SELECT ' 
		+ 'template_id,' 
		+ 'template_name,' 
		+ 'work_title,' 
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'priority_item_id,' 
		+ 'item_type' 
		+ ' FROM drc_sch.workitem_template WHERE template_name = $1 and item_type = $2 and delete_check = $3 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.params.template_name, req.params.item_type,req.query.delete_check]);
};
// テンプレートリストの取得
var template_get = function (req, res) {
	var sql = 'SELECT ' 
		+ 'template_id,' 
		+ 'template_name,' 
		+ 'work_title,' 
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'priority_item_id,' 
		+ 'item_type' 
		+ ' FROM drc_sch.workitem_template WHERE template_id = $1 and delete_check = $2 ORDER BY template_id';
	return template_get_list_for_gantt(res, sql, [req.params.template_name, req.query.delete_check]);
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
