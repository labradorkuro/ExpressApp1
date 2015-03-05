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
			+ '$22,'	// メモ
			+ '$23,'	// 削除フラグ
			+ '$24,'	// 削除理由
			+ '$25,'	// 入力日
			+ '$26,'	// 入力完了チェック
			+ '$27,'	// 入力者ID
			+ '$28,'	// 確認日
			+ '$29,'	// 確認完了チェック
			+ '$30,'	// 確認者ID
			+ '$31,'	// 作成日
			+ '$32,'	// 作成者ID
			+ '$33,'	// 更新日
			+ '$34'		// 更新者ID
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
			+ 'entry_memo = $21,'					// メモ
			+ 'delete_check = $22,'					// 削除フラグ
			+ 'delete_reason = $23,'				// 削除理由
			+ 'input_check_date = $24,'				// 入力日
			+ 'input_check = $25,'					// 入力完了チェック
			+ 'input_operator_id = $26,'			// 入力者ID
			+ 'confirm_check_date = $27,'			// 確認日
			+ 'confirm_check = $28,'				// 確認完了チェック
			+ 'confirm_operator_id = $29,'			// 確認者ID
			+ 'updated = $30,'						// 更新日
			+ 'updated_id = $31'					// 更新者ID
			+ ' WHERE entry_no = $32';

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
