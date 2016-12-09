//
// 案件フォームからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var notify = models['notify_settings'];

var sqlInsertEntry = 'INSERT INTO drc_sch.entry_info('
		+ 'entry_no,'						// 案件No
		+ 'quote_no,'						// 見積番号
		+ 'inquiry_date,'					// 問合せ日
		+ 'entry_status,'					// 案件ステータス
		+ 'sales_person_id,'				// 営業担当者ID
		+ 'agent_cd,'						// 代理店CD
		+ 'agent_division_cd,'				// 代理店部署コード
		+ 'agent_person_id,'				// 代理店担当者ID
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
		+ 'consumption_tax,'				// 消費税率
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
		+ '$7,'		// 代理店部署CD
		+ '$8,'		// 代理店担当者CD
		+ '$9,'		// 得意先CD
		+ '$10,'		// 得意先部署CD
		+ '$11,'		// 得意先担当者CD
		+ '$12,'	// 試験大分類
		+ '$13,'	// 試験中分類
		+ '$14,'	// 案件名
		+ '$15,'	// 受託区分
		+ '$16,'	// 委託先CD
		+ '$17,'	// 受注日
		+ '$18,'	// 仮受注チェック
		+ '$19,'	// 会計期No
		+ '$20,'	// 試験担当者ID
		+ '$21,'	// 案件合計金額
		+ '$22,'	// 案件請求合計金額
		+ '$23,'	// 案件入金合計金額
		+ '$24,'	// 報告書提出期限
		+ '$25,'	// 報告書提出日
		+ '$26,'	// 速報提出期限１
		+ '$27,'	// 速報提出日１
		+ '$28,'	// 速報提出期限２
		+ '$29,'	// 速報提出日２
		+ '$30,'	// 消費税率
		+ '$31,'	// メモ
		+ '$32,'	// 削除フラグ
		+ '$33,'	// 削除理由
		+ '$34,'	// 入力日
		+ '$35,'	// 入力完了チェック
		+ '$36,'	// 入力者ID
		+ '$37,'	// 確認日
		+ '$38,'	// 確認完了チェック
		+ '$39,'	// 確認者ID
		+ '$40,'	// 作成日
		+ '$41,'	// 作成者ID
		+ '$42,'	// 更新日
		+ '$43'		// 更新者ID
		+ ')'
		;
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
// 案件基本データのPOST(複写して追加)
exports.entry_copy = function (req, res) {
	var entry = entry_check(req.body);
	// 案件Noの取得、案件データのDB追加
	getEntryNo(entry, req, res);
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
					if (entry.entry_no == "") {
						if (entry.copy_entry_no == "") {
							// 案件情報の追加
							insertEntryInfo(connection, entry, count, req, res);
						} else {
							// 案件情報を複写して追加
							copyEntryInfo(connection, entry, count, req, res);
						}
					}
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
					if (entry.entry_no == "") {
						if (entry.copy_entry_no == "") {
							// 案件情報の追加
							insertEntryInfo(connection, entry, count, req, res);
						} else {
							// 案件情報を複写して追加
							copyEntryInfo(connection, entry, count, req, res);
						}
					}
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
	});
};
// 案件データをDBに追加
var insertEntryInfo = function(connection, entry, count, req, res) {
	entry.entry_no = getDateNo(count, '-');
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	// SQL実行
	var query = connection.query(sqlInsertEntry, [
			entry.entry_no,					// 案件No
			entry.quote_no,					// 見積番号
			entry.inquiry_date,				// 問合せ日
			entry.entry_status,				// 案件ステータス
			entry.sales_person_id,			// 営業担当者ID
			entry.agent_cd,					// 代理店CD
			entry.agent_division_cd,		// 代理店部署コード
			entry.agent_person_id,			// 代理店担当者ID
			entry.entry_client_cd,				// 得意先コード
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
			entry.entry_consumption_tax,		// 消費税率
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
		checkEntryStatus(entry);	// 案件ステータスが「依頼」になったら通知メール
	});
	query.on('error', function (error) {
		console.log(sqlInsertEntry + ' ' + error);
	});
};
// 案件データをDBに複写して追加
var copyEntryInfo = function(connection, entry, count, req, res) {
	var org_entry_no = entry.copy_entry_no;
	entry.entry_no = getDateNo(count, '-');
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	// SQL実行
	var query = connection.query(sqlInsertEntry, [
			entry.entry_no,					// 案件No
			entry.quote_no,					// 見積番号
			entry.inquiry_date,				// 問合せ日
			entry.entry_status,				// 案件ステータス
			entry.sales_person_id,			// 営業担当者ID
			entry.agent_cd,					// 代理店CD
			entry.agent_division_cd,		// 代理店部署コード
			entry.agent_person_id,			// 代理店担当者ID
			entry.entry_client_cd,				// 得意先コード
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
			entry.entry_consumption_tax,		// 消費税率
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
			// 見積情報のコピー
			copyQuoteInfo(connection,org_entry_no,entry.entry_no,res,req);
	});
	query.on('error', function (error) {
		console.log(sqlInsertEntry + ' ' + error);
		connection.end();
		res.send(entry);
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
			+ 'agent_division_cd = $6,'				// 得意先部署コード
			+ 'agent_person_id = $7,'				// 得意先担当者ID
			+ 'client_cd = $8,'						// 得意先コード
			+ 'client_division_cd = $9,'			// 得意先部署コード
			+ 'client_person_id = $10,'				// 得意先担当者ID
			+ 'test_large_class_cd = $11,'			// 試験大分類CD
			+ 'test_middle_class_cd = $12,'			// 試験中分類CD
			+ 'entry_title = $13,'					// 案件名
			+ 'order_type = $14,'					// 受託区分
			+ 'outsourcing_cd = $15,'				// 委託先CD
			+ 'order_accepted_date = $16,'			// 受注日付
			+ 'order_accept_check = $17,'			// 仮受注日チェック
			+ 'acounting_period_no = $18,'			// 会計期No
			+ 'test_person_id = $19,'				// 試験担当者ID
			+ 'entry_amount_price = $20,'			// 案件合計金額
			+ 'entry_amount_billing = $21,'			// 案件請求合計金額
			+ 'entry_amount_deposit = $22,'			// 案件入金合計金額
			+ 'report_limit_date = $23,'			// 報告書提出期限
			+ 'report_submit_date = $24,'			// 報告書提出日
			+ 'prompt_report_limit_date_1 = $25,'	// 速報提出期限１
			+ 'prompt_report_submit_date_1 = $26,'	// 速報提出日１
			+ 'prompt_report_limit_date_2 = $27,'	// 速報提出期限２
			+ 'prompt_report_submit_date_2 = $28,'	// 速報提出日２
			+ 'consumption_tax = $29,'				// 消費税率
			+ 'entry_memo = $30,'					// メモ
			+ 'delete_check = $31,'					// 削除フラグ
			+ 'delete_reason = $32,'				// 削除理由
			+ 'input_check_date = $33,'				// 入力日
			+ 'input_check = $34,'					// 入力完了チェック
			+ 'input_operator_id = $35,'			// 入力者ID
			+ 'confirm_check_date = $36,'			// 確認日
			+ 'confirm_check = $37,'				// 確認完了チェック
			+ 'confirm_operator_id = $38,'			// 確認者ID
			+ 'updated = $39,'						// 更新日
			+ 'updated_id = $40'					// 更新者ID
			+ ' WHERE entry_no = $41';

	// SQL実行
	pg.connect(connectionString,function (err, connection) {
		var query = connection.query(sql, [
			entry.quote_no,					// 見積番号
			entry.inquiry_date,				// 問合せ日
			entry.entry_status,				// 案件ステータス
			entry.sales_person_id,			// 営業担当者ID
			entry.agent_cd,					// 代理店CD
			entry.agent_division_cd,		// 代理店部署コード
			entry.agent_person_id,			// 代理店担当者ID
			entry.entry_client_cd,				// 得意先コード
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
			entry.entry_consumption_tax,	// 消費税率
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
			checkEntryStatus(entry);	// 案件ステータスが「依頼」になったら通知メール
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
			connection.end();
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
	entry.entry_consumption_tax = Number(entry.entry_consumption_tax);
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
		// 案件ステータスを更新する
		updateEntryStatus(connection,quote);
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

// 案件を複写して追加する際にその中の見積情報も複写する
var copyQuoteInfo = function(connection,org_entry_no,new_entry_no,res,req) {
		// 元の案件の見積情報を検索する
		var sql = 'SELECT * FROM drc_sch.quote_info WHERE entry_no = $1';
		var rows = [];
		// SQL実行（見積Noを決めるため）
		var query = connection.query(sql, [org_entry_no]);
		query.on('row' , function (row) {
			rows.push(row);
		});
		query.on('end', function (result, err) {
			for (var i in rows) {
				var quote = rows[i];
				quote.entry_no = new_entry_no;
				copyQuote(quote, org_entry_no,req, res);
			}
			connection.end();
			res.send(quote);

		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
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
// 見積情報追加用
var sqlInsertQuote = 'INSERT INTO drc_sch.quote_info ('
	+ 'entry_no,'			// 案件番号
	+ 'quote_no,'			// 見積番号
	+ 'quote_date,'			// 見積日
	+ 'expire_date,'		// 有効期限
	+ 'monitors_num,'		// 被験者数
	+ 'quote_submit_check,'	// 見積書提出済フラグ
	+ 'order_status,'		// 受注ステータス
	+ 'quote_form_memo,'	// 見積書備考
	+ 'consumption_tax,'	// 消費税率
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
	+ "$8,"	// 見積書備考
	+ "$9,"	// 消費税率
	+ "$10," // 削除フラグ
	+ "$11," // 作成日
	+ "$12," // 作成者ID
	+ "$13," // 更新日
	+ "$14"  // 更新者ID
	+ ")";

// 見積情報の追加
var insertQuote = function (connection, quote, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	// SQL実行
	var query = connection.query(sqlInsertQuote, [
			quote.entry_no,				// 案件No
			quote.estimate_quote_no,	// 見積番号
			quote.quote_date,			// 見積日
			quote.expire_date,			// 見積日
			quote.estimate_monitors_num,// 被験者数
			quote.quote_submit_check,	// 見積書提出済フラグ
			quote.order_status,			// 受注ステータス
			quote.quote_form_memo,		// 見積書備考
			quote.consumption_tax,		// 消費税率
			quote.estimate_delete_check,// 削除フラグ
			created,					// 作成日
			created_id,					// 作成者ID
			updated,					// 更新日
			updated_id					// 更新者ID
		]);
	query.on('end', function(result,err) {
//		connection.end();
		// 明細行処理
		getSpecificInfo(connection,quote,req,res, 1);
		res.send(quote);
	});
	query.on('error', function (error) {
		console.log(sqlInsertQuote + ' ' + error);
	});
};

// 見積情報の複写
var copyQuote = function (quote, org_entry_no, req, res) {
	var today = tools.getTimestamp("{0}/{1}/{2}");
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	quote.quote_date = null;
	quote.quote_submit_check = 1;
	quote.order_status = 1
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		var query = connection.query(sqlInsertQuote, [
				quote.entry_no,				// 案件No
				quote.quote_no,	// 見積番号
				quote.quote_date,			// 見積日
				quote.expire_date,			// 見積日
				quote.monitors_num,// 被験者数
				quote.quote_submit_check,	// 見積書提出済フラグ
				quote.order_status,			// 受注ステータス
				quote.quote_form_memo,		// 見積書備考
				quote.consumption_tax,		// 消費税率
				quote.quote_delete_check,// 削除フラグ
				created,					// 作成日
				created_id,					// 作成者ID
				updated,					// 更新日
				updated_id					// 更新者ID
			]);
		query.on('end', function(result,err) {
			// 明細行データのコピー
			copySpecificInfo(quote.entry_no,quote.quote_no,org_entry_no, req, res);
			connection.end();
		});
		query.on('error', function (error) {
			console.log(sqlInsertQuote + ' ' + error);
		});
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
		+ 'quote_form_memo = $6,'		// 見積書備考
		+ 'consumption_tax = $7,'		// 消費税率
		+ "quote_delete_check = $8,"	// 削除フラグ
		+ "updated = $9,"				// 更新日
		+ "updated_id = $10"				// 更新者ID
		+ " WHERE entry_no = $11 AND quote_no = $12";
	// SQL実行
	var query = connection.query(sql, [
		quote.quote_date,			// 見積日
		quote.expire_date,			// 有効期限
		quote.estimate_monitors_num,// 被験者数
		quote.quote_submit_check,	// 見積書提出済フラグ
		quote.order_status,			// 受注ステータス
		quote.quote_form_memo,		// 見積書備考
		quote.consumption_tax,		// 消費税率
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
	quote.estimate_monitors_num = Number(quote.estimate_monitors_num);	// 被験者数
	quote.quote_submit_check = Number(quote.quote_submit_check);	// 見積書提出済フラグ
	quote.order_status = Number(quote.order_status);	// 受注ステータス
//	quote.unit_price = Number(quote.unit_price);		// 単価
//	quote.quantity = Number(quote.quantity);			// 数量
//	quote.quote_price = Number(quote.quote_price);		// 見積金額
//	quote.summary_check = Number(quote.summary_check); // 削除フラグ
	quote.consumption_tax = Number(quote.consumption_tax);	// 消費税率
	quote.estimate_delete_check = Number(quote.estimate_delete_check); // 削除フラグ
	// 日付
	quote.quote_date = dateCheck(quote.quote_date);
	quote.expire_date = dateCheck(quote.expire_date);
	return quote;
};

// 明細データのチェック
var quote_specific_check = function(specific) {
	if (specific.unit_price && specific.unit_price != "") {
		specific.unit_price = Number(specific.unit_price);
	} else {
		specific.unit_price = 0;
	}
	if (specific.quantity && specific.quantity != "") {
		specific.quantity = Number(specific.quantity);
	} else {
		specific.quantity = 0;
	}
	if (specific.price && specific.price != "") {
		specific.price = Number(specific.price);
	} else {
		specific.price = 0;
	}
	return specific;
};
// 明細行データを取り出して保存処理を行う
var getSpecificInfo = function(connection,quote, req, res, no) {

	var specific = {entry_no:quote.entry_no,estimate_quote_no:quote.estimate_quote_no};
	if ("quote_detail_no_" + no in quote) {
		// 行がある
		specific.quote_detail_no = quote["quote_detail_no_" + no];
		specific.test_middle_class_cd = quote["test_middle_class_cd_" + no];
		specific.test_middle_class_name = quote["test_middle_class_name_" + no];
		specific.unit = quote["unit_" + no];
		specific.unit_price = quote["unit_price_" + no];
		specific.quantity = quote["quantity_" + no];
		specific.price = quote["price_" + no];
		if ("summary_check_" + no in quote) {
			specific.summary_check = 1;
		} else {
			specific.summary_check = 0;
		}
		specific.specific_memo = quote["specific_memo_" + no];
		specific.specific_delete_check = Number(quote["specific_delete_check_" + no]);
		specific = quote_specific_check(specific);
		no++;
		var rows = [];
		var sql = "SELECT entry_no,quote_no,quote_detail_no FROM drc_sch.quote_specific_info WHERE entry_no = $1 AND quote_no = $2 AND quote_detail_no = $3";
		var query = connection.query(sql, [specific.entry_no,specific.estimate_quote_no,specific.quote_detail_no]);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			if (rows.length == 0) {
				// DBに追加
				insertQuoteSpecific(connection, quote, specific, req, res, no);
			} else {
				// DB更新
				updateQuoteSpecific(connection, quote, specific, req, res, no);
			}
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});

		return true;
	} else {
		return false;
	}
};

// 明細行データの複写
var copySpecificInfo = function(entry_no,quote_no, org_entry_no, req, res) {
	// 元の案件の明細行データを検索して見つかったデータを書き換えて追加する
	var rows = [];
	var sql = "SELECT * FROM drc_sch.quote_specific_info WHERE entry_no = $1 AND quote_no = $2";
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, [org_entry_no,quote_no]);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			for (var i in rows) {
				var specific = rows[i];
				specific.entry_no = entry_no;
				// DBに追加
				copyQuoteSpecific(specific, rows.length, req, res);
			}
			connection.end();
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
var sqlInsertSpecific = 'INSERT INTO drc_sch.quote_specific_info ('
	+ 'entry_no,'				// 案件番号
	+ 'quote_no,'				// 見積番号
	+ 'quote_detail_no,'		// 明細番号
	+ 'test_middle_class_cd,'	// 試験中分類CD
	+ 'test_middle_class_name,'	// 試験中分類名称
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
	+ "$5," // 試験中分類名称
	+ "$6," // 単位
	+ "$7," // 単価
	+ "$8," // 数量
	+ "$9," // 金額
	+ "$10," // 集計対象フラグ
	+ "$11," // 備考
	+ "$12," // 削除フラグ
	+ "$13," // 作成日
	+ "$14," // 作成者ID
	+ "$15," // 更新日
	+ "$16"  // 更新者ID
	+ ")";

// 明細データの追加
var insertQuoteSpecific = function (connection,quote, specific, req, res, no) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	// SQL実行
	var query = connection.query(sqlInsertSpecific, [
		specific.entry_no,				// 案件No
		specific.estimate_quote_no,		// 見積番号
		specific.quote_detail_no,		// 明細番号
		specific.test_middle_class_cd,	// 試験中分類CD
		specific.test_middle_class_name,// 試験中分類名
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
		console.log(sqlInsertSpecific + ' ' + error);
	});
};
// 明細データの複写
var copyQuoteSpecific = function (specific, specific_cnt, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		var query = connection.query(sqlInsertSpecific, [
			specific.entry_no,				// 案件No
			specific.quote_no,		// 見積番号
			specific.quote_detail_no,		// 明細番号
			specific.test_middle_class_cd,	// 試験中分類CD
			specific.test_middle_class_name,// 試験中分類名
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
			connection.end();
		});
		query.on('error', function (error) {
			console.log(sqlInsertSpecific + ' ' + error);
			connection.end();
		});
	});
};
// 明細データの追加
var updateQuoteSpecific = function (connection,quote, specific, req, res, no) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.quote_specific_info SET '
		+ 'test_middle_class_cd = $1,'	// 試験中分類CD
		+ 'test_middle_class_name = $2,'	// 試験中分類名称
		+ 'unit = $3,'					// 単位
		+ 'unit_price = $4,'			// 単価
		+ 'quantity = $5,'				// 数量
		+ 'price = $6,'					// 金額
		+ 'summary_check = $7,'			// 集計対象フラグ
		+ 'specific_memo = $8,'			// 備考
		+ "specific_delete_check = $9,"	// 削除フラグ
		+ "updated = $10,"				// 更新日
		+ "updated_id = $11"			// 更新者ID
		+ " WHERE entry_no = $12 AND quote_no = $13 AND quote_detail_no = $14"
	// SQL実行
	var query = connection.query(sql, [
		specific.test_middle_class_cd,	// 試験中分類CD
		specific.test_middle_class_name,// 試験中分類名称
		specific.unit,					// 単位
		specific.unit_price,			// 単価
		specific.quantity,				// 数量
		specific.price,					// 金額
		specific.summary_check,			// 集計対象フラグ
		specific.specific_memo,			// 備考
		specific.specific_delete_check,	// 備考
		updated,						// 更新日
		updated_id,						// 更新者ID
		specific.entry_no,				// 案件No
		specific.estimate_quote_no,		// 見積番号
		specific.quote_detail_no		// 明細番号
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
// 「依頼」の時にメール通知する
var checkEntryStatus = function(entry) {
	if (entry.entry_status == "03") {
		var attr = {where:{notify_id:1}};
	  notify.schema('drc_sch').find(attr).then(function(setting){
			if ((setting != null) && (setting.smpt_server != '') && (setting.smtp_port != '') && (setting.usrid != '') && (setting.password != '') && (setting.send_address_2 != '')) {
				var transpoter = nodemailer.createTransport(smtpTransport({
	        host : setting.smtp_server,
	        port : setting.smtp_port,
	        auth : {
	          user : setting.userid,
	          pass : setting.password
	        }
	      }));
	      var mailOptions = {
	        from : setting.userid,
	        to : setting.send_address_2,
	        subject : setting.mail_title_2 + " 案件No[" + entry.entry_no + "]",
	        text : setting.mail_body_2 + "案件No[" + entry.entry_no + "]"
	      };
	      transpoter.sendMail(mailOptions, function( error, info) {
	        if (error) {
	          return console.log(error);
	        }
	        console.log("Message Sent: " + info.response);
	      })
			}
	  }).catch(function(error){
	    console.log(error);
	  });
	}
};

// entry_noの案件情報の案件ステータスを依頼に変更する
var updateEntryStatus = function(connection,quote) {
	var entry_status = "";
	if (quote.order_status == 2) {
		entry_status = "03";
		var sql = 'UPDATE drc_sch.entry_info SET entry_status = $1 WHERE entry_no = $2';
		query = connection.query(sql, [entry_status, quote.entry_no]);	// 案件ステータス:03　依頼
		query.on('end', function (result, err) {
		});
	}

};
