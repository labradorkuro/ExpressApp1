//
// 請求情報データの取得
//
exports.billing_get = function (req, res) {
	if ((req.query.billing_no != undefined) && (req.query.billing_no != '')) {
		billing_get_detail(req, res);
	} else {
		billing_get_list(req, res);
	}
};

// 請求情報集計用リストの取得
exports.billing_summary_list_get = function (req, res) {
	billing_get_summary_list(req, res);
};

var getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "billing_no";
	pg_param.sord = "asc";
	pg_param.limit = 10;
	pg_param.offset = 0;
	pg_param.page = 1;
	if (req.query.rows) pg_param.limit = req.query.rows;
	if (req.query.page) pg_param.page = req.query.page;
	if (req.query.sidx) pg_param.sidx = req.query.sidx;
	if (req.query.sord) pg_param.sord = req.query.sord;
	pg_param.offset = (pg_param.page - 1) * pg_param.limit;
	return pg_param;
};
// 請求情報データリストの取得
var billing_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var del_chk = 0;
	if (req.query.delete_check == 1) del_chk = 1;
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.billing_info WHERE entry_no = $1 AND delete_check = $2';
	var sql = 'SELECT '
		+ 'entry_no,'
		+ 'billing_no,'
		+ 'billing_number,'
		+ "to_char(pay_planning_date, 'YYYY/MM/DD') AS pay_planning_date,"
		+ "to_char(nyukin_yotei_date, 'YYYY/MM/DD') AS nyukin_yotei_date,"
		+ "to_char(pay_complete_date, 'YYYY/MM/DD') AS pay_complete_date,"
		+ 'pay_amount,'
		+ 'pay_amount_tax,'
		+ 'pay_amount_total,'
		+ 'pay_complete,'
		+ 'pay_result,'
		+ 'billing_info.client_cd,'
		+ 'client_name,'
		//+ 'client_list.name_1 AS client_name,'
		+ 'client_division_cd,'
		+ 'client_division_name,'
		//+ 'client_division_list.name AS client_division_name,'
		+ 'client_division_list.address_1  AS client_address_1,'
		+ 'client_division_list.address_2  AS client_address_2,'
		+ 'client_division_list.tel_no  AS client_tel_no,'
		+ 'client_division_list.fax_no  AS client_fax_no,'
		+ 'client_person_id,'
		+ 'client_person_name,'
		//+ 'client_person_list.name AS client_person_name,'
		+ 'client_info,'
		+ 'billing_info.memo,'
		+ 'agent_cd,'
		+ 'agent_name,'
		+ 'agent_division_cd,'
		+ 'agent_division_name,'
		+ 'agent_division_list.address_1  AS agent_address_1,'
		+ 'agent_division_list.address_2  AS agent_address_2,'
		+ 'agent_division_list.tel_no  AS agent_tel_no,'
		+ 'agent_division_list.fax_no  AS agent_fax_no,'
		+ 'agent_person_id,'
		+ 'agent_person_name,'
		+ 'agent_info,'
		+ 'billing_info.agent_memo,'
		+ 'billing_info.memo,'
		+ 'etc_cd,'
		+ 'etc_name,'
		+ 'etc_division_cd,'
		+ 'etc_division_name,'
		+ 'etc_person_id,'
		+ 'etc_person_name,'
		+ 'etc_info,'
		+ 'billing_info.etc_memo,'
		+ 'billing_kind,'
		+ 'billing_info.delete_check,'
		+ "to_char(billing_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'billing_info.created_id,'
		+ "to_char(billing_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'billing_info.updated_id'
		+ ' FROM drc_sch.billing_info'
		//+ ' LEFT JOIN drc_sch.client_list ON (billing_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON (billing_info.client_cd = client_division_list.client_cd AND billing_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON (billing_info.client_cd = client_person_list.client_cd AND billing_info.client_division_cd = client_person_list.division_cd AND billing_info.client_person_id = client_person_list.person_id)'
		+ ' LEFT JOIN drc_sch.client_division_list AS agent_division_list ON (billing_info.agent_cd = agent_division_list.client_cd AND billing_info.agent_division_cd = agent_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list AS agent_person_list ON (billing_info.agent_cd = agent_person_list.client_cd AND billing_info.agent_division_cd = agent_person_list.division_cd AND billing_info.agent_person_id = agent_person_list.person_id)'
		+ ' WHERE billing_info.entry_no = $1 AND billing_info.delete_check = $2 ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return billing_get_list_for_grid(res, sql_count, sql, [req.query.entry_no,del_chk], pg_params);
};
// 請求情報集計用リストの取得
var billing_get_summary_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var del_chk = 0;
	if (req.query.delete_check == 1) del_chk = 1;
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.billing_info WHERE delete_check = $1';
	var sql = 'SELECT '
		+ 'billing_info.entry_no,'
		+ 'billing_no,'
		+ 'billing_number,'
		+ 'entry_info.entry_title,'
		+ 'test_large_class.item_name AS test_large_class_name,'				// 試験大分類名
		+ "to_char(entry_info.report_limit_date, 'YYYY/MM/DD') AS report_limit_date,"
		+ "entry_info.shikenjo,"
		+ "CASE WHEN pay_result = 0 THEN to_char(pay_planning_date, 'YYYY/MM/DD') ELSE '' END AS pay_planning_date,"
		+ "to_char(nyukin_yotei_date, 'YYYY/MM/DD') AS nyukin_yotei_date,"
		+ "to_char(pay_complete_date, 'YYYY/MM/DD') AS pay_complete_date,"
		+ "CASE WHEN pay_result >= 1 THEN to_char(pay_planning_date, 'YYYY/MM/DD') ELSE '' END AS seikyu_date,"
		+ 'pay_amount,'					// 請求金額
		+ 'pay_amount_tax,'				// 請求金額消費税
		+ 'pay_amount_total,'			// 請求金額税込
		+ 'pay_complete,'
		+ 'pay_result,'
		+ 'total_price AS entry_amount_price,'
		+ '(total_price * quote_info.consumption_tax) / 100 AS entry_amount_tax,'
		+ '(total_price + (total_price * quote_info.consumption_tax / 100)) AS entry_amount_total,'
		+ 'billing_info.client_cd,'
		+ 'client_name,'
		//+ 'client_list.name_1 AS client_name,'
		+ 'billing_info.client_division_cd,'
		+ 'billing_info.client_division_name,'
		//+ 'client_division_list.name AS client_division_name,'
		+ 'client_division_list.address_1  AS client_address_1,'
		+ 'client_division_list.address_2  AS client_address_2,'
		+ 'client_division_list.tel_no  AS client_tel_no,'
		+ 'client_division_list.fax_no  AS client_fax_no,'
		+ 'billing_info.client_person_id,'
		+ 'client_person_name,'
		//+ 'client_person_list.name AS client_person_name,'
		+ 'client_info,'
		+ 'billing_info.memo,'
		+ 'billing_info.agent_cd,'
		+ 'agent_name,'
		+ 'billing_info.agent_division_cd,'
		+ 'agent_division_name,'
		+ 'agent_division_list.address_1  AS agent_address_1,'
		+ 'agent_division_list.address_2  AS agent_address_2,'
		+ 'agent_division_list.tel_no  AS agent_tel_no,'
		+ 'agent_division_list.fax_no  AS agent_fax_no,'
		+ 'billing_info.agent_person_id,'
		+ 'agent_person_name,'
		+ 'agent_info,'
		+ 'billing_info.agent_memo,'
		+ 'billing_info.memo,'
		+ 'etc_cd,'
		+ 'etc_name,'
		+ 'etc_division_cd,'
		+ 'etc_division_name,'
		+ 'etc_person_id,'
		+ 'etc_person_name,'
		+ 'etc_info,'
		+ 'billing_info.etc_memo,'
		+ 'billing_kind,'
		+ 'billing_info.delete_check,'
		+ "to_char(billing_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'billing_info.created_id,'
		+ "to_char(billing_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'billing_info.updated_id'
		+ ' FROM drc_sch.billing_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (billing_info.entry_no = entry_info.entry_no AND entry_info.delete_check=0)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.entry_no = billing_info.entry_no AND quote_info.order_status = 2 AND quote_info.quote_delete_check=0)'
		// 合計金額を求めるサブクエリー
		+ ' LEFT JOIN (SELECT entry_no,quote_no,sum(price) AS total_price FROM drc_sch.quote_specific_info WHERE quote_specific_info.specific_delete_check = 0 GROUP BY entry_no,quote_no) AS subq ON (quote_info.entry_no = subq.entry_no AND quote_info.quote_no = subq.quote_no )'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd  AND test_large_class.delete_check=0)'
		+ ' LEFT JOIN drc_sch.client_division_list ON (billing_info.client_cd = client_division_list.client_cd AND billing_info.client_division_cd = client_division_list.division_cd AND client_division_list.delete_check=0)'
		+ ' LEFT JOIN drc_sch.client_person_list ON (billing_info.client_cd = client_person_list.client_cd AND billing_info.client_division_cd = client_person_list.division_cd AND billing_info.client_person_id = client_person_list.person_id AND client_person_list.delete_check=0)'
		+ ' LEFT JOIN drc_sch.client_division_list AS agent_division_list ON (billing_info.agent_cd = agent_division_list.client_cd AND billing_info.agent_division_cd = agent_division_list.division_cd AND agent_division_list.delete_check=0)'
		+ ' LEFT JOIN drc_sch.client_person_list AS agent_person_list ON (billing_info.agent_cd = agent_person_list.client_cd AND billing_info.agent_division_cd = agent_person_list.division_cd AND billing_info.agent_person_id = agent_person_list.person_id AND agent_person_list.delete_check=0)'
		+ ' WHERE billing_info.delete_check = $1 AND billing_info.entry_no <>\'\' ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return billing_get_list_for_grid(res, sql_count, sql, [del_chk], pg_params);
};

var billing_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
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
							var billing = [];
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
// 請求先データの取得
var billing_get_detail = function (req, res) {
	var sql = 'SELECT '
		+ 'entry_no,'
		+ 'billing_no,'
		+ 'billing_number,'
		+ "to_char(pay_planning_date, 'YYYY/MM/DD') AS pay_planning_date,"
		+ "to_char(nyukin_yotei_date, 'YYYY/MM/DD') AS nyukin_yotei_date,"
		+ "to_char(pay_complete_date, 'YYYY/MM/DD') AS pay_complete_date,"
		+ 'pay_amount,'
		+ 'pay_amount_tax,'
		+ 'pay_amount_total,'
		+ 'pay_complete,'
		+ 'pay_result,'
		+ 'billing_info.client_cd,'
		+ 'client_name,'
		//+ 'client_list.name_1 AS client_name,'
		+ 'client_division_cd,'
		+ 'client_division_name,'
		//+ 'client_division_list.name AS client_division_name,'
		+ 'client_division_list.address_1  AS client_address_1,'
		+ 'client_division_list.address_2  AS client_address_2,'
		+ 'client_division_list.tel_no  AS client_tel_no,'
		+ 'client_division_list.fax_no  AS client_fax_no,'
		+ 'client_person_id,'
		+ 'client_person_name,'
		//+ 'client_person_list.name AS client_person_name,'
		+ 'client_info,'
		+ 'billing_info.memo,'
		+ 'billing_info.delete_check,'
		+ "to_char(billing_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'billing_info.created_id,'
		+ "to_char(billing_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'billing_info.updated_id'
		+ ' FROM drc_sch.billing_info'
		//+ ' LEFT JOIN drc_sch.client_list ON (billing_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON (billing_info.client_cd = client_division_list.client_cd AND billing_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON (billing_info.client_cd = client_person_list.client_cd AND billing_info.client_division_cd = client_person_list.division_cd AND billing_info.client_person_id = client_person_list.person_id)'
		+ ' WHERE entry_no = $1 AND billing_no = $2'
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.params.entry_no,req.params.billing_no], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var billing = [];
				for (var i in results.rows) {
					billing = results.rows[i];
				}
				connection.end();
				res.send(billing);
			}
		});
	});
};

// 請求金額、入金金額合計の取得
exports.billing_get_total = function (req, res) {
	var sql = 'SELECT '
		+ 'SUM(pay_amount) AS amount_total_notax,'
		+ 'SUM(pay_amount_total) AS amount_total,'
		+ 'SUM(pay_complete) AS complete_total'
		+ ' FROM drc_sch.billing_info'
		+ ' WHERE entry_no = $1 AND delete_check = $2'
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.params.entry_no,0], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var billing = [];
				for (var i in results.rows) {
					billing = results.rows[i];
				}
				connection.end();
				res.send(billing);
			}
		});
	});
};

exports.get_billing_for_entry_grid_update = function(req, res) {
	var sql = 'SELECT '
		+ 'entry_info.entry_no,'
		+ 'subq.pay_complete,'
		+ 'subq2.pay_result,'
		+ 'subq3.pay_result_1'
		+ ' FROM drc_sch.entry_info '
		// 請求情報のサブクエリ 未入金ありを表示するため(入金確認済になっていないか、入金確認済でも入金額が少ないもの)
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_complete FROM drc_sch.billing_info WHERE (pay_result < 3 OR (pay_result = 3 AND (pay_amount > pay_complete))) AND billing_info.delete_check = 0 GROUP BY entry_no) as subq ON(subq.entry_no = entry_info.entry_no)'
		// 請求情報のサブクエリ 請求区分を表示するため
		+ ' LEFT JOIN (SELECT entry_no,MIN(pay_result) AS pay_result FROM drc_sch.billing_info WHERE billing_info.delete_check = 0 GROUP BY entry_no) as subq2 ON(subq2.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_result_1 FROM drc_sch.billing_info WHERE (pay_result = 1 AND billing_info.delete_check = 0) GROUP BY entry_no) as subq3 ON(subq3.entry_no = entry_info.entry_no)'
		+ ' WHERE entry_info.entry_no = $1 AND entry_info.delete_check = 0'
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		connection.query(sql, [req.params.entry_no], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var billing = [];
				for (var i in results.rows) {
					billing = results.rows[i];
				}
				connection.end();
				console.log(billing);
				res.send(billing);
			}
		});
	});
}