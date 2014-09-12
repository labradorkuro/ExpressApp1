//
// 案件リストからのGETを処理する
//
var mysql = require('mysql');
var tools = require('../tools/tool');

var connection = mysql.createConnection({
	host     : 'localhost',
	port     : '3306',
	user     : 'drc_root',
	password : 'drc_r00t@',
	database : 'drc_sch'
});

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

// 案件リストの取得
var entry_get_list = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'entry_title,' 
		+ 'DATE_FORMAT(inquiry_date, "%Y/%m/%d") AS inquiry_date,' 
		+ 'entry_status,' 
		+ 'base_cd,' 
		+ 'person_id,' 
		+ 'quote_no,' 
		+ 'DATE_FORMAT(quote_issue_date,"%Y/%m/%d") AS quote_issue_date,' 
		+ 'DATE_FORMAT(order_accepted_date,"%Y/%m/%d") AS order_accepted_date,' 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'division,' 
		+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,' 
		+ 'created_id,' 
		+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.entry_info WHERE delete_check = ? ORDER BY entry_no DESC';
	return entry_get_list_for_grid(res, sql,[0]);
};

// 案件リストの取得（ガントチャート用）
var entry_get_list_term = function (req, res) {
	var start_date = req.params.start;
	var end_date = req.params.end;
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'entry_title,' 
		+ 'DATE_FORMAT(inquiry_date, "%Y/%m/%d") AS inquiry_date,' 
		+ 'entry_status,' 
		+ 'base_cd,' 
		+ 'person_id,' 
		+ 'quote_no,' 
		+ 'DATE_FORMAT(quote_issue_date,"%Y/%m/%d") AS quote_issue_date,' 
		+ 'DATE_FORMAT(order_accepted_date,"%Y/%m/%d") AS order_accepted_date,' 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'division,' 
		+ 'DATE_FORMAT(prior_payment_limit,"%Y/%m/%d") AS prior_payment_limit,'
		+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,' 
		+ 'created_id,' 
		+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.entry_info WHERE delete_check = ?' 
		+ ' AND division = ?'
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql,[0,req.params.test_type]);
};

var entry_get_list_for_grid = function (res, sql, params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	connection.query(sql, params, function (err, rows) {
		if (err) throw err;
		result.records = rows.length;
		for (var i in rows) {
			var row = { id: '', cell: [] };
			var entry = [];
			row.id = (i + 1);
			//colNames: ['案件No','案件名','問合せ日', '案件ステータス', '拠点CD','担当者','見積番号','見積発行日'
			//	,'受注日','仮受注チェック','受注区分','試験課','作成日','作成者','更新日','更新者'],
			row.cell.push(rows[i].entry_no); // 案件No
			row.cell.push(rows[i].entry_title); // 案件名
			row.cell.push(rows[i].inquiry_date); // 問合せ日
			row.cell.push(rows[i].entry_status); // 案件ステータス
			row.cell.push(rows[i].base_cd); // 拠点CD
			row.cell.push(rows[i].person_id); // 担当者ID
			row.cell.push(rows[i].quote_no); // 見積番号
			row.cell.push(rows[i].quote_issue_date); // 見積書発行日
			row.cell.push(rows[i].order_accepted_date); // 受注日付
			row.cell.push(rows[i].order_accept_check); // 仮受注日チェック
			//row.cell.acounting_period_no = rows[i].acounting_period_no; // 会計期No
			row.cell.push(rows[i].order_type); // 受託区分
			//row.cell.contract_type = rows[i].contract_type; // 契約区分
			//row.cell.outsourcing_cd = rows[i].outsourcing_cd; // 委託先CD
			row.cell.push(rows[i].division); // 事業部ID
			row.cell.push(rows[i].created); // 作成日
			row.cell.push(rows[i].created_id);			// 作成者ID
			row.cell.push(rows[i].updated); // 更新日
			row.cell.push(rows[i].updated_id);			// 更新者ID
			result.rows.push(row);
		}
		res.send(result);
	});
};

// ガントチャート用案件データリスト取得
var entry_get_list_for_gantt = function (res, sql, params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	connection.query(sql, params, function (err, rows) {
		if (err) throw err;
		result.records = rows.length;
		for (var i in rows) {
			var entry = rows[i];
			rows[i].quote = [];
		}
		result.rows = rows;
		res.send(result);
	});
};

// 案件データ（案件No）取得
var entry_get_detail = function (req, res) {
	var sql = 'SELECT ' 
			+ 'entry_no,' // 案件No
			+ 'base_cd,' // 拠点CD
			+ 'entry_title,' // 案件名
			+ 'DATE_FORMAT(inquiry_date,"%Y/%m/%d") AS inquiry_date,' // 問合せ日
			+ 'entry_status,' // 案件ステータス
			+ 'quote_no,' // 見積番号
			+ 'DATE_FORMAT(quote_issue_date,"%Y/%m/%d") AS quote_issue_date,' // 見積書発行日
			+ 'DATE_FORMAT(order_accepted_date,"%Y/%m/%d") AS order_accepted_date,' // 受注日付
			+ 'order_accept_check,' // 仮受注日チェック
			+ 'acounting_period_no,' // 会計期No
			+ 'order_type,' // 受託区分
			+ 'contract_type,' // 契約区分
			+ 'outsourcing_cd,' // 委託先CD
			+ 'division,' // 事業部ID
			+ 'entry_amount_price,' // 案件合計金額
			+ 'entry_amount_billing,' // 案件請求合計金額
			+ 'entry_amount_deposit,' // 案件入金合計金額
			+ 'DATE_FORMAT(monitors_cost_prep_limit,"%Y/%m/%d") AS monitors_cost_prep_limit,' // 被験者費用準備期日
			+ 'DATE_FORMAT(monitors_cost_prep_comp,"%Y/%m/%d") AS monitors_cost_prep_comp,' // 被験者費用準備完了日
			+ 'drc_substituted_amount,' // DRC立替準備金額
			+ 'DATE_FORMAT(prior_payment_limit,"%Y/%m/%d") AS prior_payment_limit,' // 事前入金期日
			+ 'DATE_FORMAT(prior_payment_accept,"%Y/%m/%d") AS prior_payment_accept,' // 事前入金日
			+ 'person_id,' // 担当者ID
			+ 'delete_check,' // 削除フラグ
			+ 'delete_reason,' // 削除理由
			+ 'DATE_FORMAT(input_check_date,"%Y/%m/%d") AS input_check_date,' // 入力日
			+ 'input_check,' // 入力完了チェック
			+ 'input_operator_id,' // 入力者ID
			+ 'DATE_FORMAT(confirm_check_date,"%Y/%m/%d") AS confirm_check_date,' // 確認日
			+ 'confirm_check,' // 確認完了チェック
			+ 'confirm_operator_id,' // 確認者ID
			+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,'						// 作成日
			+ 'created_id,' // 作成者ID
			+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,'						// 更新日
			+ 'updated_id' // 更新者ID
			+ ' FROM drc_sch.entry_info WHERE entry_no = ?';
	var entry = {};
	// SQL実行
	connection.query(sql, [req.params.no], function (err, rows) {
		if (err) throw err;
		for (var i in rows) {
			entry = rows[i]; 
		}
		res.send(entry);
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
	var sql = 'SELECT ' 
		+ 'quote_no,' // 見積番号
		+ 'quote_detail_no,' // 明細番号
		+ 'test_item_cd,' // 試験項目CD
		+ 'test_item,' // 試験項目名
		+ 'sample_name,' // 試料名
		+ 'DATE_FORMAT(arrive_date,"%Y/%m/%d") AS arrive_date,' // 到着日
		+ 'test_planning_no,' // 試験計画書番号
		+ 'monitors_num,' // 被験者数
		+ 'sample_volume,' // 検体数
		+ 'final_report_no,' // 報告書番号
		+ 'DATE_FORMAT(final_report_limit,"%Y/%m/%d") AS final_report_limit,' // 報告書提出期限
		+ 'DATE_FORMAT(final_report_date,"%Y/%m/%d") AS final_report_date,' // 報告書提出日
		+ 'DATE_FORMAT(quick_report_limit1,"%Y/%m/%d") AS quick_report_limit1,' // 速報提出期限1
		+ 'DATE_FORMAT(quick_report_date1,"%Y/%m/%d") AS quick_report_date1,' // 速報提出日1
		+ 'DATE_FORMAT(quick_report_limit2,"%Y/%m/%d") AS quick_report_limit2,' // 速報提出期限2
		+ 'DATE_FORMAT(quick_report_date2,"%Y/%m/%d") AS quick_report_date2,' // 速報提出日2
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
		+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,' 
		+ 'created_id,' 
		+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.quote_info WHERE quote_delete_check = ? AND entry_no = ? ORDER BY quote_detail_no ASC';
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	connection.query(sql, [0,req.params.entry_no], function (err, rows) {
		if (err) throw err;
		result.records = rows.length;
		for (var i in rows) {
			var row = { id: '', cell: [] };
			var quote = [];
			row.id = (i + 1);
			row.cell.push(rows[i].quote_no);			// 見積番号
			row.cell.push(rows[i].quote_detail_no);		// 明細番号
			row.cell.push(rows[i].test_item_cd);		// 試験項目CD
			row.cell.push(rows[i].test_item);			// 試験項目名
			row.cell.push(rows[i].sample_name);			// 試料名
			row.cell.push(rows[i].arrive_date);			// 到着日
			row.cell.push(rows[i].test_planning_no);	// 試験計画書番号
			row.cell.push(rows[i].monitors_num);		// 被験者数
			row.cell.push(rows[i].sample_volume);		// 検体数
			row.cell.push(rows[i].final_report_no);		// 報告書番号
			row.cell.push(rows[i].final_report_limit);	// 報告書提出期限
			row.cell.push(rows[i].final_report_date);	// 報告書提出日
			row.cell.push(rows[i].quick_report_limit1); // 速報提出期限1
			row.cell.push(rows[i].quick_report_date1);	// 速報提出日1
			row.cell.push(rows[i].quick_report_limit2); // 速報提出期限2
			row.cell.push(rows[i].quick_report_date2);	// 速報提出日2
			row.cell.push(rows[i].expect_value);		// 期待値・設定値
			row.cell.push(rows[i].descript_value);		// 値説明
			row.cell.push(rows[i].unit_cd);				// 単位
			row.cell.push(rows[i].unit);				// 単位
			row.cell.push(rows[i].unit_price);			// 単価
			row.cell.push(rows[i].quantity);				// 数量
			row.cell.push(rows[i].quote_price);			// 見積金額
			row.cell.push(rows[i].test_memo);			// 備考
			row.cell.push(rows[i].created);
			row.cell.push(rows[i].created_id);
			row.cell.push(rows[i].updated);
			row.cell.push(rows[i].updated_id);
			result.rows.push(row);
		}
		res.send(result);
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
		+ 'DATE_FORMAT(arrive_date,"%Y/%m/%d") AS arrive_date,' // 到着日
		+ 'test_planning_no,' // 試験計画書番号
		+ 'monitors_num,' // 被験者数
		+ 'sample_volume,' // 検体数
		+ 'final_report_no,' // 報告書番号
		+ 'DATE_FORMAT(final_report_limit,"%Y/%m/%d") AS final_report_limit,' // 報告書提出期限
		+ 'DATE_FORMAT(final_report_date,"%Y/%m/%d") AS final_report_date,' // 報告書提出日
		+ 'DATE_FORMAT(quick_report_limit1,"%Y/%m/%d") AS quick_report_limit1,' // 速報提出期限1
		+ 'DATE_FORMAT(quick_report_date1,"%Y/%m/%d") AS quick_report_date1,' // 速報提出日1
		+ 'DATE_FORMAT(quick_report_limit2,"%Y/%m/%d") AS quick_report_limit2,' // 速報提出期限2
		+ 'DATE_FORMAT(quick_report_date2,"%Y/%m/%d") AS quick_report_date2,' // 速報提出日2
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
		+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,' 
		+ 'created_id,' 
		+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.quote_info WHERE quote_delete_check = ? AND entry_no = ? ORDER BY quote_detail_no ASC';
	// SQL実行
	var result = [];
	connection.query(sql, [0,req.params.entry_no], function (err, rows) {
		if (err) throw err;
		for (var i in rows) {
			result.push(rows[i]);
		}
		res.send(result);
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
		+ 'DATE_FORMAT(final_report_limit,"%Y/%m/%d") AS final_report_limit,' // 報告書提出期限
		+ 'DATE_FORMAT(final_report_date,"%Y/%m/%d") AS final_report_date,' // 報告書提出日
		+ 'DATE_FORMAT(quick_report_limit1,"%Y/%m/%d") AS quick_report_limit1,' // 速報提出期限1
		+ 'DATE_FORMAT(quick_report_date1,"%Y/%m/%d") AS quick_report_date1,'// 速報提出日1
		+ 'DATE_FORMAT(quick_report_limit2,"%Y/%m/%d") AS quick_report_limit2,' // 速報提出期限2
		+ 'DATE_FORMAT(quick_report_date2,"%Y/%m/%d") AS quick_report_date2,' // 速報提出日2
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
		+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,' 
		+ 'created_id,' 
		+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.quote_info WHERE entry_no = ? AND quote_detail_no = ?';
	var entry = {};
	// SQL実行
	connection.query(sql, [req.params.entry_no, req.params.quote_detail_no], function (err, rows) {
		if (err) throw err;
		for (var i in rows) {
			entry = rows[i];
		}
		res.send(entry);
	});
};
