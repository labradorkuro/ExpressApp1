//
// 案件フォームからのPOSTを処理する
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
// 案件基本データのPOST
exports.entry_post = function (req, res) {
	var entry = entry_check(req.body);
	if (entry.entry_no === '') {
		// 案件Noの取得、案件データのDB追加
		getEntryNo(entry, res);
	} else {
		// 案件データの更新
		updateEntryInfo(entry, res);
	}
};

// 案件番号の取得
var getEntryNo = function (entry, res){
	var rtn = "";
	var count = 1;
	var now = tools.getToday("{0}/{1}/{2}");
	var sql = 'SELECT entry_count FROM drc_sch.entry_number WHERE entry_date = ?';
	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, [now], function (err, rows) {
			if (err) throw err;
			if (rows.length == 0) {
				// その日のカウントが未登録
				sql = 'INSERT INTO drc_sch.entry_number (entry_date,entry_count) VALUES (?,?)';
				connection.query(sql, [now,count], function (err, rows) {
					if (err) throw err;
					insertEntryInfo(connection, entry, count, res);
				});
			} else {
				// カウントの登録あり
				for (var i in rows) {
					count = rows[i].entry_count;
				}
				// カウントの更新
				count++;
				sql = 'UPDATE drc_sch.entry_number SET entry_count = ? WHERE entry_date = ?';
				connection.query(sql, [count,now], function (err, rows) {
					if (err) throw err;
					insertEntryInfo(connection, entry, count, res);
				});
			}
		});
	});
};
// 案件データをDBに追加
var insertEntryInfo = function(connection, entry, count, res) {
	entry.entry_no = getDateNo(count, '-');
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = "tanaka";
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.entry_info(' 
			+ 'entry_no,'						// 案件No
			+ 'base_cd,'						// 拠点CD
			+ 'entry_title,'					// 案件名
			+ 'inquiry_date,'					// 問合せ日
			+ 'entry_status,'					// 案件ステータス
			+ 'quote_no,'						// 見積番号
			+ 'quote_issue_date,'				// 見積書発行日
			+ 'order_accepted_date,'			// 受注日付
			+ 'order_accept_check,'				// 仮受注日チェック
			+ 'acounting_period_no,'			// 会計期No
			+ 'order_type,'						// 受託区分
			+ 'contract_type,'					// 契約区分
			+ 'outsourcing_cd,'					// 委託先CD
			+ 'division,'						// 事業部ID
			+ 'entry_amount_price,'				// 案件合計金額
			+ 'entry_amount_billing,'			// 案件請求合計金額
			+ 'entry_amount_deposit,'			// 案件入金合計金額
			+ 'monitors_cost_prep_limit,'		// 被験者費用準備期日
			+ 'monitors_cost_prep_comp,'		// 被験者費用準備完了日
			+ 'drc_substituted_amount,'			// DRC立替準備金額
			+ 'prior_payment_limit,'			// 事前入金期日
			+ 'prior_payment_accept,'			// 事前入金日
			+ 'person_id,'						// 担当者ID
			+ 'delete_check,'					// 削除フラグ
			+ 'delete_reason,'					// 削除理由
			+ 'input_check_date,'				// 入力日
			+ 'input_check,'					// 入力完了チェック
			+ 'input_operator_id,'				// 入力者ID
			+ 'confirm_check_date,'				// 確認日
			+ 'confirm_check,'					// 確認完了チェック
			+ 'confirm_operator_id,'			// 確認者ID
			+ 'created,'						// 作成日
			+ 'created_id,'						// 作成者ID
//			+ 'updated,'						// 更新日
			+ 'updated_id'						// 更新者ID
			+ ') values (' 
			+ '?,'		// 案件No
			+ '?,'		// 拠点CD
			+ '?,'	// 案件名
			+ '?,'			// 問合せ日
			+ '?,'	// 案件ステータス
			+ '?,'		// 見積番号
			+ '?,'		// 見積書発行日
			+ '?,'	// 受注日付
			+ '?,'	// 仮受注日チェック
			+ '?,'	// 会計期No
			+ '?,'			// 受託区分
			+ '?,'			// 契約区分
			+ '?,' // 委託先CD
			+ '?,'		// 事業部ID
			+ '?,'	// 案件合計金額
			+ '?,'	// 案件請求合計金額
			+ '?,'	// 案件入金合計金額
			+ '?,' // 被験者費用準備期日
			+ '?,' // 被験者費用準備完了日
			+ '?,'// DRC立替準備金額
			+ '?,'	// 事前入金期日
			+ '?,'	// 事前入金日
			+ '?,'		// 担当者ID
			+ '?,'			// 削除フラグ
			+ '?,'	// 削除理由
			+ '?,'		// 入力日
			+ '?,'			// 入力完了チェック
			+ '?,' // 入力者ID
			+ '?,'	// 確認日
			+ '?,'			// 確認完了チェック
			+ '?,' // 確認者ID
			+ '?,'			// 作成日
			+ '?,'			// 作成者ID
//			+ '?,'			// 更新日
			+ '?'			// 更新者ID
			+ ')'
			;
	// SQL実行
	connection.query(sql, [
			entry.entry_no, // 案件No
			entry.base_cd, // 拠点CD
			entry.entry_title, // 案件名
			entry.inquiry_date, // 問合せ日
			entry.entry_status, // 案件ステータス
			entry.quote_no, // 見積番号
			entry.quote_issue_date, // 見積書発行日
			entry.order_accepted_date, // 受注日付
			entry.order_accept_check, // 仮受注日チェック
			entry.acounting_period_no, // 会計期No
			entry.order_type, // 受託区分
			entry.contract_type, // 契約区分
			entry.outsourcing_cd, // 委託先CD
			entry.division, // 事業部ID
			entry.entry_amount_price, // 案件合計金額
			entry.entry_amount_billing, // 案件請求合計金額
			entry.entry_amount_deposit, // 案件入金合計金額
			entry.monitors_cost_prep_limit, // 被験者費用準備期日
			entry.monitors_cost_prep_comp, // 被験者費用準備完了日
			entry.drc_substituted_amount, // DRC立替準備金額
			entry.prior_payment_limit, // 事前入金期日
			entry.prior_payment_accept, // 事前入金日
			entry.person_id, // 担当者ID
			entry.delete_check, // 削除フラグ
			entry.delete_reason, // 削除理由
			entry.input_check_date, // 入力日
			entry.input_check, // 入力完了チェック
			entry.input_operator_id, // 入力者ID
			entry.confirm_check_date, // 確認日
			entry.confirm_check, // 確認完了チェック
			entry.confirm_operator_id, // 確認者ID
			dateCheck(created), // 作成日
			created_id,			// 作成者ID
//			dateCheck(updated), // 更新日
			updated_id			// 更新者ID
		], function (err, rows) {
		if (err) throw err;
		console.log(rows);
		//connection.destory();
		connection.release();
		res.send(entry);
	});
};

// 案件データを更新
var updateEntryInfo = function(entry, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = "tanaka";
	var sql = 'UPDATE drc_sch.entry_info SET ' 
			+ 'base_cd = ?,' // 拠点CD
			+ 'entry_title = ?,' // 案件名
			+ 'inquiry_date = ?,' // 問合せ日
			+ 'entry_status = ?,' // 案件ステータス
			+ 'quote_no = ?,' // 見積番号
			+ 'quote_issue_date = ?,' // 見積書発行日
			+ 'order_accepted_date = ?,' // 受注日付
			+ 'order_accept_check = ?,' // 仮受注日チェック
			+ 'acounting_period_no = ?,' // 会計期No
			+ 'order_type = ?,' // 受託区分
			+ 'contract_type = ?,' // 契約区分
			+ 'outsourcing_cd = ?,' // 委託先CD
			+ 'division = ?,' // 事業部ID
			+ 'entry_amount_price = ?,' // 案件合計金額
			+ 'entry_amount_billing = ?,' // 案件請求合計金額
			+ 'entry_amount_deposit = ?,' // 案件入金合計金額
			+ 'monitors_cost_prep_limit = ?,' // 被験者費用準備期日
			+ 'monitors_cost_prep_comp = ?,' // 被験者費用準備完了日
			+ 'drc_substituted_amount = ?,' // DRC立替準備金額
			+ 'prior_payment_limit = ?,' // 事前入金期日
			+ 'prior_payment_accept = ?,' // 事前入金日
			+ 'person_id = ?,' // 担当者ID
			+ 'delete_check = ?,' // 削除フラグ
			+ 'delete_reason = ?,' // 削除理由
			+ 'input_check_date = ?,' // 入力日
			+ 'input_check = ?,' // 入力完了チェック
			+ 'input_operator_id = ?,' // 入力者ID
			+ 'confirm_check_date = ?,' // 確認日
			+ 'confirm_check = ?,' // 確認完了チェック
			+ 'confirm_operator_id = ?,' // 確認者ID
//			+ 'updated = ?,' // 更新日
			+ 'updated_id = ?' // 更新者ID
			+ ' WHERE entry_no = ?';

	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, [
			entry.base_cd, // 拠点CD
			entry.entry_title, // 案件名
			entry.inquiry_date, // 問合せ日
			entry.entry_status, // 案件ステータス
			entry.quote_no, // 見積番号
			entry.quote_issue_date, // 見積書発行日
			entry.order_accepted_date, // 受注日付
			entry.order_accept_check, // 仮受注日チェック
			entry.acounting_period_no, // 会計期No
			entry.order_type, // 受託区分
			entry.contract_type, // 契約区分
			entry.outsourcing_cd, // 委託先CD
			entry.division, // 事業部ID
			entry.entry_amount_price, // 案件合計金額
			entry.entry_amount_billing, // 案件請求合計金額
			entry.entry_amount_deposit, // 案件入金合計金額
			entry.monitors_cost_prep_limit, // 被験者費用準備期日
			entry.monitors_cost_prep_comp, // 被験者費用準備完了日
			entry.drc_substituted_amount, // DRC立替準備金額
			entry.prior_payment_limit, // 事前入金期日
			entry.prior_payment_accept, // 事前入金日
			entry.person_id, // 担当者ID
			entry.delete_check, // 削除フラグ
			entry.delete_reason, // 削除理由
			entry.input_check_date, // 入力日
			entry.input_check, // 入力完了チェック
			entry.input_operator_id, // 入力者ID
			entry.confirm_check_date, // 確認日
			entry.confirm_check, // 確認完了チェック
			entry.confirm_operator_id, // 確認者ID
//			dateCheck(updated), // 更新日
			updated_id,			// 更新者ID
			entry.entry_no // 案件No
		], function (err, rows) {
			if (err) throw err;
			console.log(rows);
			connection.release();
			res.send(entry);
		});
	});
};

// 日付＋連番の文字列を生成する
var getDateNo = function(count,separator) {
	var dt = tools.getToday('{0}{1}{2}').substring(2);
	var c = '';
	if (count < 10) {
		c = '00' + count;
	} else if (count < 100) {
		c = '0' + count;
	} else {
		c = count;
	}
	return dt + separator + c;
};
// 日付項目のチェックと値変換
var dateCheck = function (dt) {
	var rtn = null;
	if ((dt === '') || (dt === null)) {
		rtn = null;
	} else {
		rtn = dt;
	}
	return rtn;
};

var entry_check = function (entry) {
	// 日付項目チェック
	entry.inquiry_date = dateCheck(entry.inquiry_date);
	entry.quote_issue_date = dateCheck(entry.quote_issue_date);
	entry.order_accepted_date = dateCheck(entry.order_accepted_date);
	entry.monitors_cost_prep_limit = dateCheck(entry.monitors_cost_prep_limit);
	entry.monitors_cost_prep_comp = dateCheck(entry.monitors_cost_prep_comp);
	entry.prior_payment_limit = dateCheck(entry.prior_payment_limit);
	entry.prior_payment_accept = dateCheck(entry.prior_payment_accept);
	entry.input_check_date = dateCheck(entry.input_check_date);
	entry.confirm_check_date = dateCheck(entry.confirm_check_date);
	// 数値変換
	entry.order_accept_check = Number(entry.order_accept_check);
	entry.acounting_period_no = Number(entry.acounting_period_no);
	entry.order_type = Number(entry.order_type);
	entry.contract_type = Number(entry.contract_type);
	entry.entry_amount_price = Number(entry.entry_amount_price);
	entry.entry_amount_billing = Number(entry.entry_amount_billing);
	entry.entry_amount_deposit = Number(entry.entry_amount_deposit);
	entry.drc_substituted_amount = Number(entry.drc_substituted_amount);

	entry.delete_check = Number(entry.delete_check);
	entry.input_check = Number(entry.input_check);
	entry.confirm_check = Number(entry.confirm_check);
	return entry;
};

// 試験（見積）明細のPOST
exports.quote_post = function (req, res) {
	var quote = quote_check(req.body);
	pool.getConnection(function (err, connection) {
		if (quote.quote_detail_no === '') {
			// 試験（見積）明細データのDB追加
			// 試験（見積）明細番号を取得してデータを追加する
			getQuoteDetailNo(connection, quote, res);
		} else {
			// 案件データの更新
			updateQuote(connection, quote, res);
		}
		connection.release();
	});
};

// 試験（見積）明細の追加（見積番号が未取得の場合）
var getQuoteNo = function(connection, quote, res) {
	var rtn = "";
	var count = 1;
	var now = tools.getToday("{0}/{1}/{2}");
	var sql = 'SELECT quote_count FROM drc_sch.quote_number WHERE quote_date = ?';
	// SQL実行（見積Noを決めるため）
	connection.query(sql, [now], function (err, rows) {
		if (err) throw err;
		if (rows.length === 0) {
			// その日の見積登録カウントが未登録なら追加する
			sql = 'INSERT INTO drc_sch.quote_number (quote_date,quote_count) VALUES (?,?)';
			connection.query(sql, [now,count], function (err, rows) {
				if (err) throw err;
				// 見積番号の生成				
				quote.quote_no = getDateNo(count, '');
				// 試験（見積）明細番号を取得してデータを追加する
				getQuoteDetailNo(connection, quote, res);
			});
		} else {
			// 見積カウントの登録あり
			for (var i in rows) {
				count = rows[i].quote_count;
			}
			// 見積カウントの更新
			count++;
			sql = 'UPDATE drc_sch.quote_number SET quote_count = ? WHERE quote_date = ?';
			// 見積番号の生成				
			quote.quote_no = getDateNo(count, '');
			// 試験（見積）明細番号を取得してデータを追加する
			getQuoteDetailNo(connection, quote, res);
		}
	});
};

// 試験（見積）明細番号の取得とデータの追加
var getQuoteDetailNo = function (connection, quote, res) {
	var count = 1;
	var sql = 'SELECT quote_detail_count FROM drc_sch.quote_detail_number WHERE entry_no = ?';
	connection.query(sql, [quote.entry_no], function (err, rows) {
		if (err) throw err;
		// 案件に対して明細番号がまだ振り出されていない場合は、1をテーブルに追加して振り出す
		// 既に振り出されている場合は番号を1加算して更新してからその番号を振り出す
		if (rows.length === 0) {
			// 明細No管理データを追加する
			sql = 'INSERT INTO drc_sch.quote_detail_number (quote_no,quote_detail_count,entry_no) VALUES (?,?,?)';
			connection.query(sql, [quote.quote_no,count,quote.entry_no], function (err, rows) {
				if (err) throw err;
				// 試験（見積）明細の追加
				quote.quote_detail_no = count;
				insertQuote(connection, quote, count, res);
			});
			
		} else {
			// 明細登録カウントの更新
			count++;
			sql = 'UPDATE drc_sch.quote_detail_number SET quote_detail_count = ? WHERE entry_no = ?';
			connection.query(sql, [count,quote.quote_no], function (err, rows) {
				if (err) throw err;
				// 試験（見積）明細の追加
				quote.quote_detail_no = count;
				insertQuote(connection, quote, count, res);
			});
		}
	});
};

// 試験（見積）明細データの追加
var insertQuote = function (connection, quote, count, res) {
	quote.quote_detail_no = ('000' + count).slice(-3);
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = "tanaka";
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.quote_info (' 
			+ "entry_no," // 案件No
			+ "quote_no," // 見積番号
			+ "quote_detail_no," // 明細番号
			+ "test_item_cd," // 試験項目CD
			+ "test_item,"		// 試験項目名
			+ "sample_name," // 試料名
			+ "arrive_date," // 到着日
			+ "test_planning_no," // 試験計画書番号
			+ "monitors_num," // 被験者数
			+ "sample_volume," // 検体数
			+ "final_report_no," // 報告書番号
			+ "final_report_limit," // 報告書提出期限
			+ "final_report_date," // 報告書提出日
			+ "quick_report_limit1," // 速報提出期限1
			+ "quick_report_date1," // 速報提出日1
			+ "quick_report_limit2," // 速報提出期限2
			+ "quick_report_date2," // 速報提出日2
			+ "expect_value," // 期待値・設定値
			+ "descript_value," // 値説明
			+ "unit_cd," // 単位CD
			+ "unit," // 単位
			+ "unit_price," // 単価
			+ "quantity," // 数量
			+ "quote_price," // 見積金額
			+ "test_memo," // 備考
			+ "quote_delete_check," // 削除フラグ
			+ "quote_delete_reason," // 削除理由
			+ "created," // 作成日
			+ "created_id," // 作成者ID
			+ "updated," // 更新日
			+ "updated_id" // 更新者ID
			+ ") values (" 
			+ "?," // 案件No
			+ "?," // 見積番号
			+ "?," // 明細番号
			+ "?," // 試験項目CD
			+ "?," // 試験項目名
			+ "?," // 試料名
			+ "?," // 到着日
			+ "?," // 試験計画書番号
			+ "?," // 被験者数
			+ "?," // 検体数
			+ "?," // 報告書番号
			+ "?," // 報告書提出期限
			+ "?," // 報告書提出日
			+ "?," // 速報提出期限1
			+ "?," // 速報提出日1
			+ "?," // 速報提出期限2
			+ "?," // 速報提出日2
			+ "?," // 期待値・設定値
			+ "?," // 値説明
			+ "?," // 単位CD
			+ "?," // 単位
			+ "?," // 単価
			+ "?," // 数量
			+ "?," // 見積金額
			+ "?," // 備考
			+ "?," // 削除フラグ
			+ "?," // 削除理由
			+ "?," // 作成日
			+ "?," // 作成者ID
			+ "?," // 更新日
			+ "?" // 更新者ID
			+ ")";
	// SQL実行
	connection.query(sql, [
			quote.entry_no, // 案件No
			quote.quote_no, // 見積番号
			quote.quote_detail_no, // 明細番号
			quote.test_item_cd, // 試験項目CD
			quote.test_item,	// 試験項目名
			quote.sample_name,	// 試料名
			quote.arrive_date, // 到着日
			quote.test_planning_no, // 試験計画書番号
			quote.monitors_num, // 被験者数
			quote.sample_volume, // 検体数
			quote.final_report_no, // 報告書番号
			quote.final_report_limit, // 報告書提出期限
			quote.final_report_date, // 報告書提出日
			quote.quick_report_limit1, // 速報提出期限1
			quote.quick_report_date1, // 速報提出日1
			quote.quick_report_limit2, // 速報提出期限2
			quote.quick_report_date2, // 速報提出日2
			quote.expect_value, // 期待値・設定値
			quote.descript_value, // 値説明
			quote.unit_cd, // 単位CD
			quote.unit, // 単位
			quote.unit_price, // 単価
			quote.quantity, // 数量
			quote.quote_price, // 見積金額
			quote.test_memo, // 備考
			quote.quote_delete_check, // 削除フラグ
			quote.quote_delete_reason, // 削除理由
			created, // 作成日
			created_id, // 作成者ID
			updated, // 更新日
			updated_id // 更新者ID
		], function (err, rows) {
		if (err) throw err;
		console.log(rows);
		res.send(quote);
	});
};

// 試験（見積）明細データの更新
var updateQuote = function (connection,quote, res) {
	var updated_id = "tanaka";
	var sql = 'UPDATE drc_sch.quote_info SET ' 
			+ "test_item_cd  = ?," // 試験項目CD
			+ "test_item = ?," // 試験項目名
			+ "sample_name = ?," // 試料名
			+ "arrive_date = ?," // 到着日
			+ "test_planning_no = ?," // 試験計画書番号
			+ "monitors_num = ?," // 被験者数
			+ "sample_volume = ?," // 検体数
			+ "final_report_no = ?," // 報告書番号
			+ "final_report_limit = ?," // 報告書提出期限
			+ "final_report_date = ?," // 報告書提出日
			+ "quick_report_limit1 = ?," // 速報提出期限1
			+ "quick_report_date1 = ?," // 速報提出日1
			+ "quick_report_limit2 = ?," // 速報提出期限2
			+ "quick_report_date2 = ?," // 速報提出日2
			+ "expect_value = ?," // 期待値・設定値
			+ "descript_value = ?," // 値説明
			+ "unit_cd = ?," // 単位CD
			+ "unit = ?," // 単位
			+ "unit_price = ?," // 単価
			+ "quantity = ?," // 数量
			+ "quote_price = ?," // 見積金額
			+ "test_memo = ?," // 備考
			+ "quote_delete_check = ?," // 削除フラグ
			+ "quote_delete_reason = ?," // 削除理由
			+ "updated_id = ? WHERE entry_no = ? AND quote_detail_no = ?"; // 更新者ID
	// SQL実行
	connection.query(sql, [
			quote.test_item_cd, // 試験項目CD
			quote.test_item,	// 試験項目名
			quote.sample_name,	// 試料名
			quote.arrive_date, // 到着日
			quote.test_planning_no, // 試験計画書番号
			quote.monitors_num, // 被験者数
			quote.sample_volume, // 検体数
			quote.final_report_no, // 報告書番号
			quote.final_report_limit, // 報告書提出期限
			quote.final_report_date, // 報告書提出日
			quote.quick_report_limit1, // 速報提出期限1
			quote.quick_report_date1, // 速報提出日1
			quote.quick_report_limit2, // 速報提出期限2
			quote.quick_report_date2, // 速報提出日2
			quote.expect_value, // 期待値・設定値
			quote.descript_value, // 値説明
			quote.unit_cd, // 単位CD
			quote.unit, // 単位
			quote.unit_price, // 単価
			quote.quantity, // 数量
			quote.quote_price, // 見積金額
			quote.test_memo, // 備考
			quote.quote_delete_check, // 削除フラグ
			quote.quote_delete_reason, // 削除理由
			updated_id, // 更新者ID
			quote.entry_no,				// 見積番号
			quote.quote_detail_no		// 明細番号
		], function (err, rows) {
		if (err) throw err;
		console.log(rows);
		res.send(quote);
	});
};

var quote_check = function (quote) {
	quote.arrive_date = dateCheck(quote.arrive_date); // 到着日
	quote.monitors_num = Number(quote.monitors_num); // 被験者数
	quote.sample_volume = Number(quote.sample_volume); // 検体数
	quote.final_report_limit = dateCheck(quote.final_report_limit); // 報告書提出期限
	quote.final_report_date = dateCheck(quote.final_report_date); // 報告書提出日
	quote.quick_report_limit1 = dateCheck(quote.quick_report_limit1); // 速報提出期限1
	quote.quick_report_date1 = dateCheck(quote.quick_report_date1); // 速報提出日1
	quote.quick_report_limit2 = dateCheck(quote.quick_report_limit2); // 速報提出期限2
	quote.quick_report_date2 = dateCheck(quote.quick_report_date2); // 速報提出日2
	quote.expect_value = Number(quote.expect_value); // 期待値・設定値
	quote.unit_price = Number(quote.unit_price); // 単価
	quote.quantity = Number(quote.quantity); // 数量
	quote.quote_price = Number(quote.quote_price); // 見積金額
	quote.quote_delete_check = Number(quote.quote_delete_check); // 削除フラグ
	return quote;
};
