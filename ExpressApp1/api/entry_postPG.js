﻿//
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
			+ 'quote_no,'						// 見積番号
			+ 'inquiry_date,'					// 問合せ日
			+ 'entry_status,'					// 案件ステータス
			+ 'sales_person_id,'				// 営業担当者ID
			+ 'agent_cd,'						// 代理店CD
			+ 'client_cd,'						// 得意先コード
			+ 'client_division_cd,'				// 得意先部署コード
			+ 'client_person_id,'				// 得意先担当者ID
			+ 'test_large_class_cd,'			// 試験大分類CD
			+ 'test_middle_class_cd,'			// 試験中分類CD
			+ 'entry_title,'					// 案件名
			+ 'order_type,'						// 受託区分
			+ 'outsourcing_cd,'					// 委託先CD
			+ 'order_accepted_date,'			// 受注日付
			+ 'order_accept_check,'				// 仮受注日チェック
			+ 'acounting_period_no,'			// 会計期No
			+ 'test_person_id,'					// 試験担当者ID
			+ 'entry_amount_price,'				// 案件合計金額
			+ 'entry_amount_billing,'			// 案件請求合計金額
			+ 'entry_amount_deposit,'			// 案件入金合計金額
			+ 'report_limit_date,'				// 報告書提出期限
			+ 'report_submit_date,'				// 報告書提出日
			+ 'prompt_report_limit_date_1,'		// 速報提出期限１
			+ 'prompt_report_submit_date_1,'	// 速報提出日１
			+ 'prompt_report_limit_date_2,'		// 速報提出期限２
			+ 'prompt_report_submit_date_2,'	// 速報提出日２
			+ 'entry_memo,'						// メモ
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
			+ 'updated,'						// 更新日
			+ 'updated_id'						// 更新者ID
			+ ') values (' 
			+ '$1,'		// 案件No
			+ '$2,'		// 見積番号
			+ '$3,'		// 問合せ日
			+ '$4,'		// 案件ステータス
			+ '$5,'		// 営業担当者ID
			+ '$6,'		// 代理店CD
			+ '$7,'		// 得意先CD
			+ '$8,'		// 得意先部署CD
			+ '$9,'		// 得意先担当者CD
			+ '$10,'	// 試験大分類
			+ '$11,'	// 試験中分類
			+ '$12,'	// 案件名
			+ '$13,'	// 受託区分
			+ '$14,'	// 委託先CD
			+ '$15,'	// 受注日
			+ '$16,'	// 仮受注チェック
			+ '$17,'	// 会計期No
			+ '$18,'	// 試験担当者ID
			+ '$19,'	// 案件合計金額
			+ '$20,'	// 案件請求合計金額
			+ '$21,'	// 案件入金合計金額
			+ '$22,'	// 報告書提出期限
			+ '$23,'	// 報告書提出日
			+ '$24,'	// 速報提出期限１
			+ '$25,'	// 速報提出日１
			+ '$26,'	// 速報提出期限２
			+ '$27,'	// 速報提出日２
			+ '$28,'	// メモ
			+ '$29,'	// 削除フラグ
			+ '$30,'	// 削除理由
			+ '$31,'	// 入力日
			+ '$32,'	// 入力完了チェック
			+ '$33,'	// 入力者ID
			+ '$34,'	// 確認日
			+ '$35,'	// 確認完了チェック
			+ '$36,'	// 確認者ID
			+ '$37,'	// 作成日
			+ '$38,'	// 作成者ID
			+ '$39,'	// 更新日
			+ '$40'		// 更新者ID
			+ ')'
			;
	// SQL実行
	var query = connection.query(sql, [
			entry.entry_no,					// 案件No
			entry.quote_no,					// 見積番号
			entry.inquiry_date,				// 問合せ日
			entry.entry_status,				// 案件ステータス
			entry.sales_person_id,			// 営業担当者ID
			entry.agent_cd,					// 代理店CD
			entry.client_cd,				// 得意先コード
			entry.client_division_cd,		// 得意先部署コード
			entry.client_person_id,			// 得意先担当者ID
			entry.test_large_class_cd,		// 試験大分類CD
			entry.test_middle_class_cd,		// 試験中分類CD
			entry.entry_title,				// 案件名
			entry.order_type,				// 受託区分
			entry.outsourcing_cd,			// 委託先CD
			entry.order_accepted_date,		// 受注日付
			entry.order_accept_check,		// 仮受注日チェック
			entry.acounting_period_no,		// 会計期No
			entry.test_person_id,			// 試験担当者ID
			entry.entry_amount_price,		// 案件合計金額
			entry.entry_amount_billing,		// 案件請求合計金額
			entry.entry_amount_deposit,		// 案件入金合計金額
			entry.report_limit_date,		// 報告書提出期限
			entry.report_submit_date,		// 報告書提出日
			entry.prompt_report_limit_date_1,	// 速報提出期限１
			entry.prompt_report_submit_date_1,	// 速報提出日１
			entry.prompt_report_limit_date_2,	// 速報提出期限２
			entry.prompt_report_submit_date_2,	// 速報提出日２
			entry.entry_memo,				// メモ
			entry.delete_check,				// 削除フラグ
			entry.delete_reason,			// 削除理由
			entry.input_check_date,			// 入力日
			entry.input_check,				// 入力完了チェック
			entry.input_operator_id,		// 入力者ID
			entry.confirm_check_date,		// 確認日
			entry.confirm_check,			// 確認完了チェック
			entry.confirm_operator_id,		// 確認者ID
			dateCheck(created),				// 作成日
			created_id,						// 作成者ID
			dateCheck(updated),				// 更新日
			updated_id						// 更新者ID
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
			+ 'quote_no = $1,'						// 見積番号
			+ 'inquiry_date = $2,'					// 問合せ日
			+ 'entry_status = $3,'					// 案件ステータス
			+ 'sales_person_id = $4,'				// 営業担当者ID
			+ 'agent_cd = $5,'						// 代理店CD
			+ 'client_cd = $6,'						// 得意先コード
			+ 'client_division_cd = $7,'			// 得意先部署コード
			+ 'client_person_id = $8,'				// 得意先担当者ID
			+ 'test_large_class_cd = $9,'			// 試験大分類CD
			+ 'test_middle_class_cd = $10,'			// 試験中分類CD
			+ 'entry_title = $11,'					// 案件名
			+ 'order_type = $12,'					// 受託区分
			+ 'outsourcing_cd = $13,'				// 委託先CD
			+ 'order_accepted_date = $14,'			// 受注日付
			+ 'order_accept_check = $15,'			// 仮受注日チェック
			+ 'acounting_period_no = $16,'			// 会計期No
			+ 'test_person_id = $17,'				// 試験担当者ID
			+ 'entry_amount_price = $18,'			// 案件合計金額
			+ 'entry_amount_billing = $19,'			// 案件請求合計金額
			+ 'entry_amount_deposit = $20,'			// 案件入金合計金額
			+ 'report_limit_date = $21,'			// 報告書提出期限
			+ 'report_submit_date = $22,'			// 報告書提出日
			+ 'prompt_report_limit_date_1 = $23,'	// 速報提出期限１
			+ 'prompt_report_submit_date_1 = $24,'	// 速報提出日１
			+ 'prompt_report_limit_date_2 = $25,'	// 速報提出期限２
			+ 'prompt_report_submit_date_2 = $26,'	// 速報提出日２
			+ 'entry_memo = $27,'					// メモ
			+ 'delete_check = $28,'					// 削除フラグ
			+ 'delete_reason = $29,'				// 削除理由
			+ 'input_check_date = $30,'				// 入力日
			+ 'input_check = $31,'					// 入力完了チェック
			+ 'input_operator_id = $32,'			// 入力者ID
			+ 'confirm_check_date = $33,'			// 確認日
			+ 'confirm_check = $34,'				// 確認完了チェック
			+ 'confirm_operator_id = $35,'			// 確認者ID
			+ 'updated = $36,'						// 更新日
			+ 'updated_id = $37'					// 更新者ID
			+ ' WHERE entry_no = $38';

	// SQL実行
	pg.connect(connectionString,function (err, connection) {
		var query = connection.query(sql, [
			entry.quote_no,					// 見積番号
			entry.inquiry_date,				// 問合せ日
			entry.entry_status,				// 案件ステータス
			entry.sales_person_id,			// 営業担当者ID
			entry.agent_cd,					// 代理店CD
			entry.client_cd,				// 得意先コード
			entry.client_division_cd,		// 得意先部署コード
			entry.client_person_id,			// 得意先担当者ID
			entry.test_large_class_cd,		// 試験大分類CD
			entry.test_middle_class_cd,		// 試験中分類CD
			entry.entry_title,				// 案件名
			entry.order_type,				// 受託区分
			entry.outsourcing_cd,			// 委託先CD
			entry.order_accepted_date,		// 受注日付
			entry.order_accept_check,		// 仮受注日チェック
			entry.acounting_period_no,		// 会計期No
			entry.test_person_id,			// 試験担当者ID
			entry.entry_amount_price,		// 案件合計金額
			entry.entry_amount_billing,		// 案件請求合計金額
			entry.entry_amount_deposit,		// 案件入金合計金額
			entry.report_limit_date,		// 報告書提出期限
			entry.report_submit_date,		// 報告書提出日
			entry.prompt_report_limit_date_1,		// 速報提出期限１
			entry.prompt_report_submit_date_1,	// 速報提出日１
			entry.prompt_report_limit_date_2,		// 速報提出期限２
			entry.prompt_report_submit_date_2,	// 速報提出日２
			entry.entry_memo,				// メモ
			entry.delete_check,				// 削除フラグ
			entry.delete_reason,			// 削除理由
			entry.input_check_date,			// 入力日
			entry.input_check,				// 入力完了チェック
			entry.input_operator_id,		// 入力者ID
			entry.confirm_check_date,		// 確認日
			entry.confirm_check,			// 確認完了チェック
			entry.confirm_operator_id,		// 確認者ID
			dateCheck(updated),				// 更新日
			updated_id,						// 更新者ID
			entry.entry_no					// 案件No
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
//	entry.quote_issue_date = dateCheck(entry.quote_issue_date);
	entry.order_accepted_date = dateCheck(entry.order_accepted_date);
	entry.monitors_cost_prep_limit = dateCheck(entry.monitors_cost_prep_limit);
	entry.monitors_cost_prep_comp = dateCheck(entry.monitors_cost_prep_comp);
	entry.prior_payment_limit = dateCheck(entry.prior_payment_limit);
	entry.prior_payment_accept = dateCheck(entry.prior_payment_accept);
	entry.input_check_date = dateCheck(entry.input_check_date);
	entry.confirm_check_date = dateCheck(entry.confirm_check_date);
	entry.report_limit_date = dateCheck(entry.report_limit_date);
	entry.report_submit_date = dateCheck(entry.report_submit_date);
	entry.prompt_report_limit_date_1 = dateCheck(entry.prompt_report_limit_date_1);
	entry.prompt_report_submit_date_1 = dateCheck(entry.prompt_report_submit_date_1);
	entry.prompt_report_limit_date_2 = dateCheck(entry.prompt_report_limit_date_2);
	entry.prompt_report_submit_date_2 = dateCheck(entry.prompt_report_submit_date_2);
	// 数値変換
	entry.order_accept_check = Number(entry.order_accept_check);
	entry.acounting_period_no = Number(entry.acounting_period_no);
	entry.order_type = Number(entry.order_type);
//	entry.contract_type = Number(entry.contract_type);
	entry.entry_amount_price = Number(entry.entry_amount_price);
	entry.entry_amount_billing = Number(entry.entry_amount_billing);
	entry.entry_amount_deposit = Number(entry.entry_amount_deposit);
	entry.drc_substituted_amount = Number(entry.drc_substituted_amount);

	entry.delete_check = Number(entry.delete_check);
	entry.input_check = Number(entry.input_check);
	entry.confirm_check = Number(entry.confirm_check);
	
	return entry;
};

// 見積情報のPOST
exports.quote_post = function (req, res) {
	var quote = quote_check(req.body);
	pg.connect(connectionString,function (err, connection) {
		if (quote.estimate_quote_no === '') {
			// 見積データのDB追加
			// 見積番号を取得してデータを追加する
			getQuoteNo(connection, quote, req, res);
		} else {
			// 見積データの更新
			updateQuote(connection, quote, req, res);
		}
	});
};

// 見積情報の追加（見積番号が未取得の場合）
var getQuoteNo = function(connection, quote, req, res) {
	var sql = 'SELECT entry_no FROM drc_sch.quote_info WHERE entry_no = $1';
	var rows = [];	
	// SQL実行（見積Noを決めるため）
	var query = connection.query(sql, [quote.entry_no]);
	query.on('row' , function (row) {
		rows.push(row);
	});
	query.on('end', function (result, err) {
		quote.estimate_quote_no = ('000' + (rows.length + 1)).slice(-3);
		insertQuote(connection, quote, req, res)
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
			count = rows[0].quote_detail_count + 1;
			sql = 'UPDATE drc_sch.quote_detail_number SET quote_detail_count = $1 WHERE entry_no = $2';
			var query = connection.query(sql, [count,quote.entry_no]);
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

// 見積情報の追加
var insertQuote = function (connection, quote, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.quote_info (' 
		+ 'entry_no,'			// 案件番号
		+ 'quote_no,'			// 見積番号
		+ 'quote_date,'			// 見積日
		+ 'expire_date,'		// 有効期限
		+ 'monitors_num,'		// 被験者数
		+ 'quote_submit_check,'	// 見積書提出済フラグ
		+ 'order_status,'		// 受注ステータス
		+ "quote_delete_check," // 削除フラグ
		+ "created,"			// 作成日
		+ "created_id,"			// 作成者ID
		+ "updated,"			// 更新日
		+ "updated_id"			// 更新者ID
		+ ") values (" 
		+ "$1," // 案件No
		+ "$2," // 見積番号
		+ "$3," // 見積日
		+ "$4," // 有効期限
		+ "$5," // 被験者数
		+ "$6," // 見積書提出済フラグ
		+ "$7," // 受注ステータス
		+ "$8," // 削除フラグ
		+ "$9," // 作成日
		+ "$10," // 作成者ID
		+ "$11," // 更新日
		+ "$12"  // 更新者ID
		+ ")";
	// SQL実行
	var query = connection.query(sql, [
			quote.entry_no,				// 案件No
			quote.estimate_quote_no,	// 見積番号
			quote.quote_date,			// 見積日
			quote.expire_date,			// 見積日
			quote.estimate_monitors_num,// 被験者数
			quote.quote_submit_check,	// 見積書提出済フラグ
			quote.order_status,			// 受注ステータス
			quote.estimate_delete_check,// 削除フラグ
			created,					// 作成日
			created_id,					// 作成者ID
			updated,					// 更新日
			updated_id					// 更新者ID
		]);
	query.on('end', function(result,err) {
		connection.end();
		res.send(quote);
	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};

// 見積情報の更新
var updateQuote = function (connection,quote, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.quote_info SET ' 
		+ 'quote_date = $1,'			// 見積日
		+ 'expire_date = $2,'			// 有効期限
		+ 'monitors_num = $3,'			// 被験者数
		+ 'quote_submit_check = $4,'	// 見積書提出済フラグ
		+ 'order_status = $5,'			// 受注ステータス
		+ "quote_delete_check = $6,"	// 削除フラグ
		+ "updated = $7,"				// 更新日
		+ "updated_id = $8"				// 更新者ID
		+ " WHERE entry_no = $9 AND quote_no = $10";
	// SQL実行
	var query = connection.query(sql, [
		quote.quote_date,			// 見積日
		quote.expire_date,			// 有効期限
		quote.estimate_monitors_num,// 被験者数
		quote.quote_submit_check,	// 見積書提出済フラグ
		quote.order_status,			// 受注ステータス
		quote.estimate_delete_check,// 削除フラグ
		updated,					// 更新日
		updated_id,					// 更新者ID
		quote.entry_no,				// 見積番号
		quote.estimate_quote_no		// 明細番号
	]);
	query.on('end', function(result,err) {
//		connection.end();

		// 明細行処理
		getSpecificInfo(connection,quote,req,res, 1);

		res.send(quote);
	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};

var quote_check = function (quote) {
	// 数値
	quote.monitors_num = Number(quote.estimate_monitors_num);	// 被験者数
	quote.quote_submit_check = Number(quote.quote_submit_check);	// 見積書提出済フラグ
	quote.order_status = Number(quote.order_status);	// 受注ステータス
//	quote.unit_price = Number(quote.unit_price);		// 単価
//	quote.quantity = Number(quote.quantity);			// 数量
//	quote.quote_price = Number(quote.quote_price);		// 見積金額
//	quote.summary_check = Number(quote.summary_check); // 削除フラグ
//	quote.quote_delete_check = Number(quote.quote_delete_check); // 削除フラグ
	// 日付
	quote.quote_date = dateCheck(quote.quote_date);
	quote.expire_date = dateCheck(quote.expire_date);
	return quote;
};

// 明細行データを取り出して保存処理を行う
var getSpecificInfo = function(connection,quote, req, res, no) {

	var specific = {entry_no:quote.entry_no,estimate_quote_no:quote.estimate_quote_no};
	if ("quote_detail_no_" + no in quote) {
		// 行がある
		specific.quote_detail_no = quote["quote_detail_no_" + no];
		specific.test_middle_class_cd = quote["test_middle_class_cd_" + no];
		specific.unit = quote["unit_" + no];
		specific.unit_price = quote["unit_price_" + no];
		specific.quantity = quote["quantity_" + no];
		specific.price = quote["price_" + no];
		if ("summary_check_" + no in quote) {
			specific.summary_check = Number(quote["summary_check_" + no]);
		} else {
			specific.summary_check = 0;
		}
		specific.specific_memo = quote["specific_memo_" + no];
		specific.specific_delete_check = Number(quote["specific_delete_check_" + no]);
		no++;
		// DBに追加
		insertQuoteSpecific(connection, quote, specific, req, res, no);
		return true;
	} else {
		return false;
	}
};
// 明細データの追加
var insertQuoteSpecific = function (connection,quote, specific, req, res, no) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.quote_specific_info (' 
		+ 'entry_no,'				// 案件番号
		+ 'quote_no,'				// 見積番号
		+ 'quote_detail_no,'		// 明細番号
		+ 'test_middle_class_cd,'	// 試験中分類CD
		+ 'unit,'					// 単位
		+ 'unit_price,'				// 単価
		+ 'quantity,'				// 数量
		+ 'price,'					// 金額
		+ 'summary_check,'			// 集計対象フラグ
		+ 'specific_memo,'			// 備考
		+ "specific_delete_check,"	// 削除フラグ
		+ "created,"			// 作成日
		+ "created_id,"			// 作成者ID
		+ "updated,"			// 更新日
		+ "updated_id"			// 更新者ID
		+ ") values (" 
		+ "$1," // 案件No
		+ "$2," // 見積番号
		+ "$3," // 明細番号
		+ "$4," // 試験中分類CD
		+ "$5," // 単位
		+ "$6," // 単価
		+ "$7," // 数量
		+ "$8," // 金額
		+ "$9," // 集計対象フラグ
		+ "$10," // 備考
		+ "$11," // 削除フラグ
		+ "$12," // 作成日
		+ "$13," // 作成者ID
		+ "$14," // 更新日
		+ "$15"  // 更新者ID
		+ ")";
	// SQL実行
	var query = connection.query(sql, [
		specific.entry_no,				// 案件No
		specific.estimate_quote_no,		// 見積番号
		specific.quote_detail_no,		// 明細番号
		specific.test_middle_class_cd,	// 試験中分類CD
		specific.unit,					// 単位
		specific.unit_price,			// 単価
		specific.quantity,				// 数量
		specific.price,					// 金額
		specific.summary_check,			// 集計対象フラグ
		specific.specific_memo,			// 備考
		specific.specific_delete_check,	// 備考
		created,					// 作成日
		created_id,					// 作成者ID
		updated,					// 更新日
		updated_id					// 更新者ID
	]);
	query.on('end', function(result,err) {
		// 次の行があれば処理を続ける
		if (!getSpecificInfo(connection,quote,req,res, no)) {
			// 終わり
			connection.end();
		}

	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};
