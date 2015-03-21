// 試験分類データの取得
exports.test_item_get = function (req, res) {
	if (req.params.class == "large") {
		// 試験大分類の取得
		if ((req.params.item_cd != undefined) && (req.params.item_cd != '')) {
			test_item_large_get_detail(req, res);
		} else {
			test_item_large_get_list(req, res);
		}
	} else if (req.params.class == "middle") {
		// 試験中分類の取得
		if ((req.params.item_cd != undefined) && (req.params.item_cd != '')) {
			test_item_middle_get_detail(req, res);
		} else {
			test_item_middle_get_list(req, res);
		}
	}
};
var getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "item_type,item_cd";
	pg_param.sord = "asc";
	pg_param.limit = 10;
	pg_param.offset = 0;
	pg_param.page = 1;
	if (req.query.rows) pg_param.limit = req.query.rows;
	if (req.query.page) pg_param.page = req.query.page;
	if (req.query.sidx) pg_param.sidx = req.query.sidx;
	if (req.query.sodr) pg_param.sord = req.query.sord;
	pg_param.offset = (pg_param.page - 1) * pg_param.limit;
	return pg_param;
};
// 大分類リストの取得
var test_item_large_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var del_chk = 0;
	if (req.query.delete_check == 1) del_chk = 1;
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.test_large_class WHERE delete_check = $1';
	var sql = 'SELECT ' 
		+ 'item_cd,' 
		+ 'item_name,' 
		+ 'memo,' 
		+ 'test_large_class.delete_check,' 
		+ "to_char(test_large_class.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'test_large_class.created_id,' 
		+ "to_char(test_large_class.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'test_large_class.updated_id' 
		+ ' FROM drc_sch.test_large_class WHERE test_large_class.delete_check = $1 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return test_item_get_list_for_grid(res, sql_count, sql, [del_chk], pg_params);
};
// 中分類リストの取得
var test_item_middle_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var del_chk = 0;
	if (req.query.delete_check == 1) del_chk = 1;
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.test_middle_class WHERE delete_check = $1 AND large_item_cd = $2';
	var sql = 'SELECT ' 
		+ 'item_cd,' 
		+ 'item_name,' 
		+ 'memo,' 
		+ 'test_middle_class.delete_check,' 
		+ "to_char(test_middle_class.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'test_middle_class.created_id,' 
		+ "to_char(test_middle_class.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'test_middle_class.updated_id' 
		+ ' FROM drc_sch.test_middle_class WHERE test_middle_class.delete_check = $1 AND large_item_cd = $2 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return test_item_get_list_for_grid(res, sql_count, sql, [del_chk, req.query.large_item_cd], pg_params);
};
var test_item_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// 最初に件数を取得する		
		connection.query(sql_count, params, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
				result.page = pg_params.page;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var test_item = [];
							row.id = (i + 1);
							row.cell = results.rows[i];							
							result.rows.push(row);
						}
						connection.end();
						res.send(result);
					}
				});
			}
		});
	});
};

// 大分類の取得
var test_item_large_get_detail = function (req, res) {
	var sql = 'SELECT ' 
		+ 'item_cd,' 
		+ 'item_name,' 
		+ 'memo,' 
		+ 'delete_check,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.test_large_class WHERE item_cd = $1'; 
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.query.item_cd], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var test_item = [];
				for (var i in results.rows) {
					test_item = results.rows[i];
				}
				connection.end();
				res.send(test_item);
			}
		});
	});
};

// 中分類の取得
var test_item_middle_get_detail = function (req, res) {
	var sql = 'SELECT ' 
		+ 'item_cd,' 
		+ 'item_name,' 
		+ 'memo,' 
		+ 'delete_check,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.test_middle_class WHERE item_cd = $1 AND large_item_cd = $2'; 
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.query.item_cd, req.query.large_item_cd], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var test_item = [];
				for (var i in results.rows) {
					test_item = results.rows[i];
				}
				connection.end();
				res.send(test_item);
			}
		});
	});
};
