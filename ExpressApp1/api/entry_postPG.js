//
// 案件フォームからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var notify = models['notify_settings'];
var billing_post = require('./billing_postPG');

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
		+ 'shiken_kaishi_date,'				// 試験開始日
		+ 'report_limit_date,'				// 報告書提出期限
		+ 'report_submit_date,'				// 報告書提出日
		+ 'prompt_report_limit_date_1,'		// 速報提出期限１
		+ 'prompt_report_submit_date_1,'	// 速報提出日１
		+ 'prompt_report_limit_date_2,'		// 速報提出期限２
		+ 'prompt_report_submit_date_2,'	// 速報提出日２
		+ 'consumption_tax,'				// 消費税率
		+ 'kentai_name,'					// 検体名
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
		+ 'updated_id,'						// 更新者ID
		+ 'shikenjo'						// 試験場情報
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
		+ '$24,'	// 試験開始日
		+ '$25,'	// 報告書提出期限
		+ '$26,'	// 報告書提出日
		+ '$27,'	// 速報提出期限１
		+ '$28,'	// 速報提出日１
		+ '$29,'	// 速報提出期限２
		+ '$30,'	// 速報提出日２
		+ '$31,'	// 消費税率
		+ '$32,'	// 検体名
		+ '$33,'	// メモ
		+ '$34,'	// 削除フラグ
		+ '$35,'	// 削除理由
		+ '$36,'	// 入力日
		+ '$37,'	// 入力完了チェック
		+ '$38,'	// 入力者ID
		+ '$39,'	// 確認日
		+ '$40,'	// 確認完了チェック
		+ '$41,'	// 確認者ID
		+ '$42,'	// 作成日
		+ '$43,'	// 作成者ID
		+ '$44,'	// 更新日
		+ '$45,'	// 更新者ID
		+ '$46'		// 試験場情報
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
			entry.shiken_kaishi_date,		// 試験開始日
			entry.report_limit_date,		// 報告書提出期限
			entry.report_submit_date,		// 報告書提出日
			entry.prompt_report_limit_date_1,	// 速報提出期限１
			entry.prompt_report_submit_date_1,	// 速報提出日１
			entry.prompt_report_limit_date_2,	// 速報提出期限２
			entry.prompt_report_submit_date_2,	// 速報提出日２
			entry.entry_consumption_tax,		// 消費税率
			entry.kentai_name,				// 検体名
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
			updated_id,						// 更新者ID
			entry.shikenjo
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
			entry.shiken_kaishi_date,		// 試験開始日
			entry.report_limit_date,		// 報告書提出期限
			entry.report_submit_date,		// 報告書提出日
			entry.prompt_report_limit_date_1,	// 速報提出期限１
			entry.prompt_report_submit_date_1,	// 速報提出日１
			entry.prompt_report_limit_date_2,	// 速報提出期限２
			entry.prompt_report_submit_date_2,	// 速報提出日２
			entry.entry_consumption_tax,		// 消費税率
			entry.kentai_name,				// 検体名
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
			updated_id,						// 更新者ID
			entry.shikenjo
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
			+ 'shiken_kaishi_date = $23,'			// 試験開始日
			+ 'report_limit_date = $24,'			// 報告書提出期限
			+ 'report_submit_date = $25,'			// 報告書提出日
			+ 'prompt_report_limit_date_1 = $26,'	// 速報提出期限１
			+ 'prompt_report_submit_date_1 = $27,'	// 速報提出日１
			+ 'prompt_report_limit_date_2 = $28,'	// 速報提出期限２
			+ 'prompt_report_submit_date_2 = $29,'	// 速報提出日２
			+ 'consumption_tax = $30,'				// 消費税率
			+ 'kentai_name = $31,'					// 検体名
			+ 'entry_memo = $32,'					// メモ
			+ 'delete_check = $33,'					// 削除フラグ
			+ 'delete_reason = $34,'				// 削除理由
			+ 'input_check_date = $35,'				// 入力日
			+ 'input_check = $36,'					// 入力完了チェック
			+ 'input_operator_id = $37,'			// 入力者ID
			+ 'confirm_check_date = $38,'			// 確認日
			+ 'confirm_check = $39,'				// 確認完了チェック
			+ 'confirm_operator_id = $40,'			// 確認者ID
			+ 'updated = $41,'						// 更新日
			+ 'updated_id = $42,'					// 更新者ID
			+ 'shikenjo = $43'
			+ ' WHERE entry_no = $44';

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
			entry.shiken_kaishi_date,		// 試験開始日
			entry.report_limit_date,		// 報告書提出期限
			entry.report_submit_date,		// 報告書提出日
			entry.prompt_report_limit_date_1,	// 速報提出期限１
			entry.prompt_report_submit_date_1,	// 速報提出日１
			entry.prompt_report_limit_date_2,	// 速報提出期限２
			entry.prompt_report_submit_date_2,	// 速報提出日２
			entry.entry_consumption_tax,	// 消費税率
			entry.kentai_name,				// 検体名
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
			entry.shikenjo,
			entry.entry_no					// 案件No
		]);
		query.on('end', function (result, err) {
			connection.end();
			res.send(entry);
			checkEntryStatus(entry);	// 案件ステータスが「依頼」になったら通知メール
			billing_post.checkPayResultForUpdateEntryStatus(entry.entry_no);	// 案件ステータス更新
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
	entry.shiken_kaishi_date = dateCheck(entry.shiken_kaishi_date);
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
	if (entry.entry_amount_price != null) {
		entry.entry_amount_price = Number(entry.entry_amount_price.replace(/,/g, ''));
	}
	if (entry.entry_amount_billing != null) {
		entry.entry_amount_billing = Number(entry.entry_amount_billing.replace(/,/g, ''));
	}
	if (entry.entry_amount_deposit != null) {
		entry.entry_amount_deposit = Number(entry.entry_amount_deposit.replace(/,/g, ''));
	}
	if (entry.drc_substituted_amount != null) {
		entry.drc_substituted_amount = Number(entry.drc_substituted_amount.replace(/,/g, ''));
	}

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
		if (quote.order_status == 2) {
			// 請求情報の作成
			createBillingInfo(quote,created_id);
		}
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
		console.log("updateQuote");

		// 明細行処理
		getSpecificInfo(connection,quote,req,res, 1);
		if (quote.order_status == 2) {
			// 請求情報の作成
			createBillingInfo(quote,updated_id);
		} else {
			// 請求情報の削除
			deleteBillingInfo(quote,updated_id);
			
		}
		res.send(quote);
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
	quote.period_date = dateCheck(quote.period_date);
	quote.order_date = dateCheck(quote.order_date);
	return quote;
};

// 明細データのチェック
var quote_specific_check = function(specific) {
	if (specific.unit_price && specific.unit_price != "") {
		specific.unit_price = Number(specific.unit_price.replace(/,/g,''));
	} else {
		specific.unit_price = 0;
	}
	if (specific.quantity && specific.quantity != "") {
		specific.quantity = Number(specific.quantity);
	} else {
		specific.quantity = 0;
	}
	if (specific.price && specific.price != "") {
		specific.price = Number(specific.price.replace(/,/g,''));
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
	if (quote.order_status == 1) {	// 商談中
		entry_status = "02";
		var sql = 'UPDATE drc_sch.entry_info SET entry_status = $1 WHERE entry_no = $2';
		var query = connection.query(sql, [entry_status, quote.entry_no]);	// 案件ステータス:02　見積
		query.on('end', function (result, err) {
			console.log(err);
		});
	}
	else if (quote.order_status == 2) {	// 受注確定
		entry_status = "03";
		var sql = 'UPDATE drc_sch.entry_info SET entry_status = $1 ,order_accepted_date = $3 WHERE entry_no = $2';
		var query = connection.query(sql, [entry_status, quote.entry_no,quote.order_date]);	// 案件ステータス:03　依頼
		query.on('end', function (result, err) {
			console.log(err);
		});
	}

};
// 請求情報の作成
var createBillingInfo = function(quote,created_id) {
	console.log("createBilling");
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.billing_info WHERE entry_no = $1 AND delete_check = 0';
	pg.connect(connectionString, function (err, connection) {
		connection.query(sql_count, [quote.entry_no], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数
				if (results.rows[0].cnt == 0) {
					// 案件情報の取得
					getEntryInfo(quote,created_id);
				}
			}
			connection.end();
		});
	});
};
// 請求情報の作成
var callbackGetEntryInfo = function(entry, quote, created_id) {
	var billing = clearBilling();
	// 請求先情報の取得
	var client_info = getEntryClientInfo(entry,0);
	var agent_info = getEntryClientInfo(entry,1);
	billing = setDefaultClientData(billing, entry);
	// 請求情報登録
	billing.entry_no = entry.entry_no;
	billing.client_info = client_info;
	billing.agent_info = agent_info;
	// 請求予定日は報告書提出期限にする
	billing.pay_planning_date = entry.report_limit_date;
	// 請求金額のセット
	billing.pay_amount = Number(quote.quote_total_price.trim().replace(/,/g,'')) - Number(quote.consumption.trim().replace(/,/g,''));
	billing.pay_amount_total = Number(quote.quote_total_price.trim().replace(/,/g,''));
	billing.pay_amount_tax = Number(quote.consumption.trim().replace(/,/g,''));
	billing = billing_check(billing);
	pg.connect(connectionString, function (err, connection) {
		insertBilling(connection, billing,created_id);
	});
}
var billing_check = function (billing) {
	// 日付項目チェック
	billing.nyukin_yotei_date = tools.dateCheck(billing.nyukin_yotei_date);
	billing.pay_planning_date = tools.dateCheck(billing.pay_planning_date);
	billing.pay_complete_date = tools.dateCheck(billing.pay_complete_date);
	// 税抜請求額
	if (billing.pay_amount) {
		billing.pay_amount = Number(billing.pay_amount);
	} else {
		billing.pay_amount = 0;
	}
	// 消費税
	if (billing.pay_amount_tax) {
		billing.pay_amount_tax = Number(billing.pay_amount_tax);
	} else {
		billing.pay_amount_tax = 0;
	}
	// 請求額合計
	if (billing.pay_amount_total) {
		billing.pay_amount_total = Number(billing.pay_amount_total);
	} else {
		billing.pay_amount_total = 0;
	}
	return billing;
};

var insertBilling = function (connection, billing, created_id) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.billing_info('
			+ "entry_no,"				// 案件番号
			+ "billing_number,"			// 請求番号（経理用）
			+ "pay_planning_date,"		// 請求日
			+ "nyukin_yotei_date,"		// 入金予定日
			+ "pay_complete_date,"		// 入金日
			+ "pay_amount,"				// 税抜請求金額
			+ "pay_amount_tax,"			// 消費税
			+ "pay_amount_total,"		// 請求金額合計
			+ "pay_complete,"			// 入金額
			+ "pay_result,"				// 請求区分
			+ "client_cd,"				// クライアントCD
			+ "client_name,"			// クライアント名
			+ "client_division_cd,"		// クライアント部署CD
			+ "client_division_name,"	// クライアント部署名
			+ "client_person_id,"		// クライアント担当者ID
			+ "client_person_name,"		// クライアント担当者名
			+ "client_info,"			// 請求先情報（住所、電話、Fax）
			+ "memo,"					// 備考
			+ "agent_cd,"				// 代理店CD
			+ "agent_name,"				// 代理店名
			+ "agent_division_cd,"		// 代理店部署CD
			+ "agent_division_name,"	// 代理店部署名
			+ "agent_person_id,"		// 代理店担当者ID
			+ "agent_person_name,"		// 代理店担当者名
			+ "agent_info,"				// 請求先情報（住所、電話、Fax）
			+ "agent_memo,"					// 備考
			+ 'delete_check,'			// 削除フラグ
			+ 'created,'				// 作成日
			+ 'created_id,'				// 作成者ID
			+ 'updated,'				// 更新日
			+ 'updated_id'				// 更新者ID
			+ ') values ('
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)'
			;
		// SQL実行
		var query = connection.query(sql, [
			billing.entry_no,		// 案件番号
			billing.billing_number,			// 請求番号
			billing.pay_planning_date,		// 請求日
			billing.nyukin_yotei_date,		// 入金予定日
			billing.pay_complete_date,		// 入金日
			billing.pay_amount,				// 請求金額
			billing.pay_amount_tax,			// 消費税
			billing.pay_amount_total,		// 請求金額合計
			billing.pay_complete,			// 入金額
			billing.pay_result,				// 請求区分
			billing.client_cd,				// クライアントCD
			billing.client_name,			// クライアント名
			billing.client_division_cd,		// クライアント部署CD
			billing.client_division_name,	// クライアント部署名
			billing.client_person_id,		// クライアント担当者ID
			billing.client_person_name,		// クライアント担当者名
			billing.client_info,			// 請求先情報（住所、電話、Fax）
			billing.memo,					// 備考
			billing.agent_cd,				// 代理店CD
			billing.agent_name,				// 代理店名
			billing.agent_division_cd,		// 代理店部署CD
			billing.agent_division_name,	// 代理店部署名
			billing.agent_person_id,		// 代理店担当者ID
			billing.agent_person_name,		// 代理店担当者名
			billing.agent_info,			// 請求先情報（住所、電話、Fax）
			billing.agent_memo,					// 備考
			billing.delete_check,			// 削除フラグ
			created,						// 作成日
			created_id,						// 作成者ID
			updated,						// 更新日
			updated_id						// 更新者ID
		], function (err, result) {
			connection.end();
			if (err) {
				console.log(err);
			} else {
			}
		})

};
// 請求情報の削除（フラグON）
var deleteBillingInfo = function(quote,updated_id) {
	var sql = 'UPDATE drc_sch.billing_info SET delete_check = 1 , updated_id = $2 WHERE entry_no = $1 and pay_result = 0';
	pg.connect(connectionString, function (err, connection) {
		query = connection.query(sql, [quote.entry_no, updated_id]);	// 案件ステータス:03　依頼
		query.on('end', function (result, err) {
			console.log(err);
		});
	});

}

var setDefaultClientData = function(billing, entry) {
	billing.client_cd = entry.client_cd;
	billing.client_name = entry.client_name_1;
	billing.client_division_cd = entry.client_division_cd;
	billing.client_division_name = entry.client_division_name;
	billing.client_person_id = entry.client_person_id;
	billing.client_person_name = entry.client_person_name;

	billing.agent_cd = entry.agent_cd;
	billing.agent_name = entry.agent_name_1;
	billing.agent_division_cd = entry.agent_division_cd;
	billing.agent_division_name = entry.agent_division_name;
	billing.agent_person_id = entry.agent_person_id;
	billing.agent_person_name = entry.agent_person_name;
	return billing;
};
// 案件情報から請求先情報を取得
// kind:0 クライアント情報、kind:1 代理店情報
var getEntryClientInfo = function(entry,kind) {
	var address1 = getAddress1_for_entry(entry,kind);
	var address2 = getAddress2_for_entry(entry,kind);
	var tel = getTel_for_entry(entry,kind);
	var fax = getFax_for_entry(entry,kind);
	var client_info = "住所1 : " + address1 + " \n住所2 : " + address2
					+ " \ntel : " + tel + " \nfax : " + fax
	return client_info;
}
// 住所１取得（案件情報から取得）
var getAddress1_for_entry = function(entry,kind) {
	var address1 = "";
	if (kind == 0) {
		if ((entry.client_address_1 != null) && (entry.client_address_1 != "")) {
			address1 = entry.client_address_1;
		}
		if ((entry.client_division_address_1 != null) && (entry.client_division_address_1 != "")) {
			address1 = entry.client_division_address_1;
		}
	} else {
		if ((entry.agent_address_1 != null) && (entry.agent_address_1 != "")) {
			address1 = entry.agent_address_1;
		}
		if ((entry.agent_division_address_1 != null) && (entry.agent_division_address_1 != "")) {
			address1 = entry.agent_division_address_1;
		}		
	}
	return address1;
}
// 住所2取得(案件情報から取得)
var getAddress2_for_entry = function(entry,kind) {
	var address2 = "";
	if (kind == 0) {
		if ((entry.client_address_2 != null) && (entry.client_address_2 != "")) {
			address2 = entry.client_address_2;
		}
		if ((entry.client_division_address_2 != null) && (entry.client_division_address_2 != "")) {
			address2 = entry.client_division_address_2;
		}	
	} else {
		if ((entry.agent_address_2 != null) && (entry.agent_address_2 != "")) {
			address2 = entry.agent_address_2;
		}
		if ((entry.agent_division_address_2 != null) && (entry.agent_division_address_2 != "")) {
			address2 = entry.agent_division_address_2;
		}
	
	}
	if ((entry.client_address_2 != null) && (entry.client_address_2 != "")) {
		address2 = entry.client_address_2;
	}
	if ((entry.client_division_address_2 != null) && (entry.client_division_address_2 != "")) {
		address2 = entry.client_division_address_2;
	}
	return address2;
}
// 電話番号取得(案件情報から取得)
var getTel_for_entry = function(entry,kind) {
	var tel = "";
	if (kind == 0) {
		if ((entry.client_tel_no != null) && (entry.client_tel_no != "")) {
			tel = entry.client_tel_no;
		}
		if ((entry.client_division_tel_no != null) && (entry.client_division_tel_no != "")) {
			tel = entry.client_division_tel_no;
		}
	
	} else {
		if ((entry.agent_tel_no != null) && (entry.agent_tel_no != "")) {
			tel = entry.agent_tel_no;
		}
		if ((entry.agent_division_tel_no != null) && (entry.agent_division_tel_no != "")) {
			tel = entry.agent_division_tel_no;
		}
	
	}
	return tel;
}
// FAX番号取得(案件情報から取得)
var getFax_for_entry = function(entry,kind) {
	var fax = "";
	if (kind == 0) {
		if ((entry.client_fax_no != null) && (entry.client_fax_no != "")) {
			fax = entry.client_fax_no;
		}
		if ((entry.client_division_fax_no != null) && (entry.client_division_fax_no != "")) {
			fax = entry.client_division_fax_no;
		}
	
	} else {
		if ((entry.agent_fax_no != null) && (entry.agent_fax_no != "")) {
			fax = entry.agent_fax_no;
		}
		if ((entry.agent_division_fax_no != null) && (entry.agent_division_fax_no != "")) {
			fax = entry.agent_division_fax_no;
		}
	
	}
	return fax;
}

// 案件データ（案件No）取得
var getEntryInfo = function (quote,created_id) {
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
		+ 'agent_list.name_1 AS agent_name_1,'									// 代理店名称1
		+ 'agent_list.name_2 AS agent_name_2,'									// 代理店名称2
		+ "agent_division_list.address_1 AS agent_address_1,"					// 代理店部署住所１
		+ "agent_division_list.address_2 AS agent_address_2,"					// 代理店部署住所２
		+ "agent_division_list.name AS agent_division_name,"					// 代理店部署名
		+ "agent_division_list.memo AS agent_division_memo,"					// 代理店部署メモ
		+ "agent_person_list.name AS agent_person_name,"						// 代理店担当者名
		+ "agent_person_list.memo AS agent_person_memo,"						// 代理店担当者メモ
		+ "agent_person_list.compellation AS agent_person_compellation,"
		+ "entry_info.client_cd,"												// 得意先CD
		+ "entry_info.client_division_cd,"										// 得意先部署CD
		+ "entry_info.client_person_id,"										// 得意先担当者ID
		+ "client_list.name_1 AS client_name_1,"								// 得意先名１
		+ "client_list.name_2 AS client_name_2,"								// 得意先名２
		+ "client_list.tel_no AS client_tel_no,"
		+ "client_list.fax_no AS client_fax_no,"
		+ "client_list.address_1 AS client_address_1,"					// 得意先住所１
		+ "client_list.address_2 AS client_address_2,"					// 得意先住所２
		+ "client_division_list.name AS client_division_name,"					// 得意先部署名
		+ "client_division_list.memo AS client_division_memo,"					// 得意先部署メモ
		+ "client_division_list.address_1 AS client_division_address_1,"
		+ "client_division_list.address_2 AS client_division_address_2,"
		+ "client_division_list.tel_no AS client_division_tel_no,"
		+ "client_division_list.fax_no AS client_division_fax_no,"
		+ "client_person_list.name AS client_person_name,"						// 得意先担当者名
		+ "client_person_list.memo AS client_person_memo,"						// 得意先担当者メモ
		+ "client_person_list.compellation AS client_person_compellation,"
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
		+ 'kentai_name,'																// 検体名
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
		+ 'entry_info.updated_id,'												// 更新者ID
		+ 'entry_info.shikenjo'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)'
		+ ' LEFT JOIN drc_sch.itakusaki_list AS out_list ON(entry_info.outsourcing_cd = out_list.client_cd)'
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
		var query = connection.query(sql, [quote.entry_no]);
		var rows = [];
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function(result,err) {
			for (var i in rows) {
				entry = rows[i];
			}
			connection.end();
			callbackGetEntryInfo(entry, quote, created_id);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};
// 請求情報のクリア
var clearBilling = function() {
	var billing = {
			billing_no:'',
			billing_number:'',
			pay_planning_date:'',
			nyukin_yotei_date:'',
			pay_complete_date:'',
			pay_amount:0,
			pay_amount_tax:0,
			pay_amount_total:0,
			pay_complete:0,
			pay_result:0,
			memo:'',
			client_cd:'',
			client_name:'',
			client_division_cd:'',
			client_division_name:'',
			client_person_id:'',
			client_person_name:'',
			client_info: '',
			delete_check:0
	};
	return billing;
};
