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
	if ((req.params.no != undefined) && (req.params.no != '')) {
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
		+ 'quoto_no,' 
		+ 'DATE_FORMAT(quoto_issue_date,"%Y/%m/%d") AS quoto_issue_date,' 
		+ 'DATE_FORMAT(order_accepted_date,"%Y/%m/%d") AS order_accepted_date,' 
		+ 'order_accept_check,' 
		+ 'order_type,' 
		+ 'division,' 
		+ 'DATE_FORMAT(created,"%Y/%m/%d %H:%i:%s") AS created,' 
		+ 'created_id,' 
		+ 'DATE_FORMAT(updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'updated_id' 
		+ ' FROM drc_sch.entry_info WHERE delete_check = ? ORDER BY entry_no DESC';
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	connection.query(sql, [0], function (err, rows) {
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
			row.cell.push(rows[i].quoto_no); // 見積番号
			row.cell.push(rows[i].quoto_issue_date); // 見積書発行日
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

// 案件データ（案件No）取得
var entry_get_detail = function (req, res) {
	var sql = 'SELECT ' 
			+ 'entry_no,' // 案件No
			+ 'base_cd,' // 拠点CD
			+ 'entry_title,' // 案件名
			+ 'DATE_FORMAT(inquiry_date,"%Y/%m/%d") AS inquiry_date,' // 問合せ日
			+ 'entry_status,' // 案件ステータス
			+ 'quoto_no,' // 見積番号
			+ 'DATE_FORMAT(quoto_issue_date,"%Y/%m/%d") AS quoto_issue_date,' // 見積書発行日
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