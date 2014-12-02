//
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
	if ((req.params.start != undefined) && (req.params.start != '')) {
		if ((req.params.end != undefined) && (req.params.end != '')) {
			entry_get_list_term(req, res);
		}
	}	
	else if ((req.params.no != undefined) && (req.params.no != '')) {
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
	if (req.query.sodr) pg_param.sord = req.query.sord;
	pg_param.offset = (pg_param.page - 1) * pg_param.limit;
	return pg_param;
};
// 案件リストの取得
var entry_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.entry_info WHERE delete_check = $1';
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'entry_title,' 
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date," 
		+ 'entry_status,' 
		+ 'base_cd,' 
		+ 'person_id,' 
		+ 'quote_no,' 
		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date," 
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date," 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'division,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
		+ ' FROM drc_sch.entry_info WHERE delete_check = $1 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return entry_get_list_for_grid(res, sql_count, sql, [0], pg_params.limit);
};

// 案件リストの取得（ガントチャート用）
var entry_get_list_term = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'entry_title,' 
		+ 'to_char(inquiry_date, \'YYYY/MM/DD\') AS inquiry_date,' 
		+ 'entry_status,' 
		+ 'base_cd,' 
		+ 'person_id,' 
		+ 'quote_no,' 
		+ 'to_char(quote_issue_date,\'YYYY/MM/DD\') AS quote_issue_date,' 
		+ 'to_char(order_accepted_date,\'YYYY/MM/DD\') AS order_accepted_date,' 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'division,' 
		+ 'to_char(prior_payment_limit,\'YYYY/MM/DD\') AS prior_payment_limit,' 
		+ 'to_char(created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'created_id,' 
		+ 'to_char(updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.entry_info WHERE delete_check = $1' 
		+ ' AND division = $2' 
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql, [0,req.params.test_type]);
};

var entry_get_list_for_grid = function (res, sql_count, sql, params, limit) {
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
			+ 'entry_no,' // 案件No
			+ 'base_cd,' // 拠点CD
			+ 'entry_title,' // 案件名
			+ 'to_char(inquiry_date,\'YYYY/MM/DD\') AS inquiry_date,' // 問合せ日
			+ 'entry_status,' // 案件ステータス
			+ 'quote_no,' // 見積番号
			+ 'to_char(quote_issue_date,\'YYYY/MM/DD\') AS quote_issue_date,' // 見積書発行日
			+ 'to_char(order_accepted_date,\'YYYY/MM/DD\') AS order_accepted_date,' // 受注日付
			+ 'order_accept_check,' // 仮受注日チェック
			+ 'acounting_period_no,' // 会計期No
			+ 'order_type,' // 受託区分
			+ 'contract_type,' // 契約区分
			+ 'outsourcing_cd,' // 委託先CD
			+ 'division,' // 事業部ID
			+ 'entry_amount_price,' // 案件合計金額
			+ 'entry_amount_billing,' // 案件請求合計金額
			+ 'entry_amount_deposit,' // 案件入金合計金額
			+ 'to_char(monitors_cost_prep_limit,\'YYYY/MM/DD\') AS monitors_cost_prep_limit,' // 被験者費用準備期日
			+ 'to_char(monitors_cost_prep_comp,\'YYYY/MM/DD\') AS monitors_cost_prep_comp,' // 被験者費用準備完了日
			+ 'drc_substituted_amount,' // DRC立替準備金額
			+ 'to_char(prior_payment_limit,\'YYYY/MM/DD\') AS prior_payment_limit,' // 事前入金期日
			+ 'to_char(prior_payment_accept,\'YYYY/MM/DD\') AS prior_payment_accept,' // 事前入金日
			+ 'to_char(pay_planning_date_1,\'YYYY/MM/DD\') AS pay_planning_date_1,' 
			+ 'to_char(pay_planning_date_2,\'YYYY/MM/DD\') AS pay_planning_date_2,' 
			+ 'to_char(pay_planning_date_3,\'YYYY/MM/DD\') AS pay_planning_date_3,' 
			+ 'to_char(pay_planning_date_4,\'YYYY/MM/DD\') AS pay_planning_date_4,' 
			+ 'to_char(pay_planning_date_5,\'YYYY/MM/DD\') AS pay_planning_date_5,' 
			+ 'to_char(pay_complete_date_1,\'YYYY/MM/DD\') AS pay_complete_date_1,' 
			+ 'to_char(pay_complete_date_2,\'YYYY/MM/DD\') AS pay_complete_date_2,' 
			+ 'to_char(pay_complete_date_3,\'YYYY/MM/DD\') AS pay_complete_date_3,' 
			+ 'to_char(pay_complete_date_4,\'YYYY/MM/DD\') AS pay_complete_date_4,' 
			+ 'to_char(pay_complete_date_5,\'YYYY/MM/DD\') AS pay_complete_date_5,' 
			+ 'pay_amount_1,' 
			+ 'pay_amount_2,' 
			+ 'pay_amount_3,' 
			+ 'pay_amount_4,' 
			+ 'pay_amount_5,' 
			+ 'pay_result_1,' 
			+ 'pay_result_2,' 
			+ 'pay_result_3,' 
			+ 'pay_result_4,' 
			+ 'pay_result_5,' 
			+ 'person_id,' // 担当者ID
			+ 'delete_check,' // 削除フラグ
			+ 'delete_reason,' // 削除理由
			+ 'to_char(input_check_date,\'YYYY/MM/DD\') AS input_check_date,' // 入力日
			+ 'input_check,' // 入力完了チェック
			+ 'input_operator_id,' // 入力者ID
			+ 'to_char(confirm_check_date,\'YYYY/MM/DD\') AS confirm_check_date,' // 確認日
			+ 'confirm_check,' // 確認完了チェック
			+ 'confirm_operator_id,' // 確認者ID
			+ 'to_char(created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' // 作成日
			+ 'created_id,' // 作成者ID
			+ 'to_char(updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' // 更新日
			+ 'updated_id' // 更新者ID
			+ ' FROM drc_sch.entry_info WHERE entry_no = $1';
	var entry = {};
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
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

// 試験（見積）明細データの取得
exports.quote_get = function (req, res) {
	// noは明細番号
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_detail_no != undefined) && (req.params.quote_detail_no != '')) {
			
			quote_get_detail(req, res);
		} else {
			quote_get_list(req, res);
		}
	}
};
// 試験（見積）明細データの取得（ガントチャート用）
exports.quote_gantt = function (req, res) {
	quote_get_list_for_gantt(req, res);
};

// 試験（見積）明細リストの取得
var quote_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.quote_info WHERE quote_delete_check = $1 AND entry_no = $2';
	var sql = 'SELECT ' 
		+ 'quote_no,' // 見積番号
		+ 'quote_detail_no,' // 明細番号
		+ 'test_item_cd,' // 試験項目CD
		+ 'test_item,' // 試験項目名
		+ 'sample_name,' // 試料名
		+ 'to_char(arrive_date,\'YYYY/MM/DD\') AS arrive_date,' // 到着日
		+ 'test_planning_no,' // 試験計画書番号
		+ 'monitors_num,' // 被験者数
		+ 'sample_volume,' // 検体数
		+ 'final_report_no,' // 報告書番号
		+ 'to_char(final_report_limit,\'YYYY/MM/DD\') AS final_report_limit,' // 報告書提出期限
		+ 'to_char(final_report_date,\'YYYY/MM/DD\') AS final_report_date,' // 報告書提出日
		+ 'to_char(quick_report_limit1,\'YYYY/MM/DD\') AS quick_report_limit1,' // 速報提出期限1
		+ 'to_char(quick_report_date1,\'YYYY/MM/DD\') AS quick_report_date1,' // 速報提出日1
		+ 'to_char(quick_report_limit2,\'YYYY/MM/DD\') AS quick_report_limit2,' // 速報提出期限2
		+ 'to_char(quick_report_date2,\'YYYY/MM/DD\') AS quick_report_date2,' // 速報提出日2
		+ 'expect_value,' // 期待値・設定値
		+ 'descript_value,' // 値説明
		+ 'unit_cd,' // 単位CD
		+ 'unit,' // 単位
		+ 'unit_price,' // 単価
		+ 'quantity,' // 数量
		+ 'quote_price,' // 見積金額
		+ 'test_memo,' // 備考
		+ 'quote_delete_check,' // 削除フラグ
		+ 'quote_delete_reason,' // 削除理由
		+ 'to_char(created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'created_id,' 
		+ 'to_char(updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.quote_info WHERE quote_delete_check = $1 AND entry_no = $2 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	pg.connect(connectionString, function (err, connection) {
		// 最初に件数を取得する		
		connection.query(sql_count, [0,req.params.entry_no], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.round(results.rows[0].cnt / pg_params.limit) + 1;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, [0, req.params.entry_no], function (err, results) {
					if (err) {
						console.log(err);
					} else {
						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var quote = [];
							row.id = (i + 1);
							row.cell.push(results.rows[i].quote_no);			// 見積番号
							row.cell.push(results.rows[i].quote_detail_no);		// 明細番号
							row.cell.push(results.rows[i].test_item_cd);		// 試験項目CD
							row.cell.push(results.rows[i].test_item);			// 試験項目名
							row.cell.push(results.rows[i].sample_name);			// 試料名
							row.cell.push(results.rows[i].arrive_date);			// 到着日
							row.cell.push(results.rows[i].test_planning_no);	// 試験計画書番号
							row.cell.push(results.rows[i].monitors_num);		// 被験者数
							row.cell.push(results.rows[i].sample_volume);		// 検体数
							row.cell.push(results.rows[i].final_report_no);		// 報告書番号
							row.cell.push(results.rows[i].final_report_limit);	// 報告書提出期限
							row.cell.push(results.rows[i].final_report_date);	// 報告書提出日
							row.cell.push(results.rows[i].quick_report_limit1); // 速報提出期限1
							row.cell.push(results.rows[i].quick_report_date1);	// 速報提出日1
							row.cell.push(results.rows[i].quick_report_limit2); // 速報提出期限2
							row.cell.push(results.rows[i].quick_report_date2);	// 速報提出日2
							row.cell.push(results.rows[i].expect_value);		// 期待値・設定値
							row.cell.push(results.rows[i].descript_value);		// 値説明
							row.cell.push(results.rows[i].unit_cd);				// 単位
							row.cell.push(results.rows[i].unit);				// 単位
							row.cell.push(results.rows[i].unit_price);			// 単価
							row.cell.push(results.rows[i].quantity);				// 数量
							row.cell.push(results.rows[i].quote_price);			// 見積金額
							row.cell.push(results.rows[i].test_memo);			// 備考
							row.cell.push(results.rows[i].created);
							row.cell.push(results.rows[i].created_id);
							row.cell.push(results.rows[i].updated);
							row.cell.push(results.rows[i].updated_id);
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


// 試験（見積）明細リストの取得（ガントチャート用）
var quote_get_list_for_gantt = function (req, res) {
	var sql = 'SELECT ' 
		+ 'quote_no,' // 見積番号
		+ 'quote_detail_no,' // 明細番号
		+ 'test_item_cd,' // 試験項目CD
		+ 'test_item,' // 試験項目名
		+ 'sample_name,' // 試料名
		+ 'to_char(arrive_date,\'YYYY/MM/DD\') AS arrive_date,' // 到着日
		+ 'test_planning_no,' // 試験計画書番号
		+ 'monitors_num,' // 被験者数
		+ 'sample_volume,' // 検体数
		+ 'final_report_no,' // 報告書番号
		+ 'to_char(final_report_limit,\'YYYY/MM/DD\') AS final_report_limit,' // 報告書提出期限
		+ 'to_char(final_report_date,\'YYYY/MM/DD\') AS final_report_date,' // 報告書提出日
		+ 'to_char(quick_report_limit1,\'YYYY/MM/DD\') AS quick_report_limit1,' // 速報提出期限1
		+ 'to_char(quick_report_date1,\'YYYY/MM/DD\') AS quick_report_date1,' // 速報提出日1
		+ 'to_char(quick_report_limit2,\'YYYY/MM/DD\') AS quick_report_limit2,' // 速報提出期限2
		+ 'to_char(quick_report_date2,\'YYYY/MM/DD\') AS quick_report_date2,' // 速報提出日2
		+ 'expect_value,' // 期待値・設定値
		+ 'descript_value,' // 値説明
		+ 'unit_cd,' // 単位CD
		+ 'unit,' // 単位
		+ 'unit_price,' // 単価
		+ 'quantity,' // 数量
		+ 'quote_price,' // 見積金額
		+ 'test_memo,' // 備考
		+ 'quote_delete_check,' // 削除フラグ
		+ 'quote_delete_reason,' // 削除理由
		+ 'to_char(created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'created_id,' 
		+ 'to_char(updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.quote_info WHERE quote_delete_check = $1 AND entry_no = $2 ORDER BY quote_detail_no ASC';
	// SQL実行
	var result = [];
	var rows = [];
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [0,req.params.entry_no]);
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

// 試験（見積）明細データ取得
var quote_get_detail = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,' // 案件番号
		+ 'quote_no,' // 見積番号
		+ 'quote_detail_no,' // 明細番号
		+ 'test_item_cd,' // 試験項目CD
		+ 'test_item,' // 試験項目名
		+ 'sample_name,' // 試料名
		+ 'arrive_date,' // 到着日
		+ 'test_planning_no,' // 試験計画書番号
		+ 'monitors_num,' // 被験者数
		+ 'sample_volume,' // 検体数
		+ 'final_report_no,' // 報告書番号
		+ 'to_char(final_report_limit,\'YYYY/MM/DD\') AS final_report_limit,' // 報告書提出期限
		+ 'to_char(final_report_date,\'YYYY/MM/DD\') AS final_report_date,' // 報告書提出日
		+ 'to_char(quick_report_limit1,\'YYYY/MM/DD\') AS quick_report_limit1,' // 速報提出期限1
		+ 'to_char(quick_report_date1,\'YYYY/MM/DD\') AS quick_report_date1,' // 速報提出日1
		+ 'to_char(quick_report_limit2,\'YYYY/MM/DD\') AS quick_report_limit2,' // 速報提出期限2
		+ 'to_char(quick_report_date2,\'YYYY/MM/DD\') AS quick_report_date2,' // 速報提出日2
		+ 'expect_value,' // 期待値・設定値
		+ 'descript_value,' // 値説明
		+ 'unit_cd,' // 単位CD
		+ 'unit,' // 単位
		+ 'unit_price,' // 単価
		+ 'quantity,' // 数量
		+ 'quote_price,' // 見積金額
		+ 'test_memo,' // 備考
		+ 'quote_delete_check,' // 削除フラグ
		+ 'quote_delete_reason,' // 削除理由
		+ 'to_char(created,\'YYYY/MM/DD HH24:MI:SS\') AS created,' 
		+ 'created_id,' 
		+ 'to_char(updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.quote_info WHERE entry_no = $1 AND quote_detail_no = $2';
	var entry = {};
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [req.params.entry_no, req.params.quote_detail_no]);
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
