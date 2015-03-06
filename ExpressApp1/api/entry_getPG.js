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
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.entry_info WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5) AND delete_check = $1';
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'entry_title,' 
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date," 
		+ 'entry_status,' 
		+ 'sales_person_id,' 
		+ 'quote_no,' 
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date," 
		+ "entry_info.client_cd," 
		+ "client_list.name_1 AS client_name_1," 
		+ "client_list.name_2 AS client_name_2," 
		+ "client_division_list.address_1 AS client_address_1," 
		+ "client_division_list.address_2 AS client_address_2," 
		+ "client_division_list.tel_no AS client_tel_no," 
		+ "client_division_list.fax_no AS client_fax_no," 
		+ "client_division_list.division_cd AS client_division_cd," 
		+ "client_division_list.name AS client_division_name," 
		+ "client_person_list.person_id AS client_person_id," 
		+ "client_person_list.name AS client_person_name," 
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date," 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'entry_info.test_large_class_cd,' 
		+ 'large_items.item_name AS test_large_class_name,' 
		+ 'entry_info.test_middle_class_cd,' 
		+ 'middle_items.item_name AS test_middle_class_name,' 
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'entry_info.created_id,' 
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'entry_info.updated_id' 
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_item_list AS large_items ON(entry_info.test_large_class_cd = large_items.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_item_list AS middle_items ON(entry_info.test_middle_class_cd = middle_items.item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
		+ ' WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5) AND entry_info.delete_check = $1 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return entry_get_list_for_grid(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04], pg_params);
};

// 案件リストの取得（ガントチャート用）
var entry_get_list_term = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'client_list.name_1 AS client_name_1,'
		+ 'client_division_list.name AS client_division_name,'
		+ 'entry_title,' 
		+ 'to_char(inquiry_date, "YYYY/MM/DD") AS inquiry_date,'
		+ 'entry_status,' 
		+ 'sales_person_id,' 
		+ 'quote_no,' 
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date," 
//		+ "entry_info.client_cd," 
//		+ "client_list.name_2 AS client_name_2," 
//		+ "client_division_list.address_1 AS client_address_1," 
//		+ "client_division_list.address_2 AS client_address_2," 
//		+ "client_person_list.name AS client_person_name," 
		+ 'to_char(order_accepted_date,"YYYY/MM/DD") AS order_accepted_date,'
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'entry_info.test_large_class_cd,' 
		+ 'large_items.item_name AS test_large_class_name,' 
		+ 'entry_info.test_middle_class_cd,' 
		+ 'middle_items.item_name AS test_middle_class_name,' 
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'entry_info.created_id,' 
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'entry_info.updated_id' 
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_item_list AS large_items ON(entry_info.test_large_class_cd = large_items.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_item_list AS middle_items ON(entry_info.test_middle_class_cd = middle_items.item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
		+ ' WHERE entry_info.delete_check = $1 ' 
		+ ' AND entry_info.test_large_class_cd = $2' 
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql, [0,req.params.test_type]);
};

var entry_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
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
		+ "entry_info.client_cd,"												// 得意先CD
		+ "entry_info.client_division_cd,"										// 得意先部署CD
		+ "entry_info.client_person_id,"										// 得意先担当者ID
		+ "client_list.name_1 AS client_name_1,"								// 得意先名１
		+ "client_list.name_2 AS client_name_2,"								// 得意先名２
		+ "client_division_list.address_1 AS client_address_1,"					// 得意先部署住所１
		+ "client_division_list.address_2 AS client_address_2,"					// 得意先部署住所２
		+ "client_division_list.name AS client_division_name,"					// 得意先部署名
		+ "client_person_list.name AS client_person_name,"						// 得意先担当者名
		+ 'entry_info.test_large_class_cd,'										// 試験大分類CD
		+ 'large_items.item_name AS test_large_class_name,'						// 試験大分類名
		+ 'entry_info.test_middle_class_cd,'									// 試験中分類CD
		+ 'middle_items.item_name AS test_middle_class_name,'					// 試験中分類名
		+ 'entry_title,'														// 試験タイトル
		+ 'order_type,'															// 受託区分
		+ 'outsourcing_cd,'														// 受託先CD
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date,"	// 受注日
		+ 'order_accept_check,'													// 仮受注チェック
		+ 'acounting_period_no,'												// 会計期No
		+ 'test_person_id,'														// 試験担当者ID
		+ 'entry_amount_price,'													// 案件合計金額
		+ 'entry_amount_billing,'												// 案件請求合計金額
		+ 'entry_amount_deposit,'												// 案件入金合計金額
		+ 'entry_memo,'															// メモ
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"		// 作成日
		+ 'entry_info.created_id,'												// 作成者ID
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"		// 更新日
		+ 'entry_info.updated_id'												// 更新者ID
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_item_list AS large_items ON(entry_info.test_large_class_cd = large_items.item_cd)' 
		+ ' LEFT JOIN drc_sch.test_item_list AS middle_items ON(entry_info.test_middle_class_cd = middle_items.item_cd)' 
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)' 
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)' 
		+ ' WHERE entry_no = $1 ';
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
		+ 'updated_id,' 
		+ 'quote_delete_check,' 
		+ 'quote_delete_reason' 
		+ ' FROM drc_sch.quote_info WHERE quote_delete_check = $1 AND entry_no = $2 ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	var dc = Number(req.query.quote_delete_check);
	var params = [dc,req.params.entry_no];
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
							var quote = [];
							row.id = (i + 1);
							row.cell.push(req.params.entry_no);					// 案件番号
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
							row.cell.push(results.rows[i].quote_delete_check);	// 削除フラグ
							row.cell.push(results.rows[i].quote_delete_reason);	// 削除理由
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
