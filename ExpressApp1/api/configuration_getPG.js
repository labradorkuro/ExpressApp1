// 動作設定データの取得
exports.configuration_get = function (req, res) {
	if ((req.params.id != undefined) && (req.params.id != '')) {
		var sql = 'SELECT ' 
			+ 'id,' 
			+ 'drc_name,' 
			+ 'drc_zipcode,' 
			+ 'drc_address1,' 
			+ 'drc_address2,' 
			+ 'drc_telno,' 
			+ 'drc_faxno,' 
			+ 'consumption_tax,' 
			+ 'quote_form_memo_define_1,' 
			+ 'quote_form_memo_define_2,' 
			+ 'quote_form_memo_define_3,' 
			+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
			+ 'created_id,' 
			+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
			+ 'updated_id' 
			+ ' FROM drc_sch.configuration WHERE id = $1'; 
		// SQL実行
		pg.connect(connectionString, function (err, connection) {
			// データを取得するためのクエリーを実行する
			connection.query(sql, [req.params.id], function (err, results) {
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
