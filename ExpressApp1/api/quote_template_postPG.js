//
// 見積り明細のテンプレート
//

// テンプレートに追加
var sqlInsertQuoteTemplate = 'INSERT INTO drc_sch.quote_specific_template ('
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
	+ "$1," // 試験中分類CD
	+ "$2," // 試験中分類名称
	+ "$3," // 単位
	+ "$4," // 単価
	+ "$5," // 数量
	+ "$6," // 金額
	+ "$7," // 集計対象フラグ
	+ "$8," // 備考
	+ "$9," // 削除フラグ
	+ "$10," // 作成日
	+ "$11," // 作成者ID
	+ "$12," // 更新日
	+ "$13"  // 更新者ID
	+ ")";

// テンプレートに追加
var insertQuoteTemplate = function (connection,quote, specific, req, res, no) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	// SQL実行
	var query = connection.query(sqlInsertQuoteTemplate, [
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
	});
	query.on('error', function (error) {
		console.log(sqlInsertQuoteTemplate + ' ' + error);
	});
};

// テンプレートの更新
var updateQuoteTemplate = function (connection,quote, specific, req, res, no) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.quote_specific_template SET '
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
		+ " WHERE template_id = $12"
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
		specific.template_delete_check,	// 削除フラグ
		updated,						// 更新日
		updated_id,						// 更新者ID
		template_id
	]);
	query.on('end', function(result,err) {

	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};
