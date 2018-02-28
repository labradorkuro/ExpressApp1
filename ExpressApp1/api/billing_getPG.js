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
		+ ' LEFT JOIN drc_sch.client_division_list AS agent_division_list ON (billing_info.agent_cd = client_division_list.client_cd AND billing_info.agent_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list AS agent_person_list ON (billing_info.agent_cd = client_person_list.client_cd AND billing_info.agent_division_cd = client_person_list.division_cd AND billing_info.agent_person_id = client_person_list.person_id)'
		+ ' WHERE billing_info.entry_no = $1 AND billing_info.delete_check = $2 ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return billing_get_list_for_grid(res, sql_count, sql, [req.query.entry_no,del_chk], pg_params);
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
