// 社員データの取得
exports.division_get = function (req, res) {
	if ((req.params.division != undefined) && (req.params.division != '')) {
		division_get_detail(req, res);
	} else {
		division_get_list(req, res);
	}
};
var getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "division";
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
// 社員データリストの取得
var division_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.division_info WHERE delete_check = $1';
	var sql = 'SELECT ' 
		+ 'division,' 
		+ 'division_name,' 
		+ 'delete_check,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.division_info WHERE delete_check = $1 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return division_get_list_for_grid(res, sql_count, sql, [0], pg_params.limit);
};
var division_get_list_for_grid = function (res, sql_count, sql, params, limit) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// 最初に件数を取得する		
		connection.query(sql_count, params, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.round(results.rows[0].cnt / limit) + 1;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var division = [];
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
// データの取得
var division_get_detail = function (req, res) {
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.division_info WHERE delete_check = $1';
	var sql = 'SELECT ' 
		+ 'division,' 
		+ 'division_name,' 
		+ 'delete_check,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.division_info WHERE division = $1';
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.params.division], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var division = [];
				for (var i in results.rows) {
					division = results.rows[i];
				}
				connection.end();
				res.send(division);
			}
		});
	});
};
