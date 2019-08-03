//
// 見積り明細テンプレート処理
//
var tools = require('../tools/tool');

// 見積明細テンプレートの取得
exports.quote_template_get = function (req, res) {
	var pg_params = tools.getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.quote_specific_template WHERE delete_check = $1';
    var sql = 'SELECT '
        + 'template_id,'
		+ 'quote_specific_template.test_large_class_cd,'
		+ 'quote_specific_template.test_middle_class_cd,'
		+ 'quote_specific_template.test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'quote_specific_template.memo'
		+ ' FROM drc_sch.quote_specific_template'
//		+ ' LEFT JOIN drc_sch.test_middle_class ON(quote_specific_template.test_middle_class_cd = test_middle_class.item_cd AND quote_specific_template.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' WHERE quote_specific_template.delete_check = $1 ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	var dc = Number(req.query.delete_check);
	var params = [dc];
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		// 最初に件数を取得する
		connection.query(sql_count, params, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
				result.page = pg_params.page;
				result.records = results.rows[0].cnt;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
//						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var quote = [];
							row.id = (i + 1);
							row.cell = results.rows[i];
							result.rows.push(row);
						}
						connection.end();
						res.send(result);
					}
				});
			};
		});
	});
};

