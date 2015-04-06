// 社員データの取得
exports.user_get = function (req, res) {
	if ((req.params.uid != undefined) && (req.params.uid != '')) {
		user_get_detail(req, res);
	} else {
		user_get_list(req, res);
	}
};
var getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "uid";
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
var user_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var del_chk = 0;
	if (req.query.delete_check == 1) del_chk = 1;
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.user_list WHERE delete_check = $1';
	var sql = 'SELECT ' 
		+ 'uid,' 
		+ 'name,' 
		+ 'u_no,' 
		+ "to_char(start_date, 'YYYY/MM/DD') AS start_date," 
		+ 'base_cd,' 
		+ 'user_list.division,' 
		+ 'division_name,' 
		+ 'telno,' 
		+ 'title,' 
		+ 'auth_no,'
		+ 'user_list.delete_check,' 
		+ "to_char(user_list.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'user_list.created_id,' 
		+ "to_char(user_list.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'user_list.updated_id' 
		+ ' FROM drc_sch.user_list LEFT JOIN drc_sch.division_info ON (user_list.division = division_info.division) WHERE user_list.delete_check = $1 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return user_get_list_for_grid(res, sql_count, sql, [del_chk], pg_params);
};
var user_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
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
							var user = [];
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
// 社員データの取得
var user_get_detail = function (req, res) {
	var sql = 'SELECT ' 
		+ 'uid,' 
		+ 'name,' 
		+ 'u_no,' 
		+ "to_char(start_date, 'YYYY/MM/DD') AS start_date," 
		+ 'base_cd,' 
		+ 'division,' 
		+ 'telno,' 
		+ 'title,' 
		+ 'auth_no,' 
		+ 'delete_check,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.user_list WHERE uid = $1'; 
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.params.uid], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var user = [];
				for (var i in results.rows) {
					user = results.rows[i];
				}
				connection.end();
				res.send(user);
			}
		});
	});
};
