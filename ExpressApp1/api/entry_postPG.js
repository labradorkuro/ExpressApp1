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
		getEntryNo(entry, req, res);
	} else {
		// 案件データの更新
		updateEntryInfo(entry, req, res);
	}
};

// 案件番号の取得
var getEntryNo = function (entry, req, res){
	var rtn = "";
	var count = 1;
	var now = tools.getToday("{0}/{1}/{2}");
	var sql = 'SELECT entry_count FROM drc_sch.entry_number WHERE entry_date = $1';
	// SQL実行
	var rows = [];
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [now]);
		query.on('row' , function (row) {
			rows.push(row);
		});
		query.on('end', function (result, err) {
			if (rows.length == 0) {
				// その日のカウントが未登録
				sql = 'INSERT INTO drc_sch.entry_number (entry_date,entry_count) VALUES ($1,$2)';
				query = connection.query(sql, [now,count]);
				query.on('end', function (result, err) {
					insertEntryInfo(connection, entry, count, req, res);
				});
				query.on('error', function (error) {
					console.log(sql + ' ' + error);
					res.render('tables', { title: 'DRC 試験スケジュール管理 error!!' });
				});
			} else {
				// カウントの登録あり
				for (var i in rows) {
					count = rows[i].entry_count;
				}
				// カウントの更新
				count++;
				sql = 'UPDATE drc_sch.entry_number SET entry_count = $1 WHERE entry_date = $2';
				query = connection.query(sql, [count,now]);
				query.on('end', function (result, err) {
					insertEntryInfo(connection, entry, count, req, res);
				});
				query.on('error', function (error) {
					console.log(sql + ' ' + error);
					res.render('tables', { title: 'DRC 試験スケジュール管理 error!!' });
				});
			}
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
			res.render('tables', { title: 'DRC 試験スケジュール管理 error!!' });
		});
//		if (err) throw err;
	});
};
// 案件データをDBに追加
var insertEntryInfo = function(connection, entry, count, req, res) {
	entry.entry_no = getDateNo(count, '-');
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
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
			+ "pay_planning_date_1,"			// 分割請求日1
			+ "pay_complete_date_1,"			// 分割入金日1
			+ "pay_amount_1,"					// 分割支払合計金額1 
			+ "pay_result_1,"					// 分割請求区分1
			+ "pay_planning_date_2,"			// 分割請求日2
			+ "pay_complete_date_2,"			// 分割入金日2
			+ "pay_amount_2,"					// 分割支払合計金額2 
			+ "pay_result_2,"					// 分割請求区分2
			+ "pay_planning_date_3,"			// 分割請求日3
			+ "pay_complete_date_3,"			// 分割入金日3
			+ "pay_amount_3,"					// 分割支払合計金額3
			+ "pay_result_3,"					// 分割請求区分3
			+ "pay_planning_date_4,"			// 分割請求日4
			+ "pay_complete_date_4,"			// 分割入金日4
			+ "pay_amount_4,"					// 分割支払合計金額4
			+ "pay_result_4,"					// 分割請求区分4
			+ "pay_planning_date_5,"			// 分割請求日5
			+ "pay_complete_date_5,"			// 分割入金日5
			+ "pay_amount_5,"					// 分割支払合計金額5
			+ "pay_result_5,"					// 分割請求区分5
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
			+ '$1,'		// 案件No
			+ '$2,'		// 拠点CD
			+ '$3,'	// 案件名
			+ '$4,'			// 問合せ日
			+ '$5,'	// 案件ステータス
			+ '$6,'		// 見積番号
			+ '$7,'		// 見積書発行日
			+ '$8,'	// 受注日付
			+ '$9,'	// 仮受注日チェック
			+ '$10,'	// 会計期No
			+ '$11,'			// 受託区分
			+ '$12,'			// 契約区分
			+ '$13,' // 委託先CD
			+ '$14,'		// 事業部ID
			+ '$15,'	// 案件合計金額
			+ '$16,'	// 案件請求合計金額
			+ '$17,'	// 案件入金合計金額
			+ '$18,' // 被験者費用準備期日
			+ '$19,' // 被験者費用準備完了日
			+ '$20,'// DRC立替準備金額
			+ '$21,'	// 事前入金期日
			+ '$22,'	// 事前入金日
			+ "$23," // 分割請求日1
			+ "$24," // 分割入金日1
			+ "$25," // 分割支払合計金額1 
			+ "$26," // 分割請求区分1
			+ "$27," // 分割請求日2
			+ "$28," // 分割入金日2
			+ "$29," // 分割支払合計金額2 
			+ "$30," // 分割請求区分2
			+ "$31," // 分割請求日3
			+ "$32," // 分割入金日3
			+ "$33," // 分割支払合計金額3
			+ "$34," // 分割請求区分3
			+ "$35," // 分割請求日4
			+ "$36," // 分割入金日4
			+ "$37," // 分割支払合計金額4
			+ "$38," // 分割請求区分4
			+ "$39," // 分割請求日5
			+ "$40," // 分割入金日5
			+ "$41," // 分割支払合計金額5
			+ "$42," // 分割請求区分5
			+ '$43,'		// 担当者ID
			+ '$44,'			// 削除フラグ
			+ '$45,'	// 削除理由
			+ '$46,'		// 入力日
			+ '$47,'			// 入力完了チェック
			+ '$48,' // 入力者ID
			+ '$49,'	// 確認日
			+ '$50,'			// 確認完了チェック
			+ '$51,' // 確認者ID
			+ '$52,'			// 作成日
			+ '$53,'			// 作成者ID
//			+ '?,'			// 更新日
			+ '$54'			// 更新者ID
			+ ')'
			;
	// SQL実行
	var query = connection.query(sql, [
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
			entry.pay_planning_date_1,	// 分割請求日1
			entry.pay_complete_date_1,	// 分割入金日1
			entry.pay_amount_1,			// 分割支払合計金額1
			entry.pay_result_1,			// 分割請求区分1
			entry.pay_planning_date_2,	// 分割請求日2
			entry.pay_complete_date_2,	// 分割入金日2
			entry.pay_amount_2,			// 分割支払合計金額2
			entry.pay_result_2,			// 分割請求区分2
			entry.pay_planning_date_3,	// 分割請求日3
			entry.pay_complete_date_3,	// 分割入金日3
			entry.pay_amount_3,			// 分割支払合計金額3
			entry.pay_result_3,			// 分割請求区分3
			entry.pay_planning_date_4,	// 分割請求日4
			entry.pay_complete_date_4,	// 分割入金日4
			entry.pay_amount_4,			// 分割支払合計金額4
			entry.pay_result_4,			// 分割請求区分4
			entry.pay_planning_date_5,	// 分割請求日5
			entry.pay_complete_date_5,	// 分割入金日5
			entry.pay_amount_5,			// 分割支払合計金額5
			entry.pay_result_5,			// 分割請求区分5
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
		]);
	query.on('end', function (result, err) {
		connection.end();
		res.send(entry);
	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};

// 案件データを更新
var updateEntryInfo = function(entry, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.entry_info SET ' 
			+ 'base_cd = $1,' // 拠点CD
			+ 'entry_title = $2,' // 案件名
			+ 'inquiry_date = $3,' // 問合せ日
			+ 'entry_status = $4,' // 案件ステータス
			+ 'quote_no = $5,' // 見積番号
			+ 'quote_issue_date = $6,' // 見積書発行日
			+ 'order_accepted_date = $7,' // 受注日付
			+ 'order_accept_check = $8,' // 仮受注日チェック
			+ 'acounting_period_no = $9,' // 会計期No
			+ 'order_type = $10,' // 受託区分
			+ 'contract_type = $11,' // 契約区分
			+ 'outsourcing_cd = $12,' // 委託先CD
			+ 'division = $13,' // 事業部ID
			+ 'entry_amount_price = $14,' // 案件合計金額
			+ 'entry_amount_billing = $15,' // 案件請求合計金額
			+ 'entry_amount_deposit = $16,' // 案件入金合計金額
			+ 'monitors_cost_prep_limit = $17,' // 被験者費用準備期日
			+ 'monitors_cost_prep_comp = $18,' // 被験者費用準備完了日
			+ 'drc_substituted_amount = $19,' // DRC立替準備金額
			+ 'prior_payment_limit = $20,' // 事前入金期日
			+ 'prior_payment_accept = $21,' // 事前入金日
			+ "pay_planning_date_1 = $22," // 分割請求日2
			+ "pay_complete_date_1 = $23," // 分割入金日2
			+ "pay_amount_1 = $24," // 分割支払合計金額1 
			+ "pay_result_1 = $25," // 分割請求区分1
			+ "pay_planning_date_2 = $26," // 分割請求日2
			+ "pay_complete_date_2 = $27," // 分割入金日2
			+ "pay_amount_2 = $28," // 分割支払合計金額2 
			+ "pay_result_2 = $29," // 分割請求区分2
			+ "pay_planning_date_3 = $30," // 分割請求日3
			+ "pay_complete_date_3 = $31," // 分割入金日3
			+ "pay_amount_3 = $32," // 分割支払合計金額3
			+ "pay_result_3 = $33," // 分割請求区分3
			+ "pay_planning_date_4 = $34," // 分割請求日4
			+ "pay_complete_date_4 = $35," // 分割入金日4
			+ "pay_amount_4 = $36," // 分割支払合計金額4
			+ "pay_result_4 = $37," // 分割請求区分4
			+ "pay_planning_date_5 = $38," // 分割請求日5
			+ "pay_complete_date_5 = $39," // 分割入金日5
			+ "pay_amount_5 = $40," // 分割支払合計金額5
			+ "pay_result_5 = $41," // 分割請求区分5
			+ 'person_id = $42,' // 担当者ID
			+ 'delete_check = $43,' // 削除フラグ
			+ 'delete_reason = $44,' // 削除理由
			+ 'input_check_date = $45,' // 入力日
			+ 'input_check = $46,' // 入力完了チェック
			+ 'input_operator_id = $47,' // 入力者ID
			+ 'confirm_check_date = $48,' // 確認日
			+ 'confirm_check = $49,' // 確認完了チェック
			+ 'confirm_operator_id = $50,' // 確認者ID
//			+ 'updated = ?,' // 更新日
			+ 'updated_id = $51' // 更新者ID
			+ ' WHERE entry_no = $52';

	// SQL実行
	pg.connect(connectionString,function (err, connection) {
		var query = connection.query(sql, [
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
			entry.pay_planning_date_1,	// 分割請求日1
			entry.pay_complete_date_1,	// 分割入金日1
			entry.pay_amount_1,			// 分割支払合計金額1
			entry.pay_result_1,			// 分割請求区分1
			entry.pay_planning_date_2,	// 分割請求日2
			entry.pay_complete_date_2,	// 分割入金日2
			entry.pay_amount_2,			// 分割支払合計金額2
			entry.pay_result_2,			// 分割請求区分2
			entry.pay_planning_date_3,	// 分割請求日3
			entry.pay_complete_date_3,	// 分割入金日3
			entry.pay_amount_3,			// 分割支払合計金額3
			entry.pay_result_3,			// 分割請求区分3
			entry.pay_planning_date_4,	// 分割請求日4
			entry.pay_complete_date_4,	// 分割入金日4
			entry.pay_amount_4,			// 分割支払合計金額4
			entry.pay_result_4,			// 分割請求区分4
			entry.pay_planning_date_5,	// 分割請求日5
			entry.pay_complete_date_5,	// 分割入金日5
			entry.pay_amount_5,			// 分割支払合計金額5
			entry.pay_result_5,			// 分割請求区分5
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
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(entry);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
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
	entry.pay_planning_date_1 = dateCheck(entry.pay_planning_date_1);	// 分割請求日1
	entry.pay_complete_date_1 = dateCheck(entry.pay_complete_date_1);	// 分割入金日1
	entry.pay_planning_date_2 = dateCheck(entry.pay_planning_date_2);	// 分割請求日2
	entry.pay_complete_date_2 = dateCheck(entry.pay_complete_date_2);	// 分割入金日2
	entry.pay_planning_date_3 = dateCheck(entry.pay_planning_date_3);	// 分割請求日3
	entry.pay_complete_date_3 = dateCheck(entry.pay_complete_date_3);	// 分割入金日3
	entry.pay_planning_date_4 = dateCheck(entry.pay_planning_date_4);	// 分割請求日4
	entry.pay_complete_date_4 = dateCheck(entry.pay_complete_date_4);	// 分割入金日4
	entry.pay_planning_date_5 = dateCheck(entry.pay_planning_date_5);	// 分割請求日5
	entry.pay_complete_date_5 = dateCheck(entry.pay_complete_date_5);	// 分割入金日5
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
	
	entry.pay_result_1 = Number(entry.pay_result_1);			// 分割支払区分1
	entry.pay_result_2 = Number(entry.pay_result_2);			// 分割支払区分2
	entry.pay_result_3 = Number(entry.pay_result_3);			// 分割支払区分3
	entry.pay_result_4 = Number(entry.pay_result_4);			// 分割支払区分4
	entry.pay_result_5 = Number(entry.pay_result_5);			// 分割支払区分5
	
	entry.pay_amount_1 = Number(entry.pay_amount_1);			// 分割支払合計金額1
	entry.pay_amount_2 = Number(entry.pay_amount_2);			// 分割支払合計金額2
	entry.pay_amount_3 = Number(entry.pay_amount_3);			// 分割支払合計金額3
	entry.pay_amount_4 = Number(entry.pay_amount_4);			// 分割支払合計金額4
	entry.pay_amount_5 = Number(entry.pay_amount_5);			// 分割支払合計金額5
	return entry;
};

// 試験（見積）明細のPOST
exports.quote_post = function (req, res) {
	var quote = quote_check(req.body);
	pg.connect(connectionString,function (err, connection) {
		if (quote.quote_detail_no === '') {
			// 試験（見積）明細データのDB追加
			// 試験（見積）明細番号を取得してデータを追加する
			getQuoteDetailNo(connection, quote, req, res);
		} else {
			// 案件データの更新
			updateQuote(connection, quote, req, res);
		}
	});
};

// 試験（見積）明細の追加（見積番号が未取得の場合）
var getQuoteNo = function(connection, quote, req, res) {
	var rtn = "";
	var count = 1;
	var now = tools.getToday("{0}/{1}/{2}");
	var sql = 'SELECT quote_count FROM drc_sch.quote_number WHERE quote_date = $1';
	var rows = [];	
	// SQL実行（見積Noを決めるため）
	var query = connection.query(sql, [now]);
	query.on('row' , function (row) {
		rows.push(row);
	});
	query.on('end', function (result, err) {
		if (rows.length === 0) {
			// その日の見積登録カウントが未登録なら追加する
			sql = 'INSERT INTO drc_sch.quote_number (quote_date,quote_count) VALUES ($1,$2)';
			query = connection.query(sql, [now,count]);
			query.on('end', function (result, err) {
				// 見積番号の生成				
				quote.quote_no = getDateNo(count, '');
				// 試験（見積）明細番号を取得してデータを追加する
				getQuoteDetailNo(connection, quote, req, res);
			});
			query.on('error', function (error) {
				console.log(sql + ' ' + error);
			});
		} else {
			// 見積カウントの登録あり
			for (var i in rows) {
				count = rows[i].quote_count;
			}
			// 見積カウントの更新
			count++;
			// 見積番号の生成				
			quote.quote_no = getDateNo(count, '');
			// 試験（見積）明細番号を取得してデータを追加する
			getQuoteDetailNo(connection, quote, req, res);
		}
	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};

// 試験（見積）明細番号の取得とデータの追加
var getQuoteDetailNo = function (connection, quote, req, res) {
	var count = 1;
	var sql = 'SELECT quote_detail_count FROM drc_sch.quote_detail_number WHERE entry_no = $1';
	var rows = [];	
	var query = connection.query(sql, [quote.entry_no]);
	query.on('row' , function (row) {
		rows.push(row);
	});
	query.on('end', function (result, err) {
		// 案件に対して明細番号がまだ振り出されていない場合は、1をテーブルに追加して振り出す
		// 既に振り出されている場合は番号を1加算して更新してからその番号を振り出す
		if (rows.length === 0) {
			// 明細No管理データを追加する
			sql = 'INSERT INTO drc_sch.quote_detail_number (quote_no,quote_detail_count,entry_no) VALUES ($1,$2,$3)';
			query = connection.query(sql, [quote.quote_no,count,quote.entry_no]);
			query.on('end', function (result, err) {
				// 試験（見積）明細の追加
				quote.quote_detail_no = count;
				insertQuote(connection, quote, count, req, res);
			});
			query.on('error', function (error) {
				console.log(sql + ' ' + error);
			});
			
		} else {
			// 明細登録カウントの更新
			count++;
			sql = 'UPDATE drc_sch.quote_detail_number SET quote_detail_count = $1 WHERE entry_no = $2';
			var query = connection.query(sql, [count,quote.quote_no]);
			query.on('end', function(result,err) {
				// 試験（見積）明細の追加
				quote.quote_detail_no = count;
				insertQuote(connection, quote, count, req, res);
			});
			query.on('error', function (error) {
				console.log(sql + ' ' + error);
			});
		}
	});
	query.on('error', function (err) {
	});
};

// 試験（見積）明細データの追加
var insertQuote = function (connection, quote, count, req, res) {
	quote.quote_detail_no = ('000' + count).slice(-3);
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
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
			+ "$1," // 案件No
			+ "$2," // 見積番号
			+ "$3," // 明細番号
			+ "$4," // 試験項目CD
			+ "$5," // 試験項目名
			+ "$6," // 試料名
			+ "$7," // 到着日
			+ "$8," // 試験計画書番号
			+ "$9," // 被験者数
			+ "$10," // 検体数
			+ "$11," // 報告書番号
			+ "$12," // 報告書提出期限
			+ "$13," // 報告書提出日
			+ "$14," // 速報提出期限1
			+ "$15," // 速報提出日1
			+ "$16," // 速報提出期限2
			+ "$17," // 速報提出日2
			+ "$18," // 期待値・設定値
			+ "$19," // 値説明
			+ "$20," // 単位CD
			+ "$21," // 単位
			+ "$22," // 単価
			+ "$23," // 数量
			+ "$24," // 見積金額
			+ "$25," // 備考
			+ "$26," // 削除フラグ
			+ "$27," // 削除理由
			+ "$28," // 作成日
			+ "$29," // 作成者ID
			+ "$30," // 更新日
			+ "$31" // 更新者ID
			+ ")";
	// SQL実行
	var query = connection.query(sql, [
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
		]);
	query.on('end', function(result,err) {
//		console.log(result);
		connection.end();
		res.send(quote);
	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};

// 試験（見積）明細データの更新
var updateQuote = function (connection,quote, req, res) {
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.quote_info SET ' 
			+ "test_item_cd  = $1," // 試験項目CD
			+ "test_item = $2," // 試験項目名
			+ "sample_name = $3," // 試料名
			+ "arrive_date = $4," // 到着日
			+ "test_planning_no = $5," // 試験計画書番号
			+ "monitors_num = $6," // 被験者数
			+ "sample_volume = $7," // 検体数
			+ "final_report_no = $8," // 報告書番号
			+ "final_report_limit = $9," // 報告書提出期限
			+ "final_report_date = $10," // 報告書提出日
			+ "quick_report_limit1 = $11," // 速報提出期限1
			+ "quick_report_date1 = $12," // 速報提出日1
			+ "quick_report_limit2 = $13," // 速報提出期限2
			+ "quick_report_date2 = $14," // 速報提出日2
			+ "expect_value = $15," // 期待値・設定値
			+ "descript_value = $16," // 値説明
			+ "unit_cd = $17," // 単位CD
			+ "unit = $18," // 単位
			+ "unit_price = $19," // 単価
			+ "quantity = $20," // 数量
			+ "quote_price = $21," // 見積金額
			+ "test_memo = $22," // 備考
			+ "quote_delete_check = $23," // 削除フラグ
			+ "quote_delete_reason = $24," // 削除理由
			+ "updated_id = $25 WHERE entry_no = $26 AND quote_detail_no = $27"; // 更新者ID
	// SQL実行
	var query = connection.query(sql, [
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
		]);
	query.on('end', function(result,err) {
//		console.log(result);
		connection.end();
		res.send(quote);
	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
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
