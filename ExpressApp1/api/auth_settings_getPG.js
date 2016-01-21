// 権限設定データの取得
exports.auth_settings_get = function (req, res) {
	if ((req.params.auth_no != undefined) && (req.params.auth_no != '')) {
		var auth_no = Number(req.params.auth_no);
		var sql = 'SELECT ' 
			+ 'id,' 
			+ 'code,' 
			+ 'auth_no,' 
			+ 'auth_value,' 
			+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
			+ 'created_id,' 
			+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
			+ 'updated_id' 
			+ ' FROM drc_sch.auth_settings WHERE auth_no = $1 ORDER BY code'; 
		// SQL実行
		pg.connect(connectionString, function (err, connection) {
			// データを取得するためのクエリーを実行する
			connection.query(sql, [auth_no], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					var config = [];
					for (var i in results.rows) {
						config = results.rows[i];
					}
					connection.end();
					res.send(config);
				}
			});
		});
	}
};
exports.auth_settings_get_all = function (req, res) {
	//var result = [];
	var sql = 'SELECT ' 
		+ 'id,' 
		+ 'code,' 
		+ 'auth_no,' 
		+ 'auth_value,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.auth_settings ORDER BY code, auth_no'; 
	var result = [];
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, []);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
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
