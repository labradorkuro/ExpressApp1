﻿//
// 案件リストからのGETを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');
/*
var connection = mysql.createConnection({
	host     : 'localhost',
	port     : '3306',
	user     : 'drc_root',
	password : 'drc_r00t@',
	database : 'drc_sch'
});
*/
// 案件基本データのGET
exports.entry_get = function (req, res) {
//	if ((req.params.start != undefined) && (req.params.start != '')) {
//		if ((req.params.end != undefined) && (req.params.end != '')) {
//			entry_get_list_term(req, res);
//		}
//	}	
	if ((req.params.no != undefined) && (req.params.no != '')) {
		entry_get_detail(req, res);
	} else {
		entry_get_list(req, res);
	}
};
var getPagingParams = function (req) {
	var pg_param = {};	
	pg_param.sidx = "entry_no";
	pg_param.sord = "desc";
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
// 案件リストの取得
var entry_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.entry_info WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5 OR entry_status = $6) AND delete_check = $1';
	var sql = 'SELECT ' 
		+ 'entry_info.entry_no,' 
		+ 'entry_title,' 
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date," 
		+ "to_char(report_limit_date, 'YYYY/MM/DD') AS report_limit_date," 
		+ "to_char(report_submit_date, 'YYYY/MM/DD') AS report_submit_date," 
		+ 'subq.pay_complete,'
		+ 'subq2.pay_result,'
		+ 'subq3.pay_result_1,'
		+ 'entry_status,' 
		+ 'sales_person_id,' 
		+ 'quote_no,' 
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date," 
		+ "entry_info.client_cd," 
		+ "client_list.name_1 AS client_name_1," 
		+ "client_list.name_2 AS client_name_2," 
		+ "client_list.address_1 AS client_address_1," 
		+ "client_list.address_2 AS client_address_2," 
		+ "client_division_list.address_1 AS client_division_address_1," 
		+ "client_division_list.address_2 AS client_division_address_2," 
		+ "client_list.tel_no AS client_tel_no," 
		+ "client_list.fax_no AS client_fax_no," 
		+ "client_division_list.tel_no AS client_division_tel_no," 
		+ "client_division_list.fax_no AS client_division_fax_no," 
		+ "client_division_list.division_cd AS client_division_cd," 
		+ "client_division_list.name AS client_division_name," 
		+ "client_person_list.person_id AS client_person_id," 
		+ "client_person_list.name AS client_person_name," 
		+ "client_person_list.compellation AS client_person_compellation," 
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date," 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'entry_info.test_large_class_cd,' 
		+ 'test_large_class.item_name AS test_large_class_name,' 
		+ 'entry_info.test_middle_class_cd,' 
		+ 'test_middle_class.item_name AS test_middle_class_name,' 
		+ 'test_person_id,'
		+ 'consumption_tax,'
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'entry_info.created_id,' 
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'entry_info.updated_id' 
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
		// 請求情報のサブクエリ 未入金ありを表示するため(入金確認済になっていないか、入金確認済でも入金額が少ないもの)
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_complete FROM drc_sch.billing_info WHERE (pay_result < 3 OR (pay_result = 3 AND (pay_amount > pay_complete))) AND billing_info.delete_check = 0 GROUP BY entry_no) as subq ON(subq.entry_no = entry_info.entry_no)'
		// 請求情報のサブクエリ 請求区分を表示するため
		+ ' LEFT JOIN (SELECT entry_no,MIN(pay_result) AS pay_result FROM drc_sch.billing_info WHERE billing_info.delete_check = 0 GROUP BY entry_no) as subq2 ON(subq2.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_result_1 FROM drc_sch.billing_info WHERE (pay_result = 1 AND billing_info.delete_check = 0) GROUP BY entry_no) as subq3 ON(subq3.entry_no = entry_info.entry_no)'
		+ ' WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5 OR entry_status = $6) AND entry_info.delete_check = $1  ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return entry_get_list_for_grid(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
};

// 案件リストの取得（ガントチャート用）
exports.entry_get_list_gantt = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_info.entry_no,' 
		+ 'client_list.name_1 AS client_name_1,'
		+ 'client_division_list.name AS client_division_name,'
		+ 'entry_title,' 
		+ 'to_char(inquiry_date, \'YYYY/MM/DD\') AS inquiry_date,'
		+ 'entry_status,' 
		+ 'sales_person_id,' 
		+ 'quote_info.quote_no,' 
		+ "to_char(quote_info.quote_date,'YYYY/MM/DD') AS quote_issue_date," 
		+ 'to_char(order_accepted_date,\'YYYY/MM/DD\') AS order_accepted_date,'
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'entry_info.test_large_class_cd,' 
		+ 'test_large_class.item_name AS test_large_class_name,' 
		+ 'entry_info.test_middle_class_cd,' 
		+ 'test_middle_class.item_name AS test_middle_class_name,' 
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'entry_info.created_id,' 
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'entry_info.updated_id' 
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
		+ ' LEFT JOIN drc_sch.quote_info ON(entry_info.entry_no = quote_info.entry_no AND quote_info.order_status = 2)'
		+ ' WHERE entry_info.delete_check = $1 ' 
		+ ' AND entry_info.test_large_class_cd = $2 AND entry_info.entry_status != \'04\' AND entry_info.entry_status != \'05\' AND quote_info.quote_delete_check = 0' 
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql, [0,req.params.test_type]);
};
// 案件リストの取得（スケジュール用）
exports.entry_get_list_cal = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_info.entry_no,' 
		+ 'client_list.name_1 AS client_name_1,'
		+ 'client_division_list.name AS client_division_name,'
		+ 'entry_title,' 
		+ 'to_char(inquiry_date, \'YYYY/MM/DD\') AS inquiry_date,'
		+ 'entry_status,' 
		+ 'sales_person_id,' 
///		+ 'quote_info.quote_no,' 
///		+ "to_char(quote_info.quote_date,'YYYY/MM/DD') AS quote_issue_date," 
		+ 'to_char(order_accepted_date,\'YYYY/MM/DD\') AS order_accepted_date,'
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'entry_info.test_large_class_cd,' 
		+ 'test_large_class.item_name AS test_large_class_name,' 
		+ 'entry_info.test_middle_class_cd,' 
		+ 'test_middle_class.item_name AS test_middle_class_name,' 
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'entry_info.created_id,' 
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'entry_info.updated_id' 
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
//		+ ' LEFT JOIN drc_sch.quote_info ON(entry_info.entry_no = quote_info.entry_no)'// AND quote_info.order_status = 2)'
		+ ' WHERE entry_info.delete_check = $1 ' 
//		+ ' AND entry_info.test_large_class_cd = $2 AND entry_info.entry_status != \'04\' AND entry_info.entry_status != \'05\' AND quote_info.quote_delete_check = 0' 
		+ ' AND entry_info.test_large_class_cd = $2 AND entry_info.entry_status != \'04\' AND entry_info.entry_status != \'05\' ' 
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql, [0,req.params.test_type]);
};

var entry_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
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
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
						result.records = results.rows.length;
						result.page = pg_params.page;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var entry = [];
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

// ガントチャート用案件データリスト取得
var entry_get_list_for_gantt = function (res, sql, params) {
	var result = { rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function(result,err) {
			result.records = rows.length;
			for (var i in rows) {
				var entry = rows[i];
				rows[i].quote = [];
			}
			result.rows = rows;
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};

// 案件データ（案件No）取得
var entry_get_detail = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,'															// 案件Ｎｏ
		+ 'quote_no,'															// 見積番号
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date,"				// 問合せ日
		+ 'entry_status,'														// 案件ステータス
		+ 'sales_person_id,'													// 営業担当者ID
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date," 
		+ 'agent_cd,'															// 代理店CD
		+ "agent_division_cd,"													// 代理店部署CD
		+ "agent_person_id,"													// 代理店担当者ID
		+ 'agent_list.name_1 AS agent_name,'									// 代理店名称
		+ "agent_division_list.address_1 AS agent_address_1,"					// 代理店部署住所１
		+ "agent_division_list.address_2 AS agent_address_2,"					// 代理店部署住所２
		+ "agent_division_list.name AS agent_division_name,"					// 代理店部署名
		+ "agent_division_list.memo AS agent_division_memo,"					// 代理店部署メモ
		+ "agent_person_list.name AS agent_person_name,"						// 代理店担当者名
		+ "agent_person_list.memo AS agent_person_memo,"						// 代理店担当者メモ
		+ "entry_info.client_cd,"												// 得意先CD
		+ "entry_info.client_division_cd,"										// 得意先部署CD
		+ "entry_info.client_person_id,"										// 得意先担当者ID
		+ "client_list.name_1 AS client_name_1,"								// 得意先名１
		+ "client_list.name_2 AS client_name_2,"								// 得意先名２
		+ "client_division_list.address_1 AS client_address_1,"					// 得意先部署住所１
		+ "client_division_list.address_2 AS client_address_2,"					// 得意先部署住所２
		+ "client_division_list.name AS client_division_name,"					// 得意先部署名
		+ "client_division_list.memo AS client_division_memo,"					// 得意先部署メモ
		+ "client_person_list.name AS client_person_name,"						// 得意先担当者名
		+ "client_person_list.memo AS client_person_memo,"						// 得意先担当者メモ
		+ 'entry_info.test_large_class_cd,'										// 試験大分類CD
		+ 'test_large_class.item_name AS test_large_class_name,'				// 試験大分類名
		+ 'entry_info.test_middle_class_cd,'									// 試験中分類CD
		+ 'test_middle_class.item_name AS test_middle_class_name,'				// 試験中分類名
		+ 'entry_title,'														// 試験タイトル
		+ 'order_type,'															// 受託区分
		+ 'outsourcing_cd,'														// 受託先CD
		+ 'out_list.name_1 AS outsourcing_name,'								// 受託先CD
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date,"	// 受注日
		+ 'order_accept_check,'													// 仮受注チェック
		+ 'acounting_period_no,'												// 会計期No
		+ 'test_person_id,'														// 試験担当者ID
		+ 'entry_amount_price,'													// 案件合計金額
		+ 'entry_amount_billing,'												// 案件請求合計金額
		+ 'entry_amount_deposit,'												// 案件入金合計金額
		+ 'to_char(report_limit_date,\'YYYY/MM/DD\') AS report_limit_date,'							// 報告書提出期限
		+ 'to_char(report_submit_date,\'YYYY/MM/DD\') AS report_submit_date,'						// 報告書提出日
		+ 'to_char(prompt_report_limit_date_1,\'YYYY/MM/DD\') AS prompt_report_limit_date_1,'		// 速報提出期限１
		+ 'to_char(prompt_report_submit_date_1,\'YYYY/MM/DD\') AS prompt_report_submit_date_1,'		// 速報提出日１
		+ 'to_char(prompt_report_limit_date_2,\'YYYY/MM/DD\') AS prompt_report_limit_date_2,'		// 速報提出期限２
		+ 'to_char(prompt_report_submit_date_2,\'YYYY/MM/DD\') AS prompt_report_submit_date_2,'		// 速報提出日２
		+ 'consumption_tax,'															// 
		+ 'entry_memo,'																	// メモ
		+ "entry_info.delete_check,"													// 削除フラグ
		+ "entry_info.delete_reason,"													// 削除理由
		+ "to_char(entry_info.input_check_date,'YYYY/MM/DD') AS input_check_date,"		// 入力日
		+ "entry_info.input_check,"														// 入力完了チェック
		+ "entry_info.input_operator_id,"												// 入力者ID
		+ "to_char(entry_info.confirm_check_date,'YYYY/MM/DD') AS confirm_check_date,"	// 確認日
		+ "entry_info.confirm_check,"													// 確認完了チェック
		+ "entry_info.confirm_operator_id,"												// 確認者ID
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"		// 作成日
		+ 'entry_info.created_id,'												// 作成者ID
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"		// 更新日
		+ 'entry_info.updated_id'												// 更新者ID
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_list AS out_list ON(entry_info.outsourcing_cd = out_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
		+ ' LEFT JOIN drc_sch.client_division_list AS agent_division_list ON(entry_info.agent_cd = agent_division_list.client_cd AND entry_info.agent_division_cd = agent_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list AS agent_person_list ON(entry_info.agent_cd = agent_person_list.client_cd AND entry_info.agent_division_cd = agent_person_list.division_cd AND entry_info.agent_person_id = agent_person_list.person_id)' 
		+ ' WHERE entry_no = $1 ';
	var entry = {};
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, [req.params.no]);
		var rows = [];
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function(result,err) {
			for (var i in rows) {
				entry = rows[i];
			}
			connection.end();
			res.send(entry);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};

// 見積情報データの取得
exports.quote_get = function (req, res) {
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_no != undefined) && (req.params.quote_no != '')) {
			// 案件番号と見積番号に該当する情報を取得する
			quote_get_detail(req, res);
		} else {
			// 案件に含まれる見積のリストを取得する
			quote_get_list(req, res);
		}
	}
};
// 見積明細データの取得(グリッド用）
exports.quote_specific_get_grid = function (req, res) {
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_no != undefined) && (req.params.quote_no != '')) {
			if ((req.params.quote_detail_no != undefined) && (req.params.quote_detail_no != '')) {
				// 見積の中の明細情報を取得する			
				quote_specific_get_detail(req, res);
			} else {
				// 見積の中の明細情報のリストを取得する
				quote_specific_get_list_grid(req, res);
			}
		}
	}
};
// 見積明細データの取得(フォーム用）
exports.quote_specific_get_list = function (req, res) {
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_no != undefined) && (req.params.quote_no != '')) {
			// 見積の中の明細情報のリストを取得する
			var sql = 'SELECT ' 
				+ 'entry_no,'
				+ 'quote_no,'			// 見積番号
				+ 'quote_detail_no,'
				+ 'quote_specific_info.test_middle_class_cd,'
				+ 'test_middle_class_name,'
				//+ 'test_middle_class.item_name AS test_middle_class_name,'
				+ 'unit,'
				+ 'unit_price,'
				+ 'quantity,'
				+ 'price,'
				+ 'summary_check,'
				+ 'specific_memo,'
				+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
				+ 'quote_specific_info.created_id,' 
				+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
				+ 'quote_specific_info.updated_id' 
				+ ' FROM drc_sch.quote_specific_info'
				//+ ' LEFT JOIN drc_sch.test_middle_class ON (quote_specific_info.test_middle_class_cd = test_middle_class.item_cd AND test_middle_class.large_item_cd = $3)'
				+ ' WHERE specific_delete_check = 0 AND (entry_no = $1 AND quote_no = $2) ORDER BY quote_detail_no' 
			// SQL実行
			//var params = [req.params.entry_no, req.params.quote_no, req.query.large_item_cd];
			var params = [req.params.entry_no, req.params.quote_no];
			var result = { page: 1, total: 20, records: 0, rows: [] };
			var rows = [];
			// SQL実行
			pg.connect(connectionString, function (err, connection) {
				if (err) {
					console.log(err);
				}
				var query = connection.query(sql, params);
				query.on('row', function (row) {
					rows.push(row);
				});
				query.on('end',function(results,err) {
					result.records = rows.length;
					result.rows = rows;
					connection.end();
					res.send(result);
				});
				query.on('error', function (error) {
					console.log(sql + ' ' + error);
				});
			});
		}
	}
};

// 報告書期限情報の取得（ガントチャート用）
exports.report_gantt = function (req, res) {
	var sql = 'SELECT '
		+ '\'報告書\' AS title,'
		+ 'to_char(report_limit_date,\'YYYY/MM/DD\') AS report_limit_date,'							// 報告書提出期限
		+ 'to_char(report_submit_date,\'YYYY/MM/DD\') AS report_submit_date,'						// 報告書提出日
		+ 'to_char(prompt_report_limit_date_1,\'YYYY/MM/DD\') AS prompt_report_limit_date_1,'		// 速報提出期限１
		+ 'to_char(prompt_report_submit_date_1,\'YYYY/MM/DD\') AS prompt_report_submit_date_1,'		// 速報提出日１
		+ 'to_char(prompt_report_limit_date_2,\'YYYY/MM/DD\') AS prompt_report_limit_date_2,'		// 速報提出期限２
		+ 'to_char(prompt_report_submit_date_2,\'YYYY/MM/DD\') AS prompt_report_submit_date_2'		// 速報提出日２
		+ ' FROM drc_sch.entry_info'
		+ ' WHERE entry_no = $1';
	// SQL実行
	var result = [];
	var rows = [];
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, [req.params.entry_no]);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function (results, err) {
			if (err) throw err;
			for (var i in rows) {
				result.push(rows[i]);
			}
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};

// 見積情報リストの取得
var quote_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.quote_info WHERE quote_delete_check = $1 AND entry_no = $2';
	var sql = 'SELECT ' 
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'to_char(quote_date,\'YYYY/MM/DD\') AS quote_date,'	// 見積日
		+ 'expire_date,'		// 有効期限
		+ 'quote_specific.total_price,'
		+ 'monitors_num,'		// 被験者数
		+ 'quote_submit_check,'	// 見積書提出済フラグ
		+ 'order_status,'		// 受注ステータス
		+ 'quote_form_memo,'	// 見積書備考
		+ 'consumption_tax,'	// 消費税率
		+ 'quote_delete_check,' // 削除フラグ
		+ 'to_char(quote_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'quote_info.created_id,' 
		+ 'to_char(quote_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'quote_info.updated_id,' 
		+ 'quote_delete_check' 
		+ ' FROM drc_sch.quote_info'
		// 合計金額を求めるサブクエリー
		+ ' LEFT JOIN (SELECT entry_no,quote_no,sum(price) AS total_price FROM drc_sch.quote_specific_info WHERE quote_specific_info.specific_delete_check = 0 GROUP BY entry_no,quote_no) AS quote_specific ON (quote_info.entry_no = quote_specific.entry_no AND quote_info.quote_no = quote_specific.quote_no )'
		+ ' WHERE quote_delete_check = $1 AND quote_info.entry_no = $2 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	var dc = Number(req.query.quote_delete_check);
	var params = [dc,req.params.entry_no];
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
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
						result.records = results.rows.length;
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
			}
		});
	});
};


// 見積情報データ取得
var quote_get_detail = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,'			// 案件番号
		+ 'quote_no,'			// 見積番号
		+ 'to_char(quote_date,\'YYYY/MM/DD HH24:MI:SS\') AS quote_date,'	// 見積日
		+ 'expire_date,'		// 有効期限
		+ 'monitors_num,'		// 被験者数
		+ 'quote_submit_check,'	// 見積書提出済フラグ
		+ 'order_status,'		// 受注ステータス
		+ 'quote_form_memo,'	// 見積書備考
		+ 'consumption_tax,'	// 消費税率
		+ 'quote_delete_check,' // 削除フラグ
		+ 'to_char(quote_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'quote_info.created_id,' 
		+ 'to_char(quote_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'quote_info.updated_id' 
		+ ' FROM drc_sch.quote_info'
		+ ' WHERE quote_info.entry_no = $1 AND quote_no = $2';
	var entry = {};
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, [req.params.entry_no, req.params.quote_no]);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function (result, err) {
			if (err) throw err;
			for (var i in rows) {
				entry = rows[i];
			}
			connection.end();
			res.send(entry);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};
// 見積情報リストの取得（グリッド用）
var quote_specific_get_list_grid = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.quote_specific_info WHERE specific_delete_check = $1 AND (entry_no = $2 AND quote_no = $3)';
	var sql = 'SELECT ' 
		+ 'entry_no,'
		+ 'quote_no,'			// 見積番号
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'quote_specific_info.created_id,' 
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'quote_specific_info.updated_id' 
		+ ' FROM drc_sch.quote_specific_info'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (quote_specific_info.test_middle_class_cd = test_middle_class.item_cd AND test_middle_class.large_item_cd = $4)'
		+ ' WHERE specific_delete_check = $1 AND (entry_no = $2 AND quote_no = $3 ) ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	var dc = Number(req.query.specific_delete_check);
	var params_0 = [dc,req.params.entry_no, req.params.quote_no];
	//var params = [dc,req.params.entry_no, req.params.quote_no,req.query.large_item_cd];
	var params = [dc,req.params.entry_no, req.params.quote_no];
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		// 最初に件数を取得する		
		connection.query(sql_count, params_0, function (err, results) {
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
							var quote = [];
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

// 見積明細リストの取得（案件フォーム用）
// 受注確定になっている見積Noの明細を取得する
exports.quote_specific_get_list_for_entryform = function (req, res) {
	var sql = 'SELECT ' 
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'quote_info.consumption_tax,'
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'quote_specific_info.created_id,' 
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'quote_specific_info.updated_id' 
		+ ' FROM drc_sch.quote_specific_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (entry_info.entry_no = $1)'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = entry_info.test_large_class_cd)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.quote_no = quote_specific_info.quote_no AND quote_info.entry_no = $1 AND quote_info.order_status = 2)'
		+ ' WHERE quote_info.quote_delete_check = 0 AND specific_delete_check = 0 AND (quote_specific_info.entry_no = $1 AND quote_info.order_status = 2) ORDER BY quote_detail_no' 
	// SQL実行
	var params = [req.params.entry_no];
	var result = { page: 1, total: 20, records: 0, rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			result.records = rows.length;
			result.rows = rows;
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
// 見積明細リストの取得（案件フォーム用）
// 案件に登録されている見積全部を取得する
exports.quote_specific_get_list_for_calendar = function (req, res) {
	// 受注確定の見積検索
	var sql_a = 'SELECT ' 
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'quote_specific_info.created_id,' 
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'quote_specific_info.updated_id' 
		+ ' FROM drc_sch.quote_specific_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (entry_info.entry_no = $1)'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = entry_info.test_large_class_cd)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.quote_no = quote_specific_info.quote_no AND quote_info.entry_no = $1 AND quote_info.order_status = 2)'
		+ ' WHERE quote_info.quote_delete_check = 0 AND specific_delete_check = 0 AND (quote_specific_info.entry_no = $1 AND quote_info.order_status = 2) ORDER BY quote_detail_no' 
	// 全見積の取得
	var sql_b = 'SELECT ' 
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'quote_specific_info.created_id,' 
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'quote_specific_info.updated_id' 
		+ ' FROM drc_sch.quote_specific_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (entry_info.entry_no = $1)'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = entry_info.test_large_class_cd)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.quote_no = quote_specific_info.quote_no AND quote_info.entry_no = $1)'
		+ ' WHERE quote_info.quote_delete_check = 0 AND specific_delete_check = 0 AND (quote_specific_info.entry_no = $1) ORDER BY quote_detail_no' 
	// SQL実行
	var params = [req.params.entry_no];
	var result = { page: 1, total: 20, records: 0, rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql_a, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			result.records = rows.length;
			result.rows = rows;
			if (rows.length > 0) {
				// 受注確定になっている見積が見つかった場合はそれを取得して終了
				connection.end();
				res.send(result);
			} else {
				// 受注確定になっている見積が見つからない場合は全見積データを取得して返す
				query = connection.query(sql_b, params);
				query.on('row', function (row) {
					rows.push(row);
				});
				query.on('end',function(results,err) {
					result.records = rows.length;
					result.rows = rows;
					connection.end();
					res.send(result);
				});
				query.on('error', function (error) {
					console.log(sql + ' ' + error);
				});
			}
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
