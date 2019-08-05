var tools = require('../tools/tool');
//
// 見積り明細のテンプレート
//
exports.postQuoteTemplate = function (req, res) {
	var template = req.body;
	console.log("template:" + template.template_id);
	pg.connect(connectionString, function (err, connection) {
		insertQuoteTemplate(connection,template,req);
	});
};

// テンプレートに追加
var sqlInsertQuoteTemplate = 'INSERT INTO drc_sch.quote_specific_template ('
	+ 'template_id,'			// 
	+ 'test_large_class_cd,'	// 試験大分類CD
	+ 'test_middle_class_cd,'	// 試験中分類CD
	+ 'test_middle_class_name,'	// 試験中分類
	+ 'period_term,'					// 
	+ 'period_unit,'					// 
	+ 'unit,'					// 単位
	+ 'unit_price,'				// 単価
	+ 'quantity,'				// 数量
	+ 'price,'					// 金額
	+ 'summary_check,'			// 集計対象フラグ
	+ 'memo,'			// 備考
	+ "delete_check,"	// 削除フラグ
	+ "created,"			// 作成日
	+ "created_id,"			// 作成者ID
	+ "updated,"			// 更新日
	+ "updated_id"			// 更新者ID
	+ ") values ("
	+ "$1," // テンプレートID
	+ "$2," // 試験大分類CD
	+ "$3," // 試験中分類CD
	+ "$4," // 試験中分類
	+ "$5," // 
	+ "$6," // 
	+ "$7," // 単位
	+ "$8," // 単価
	+ "$9," // 数量
	+ "$10," // 金額
	+ "$11," // 集計対象フラグ
	+ "$12," // 備考
	+ "$13," // 削除フラグ
	+ "$14," // 作成日
	+ "$15," // 作成者ID
	+ "$16," // 更新日
	+ "$17"  // 更新者ID
	+ ")";

// テンプレートに追加
var insertQuoteTemplate = function (connection,specific, req) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	// SQL実行
	var query = connection.query(sqlInsertQuoteTemplate, [
		specific.template_id,			// テンプレートID
		specific.test_large_class_cd,	// 試験大分類CD
		specific.test_middle_class_cd,	// 試験中分類CD
		specific.test_middle_class_name,	// 試験中分類
		specific.period_term,
		specific.period_unit,
		specific.unit,					// 単位
		specific.unit_price,			// 単価
		specific.quantity,				// 数量
		specific.price,					// 金額
		specific.summary_check,			// 集計対象フラグ
		specific.memo,			// 備考
		specific.delete_check,	// 備考
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
		+ 'test_large_class_cd = $1,'	// 試験大分類CD
		+ 'test_middle_class_cd = $2,'	// 試験中分類CD
		+ 'test_middle_class_name = $3,'	// 試験中分類
		+ 'period_term = $4,'					// 
		+ 'period_unit = $5,'					// 
		+ 'unit = $6,'					// 単位
		+ 'unit_price = $7,'			// 単価
		+ 'quantity = $8,'				// 数量
		+ 'price = $9,'					// 金額
		+ 'summary_check = $8,'			// 集計対象フラグ
		+ 'memo = $9,'			// 備考
		+ "delete_check = $10,"	// 削除フラグ
		+ "updated = $11,"				// 更新日
		+ "updated_id = $12"			// 更新者ID
		+ " WHERE id = $13"
	// SQL実行
	var query = connection.query(sql, [
		specific.test_large_class_cd,	// 試験大分類CD
		specific.test_middle_class_cd,	// 試験中分類CD
		specific.test_middle_class_name,	// 試験中分類
		specific.period_term,					// 
		specific.period_unit,					// 
		specific.unit,					// 単位
		specific.unit_price,			// 単価
		specific.quantity,				// 数量
		specific.price,					// 金額
		specific.summary_check,			// 集計対象フラグ
		specific.memo,			// 備考
		specific.delete_check,	// 削除フラグ
		updated,						// 更新日
		updated_id,						// 更新者ID
		id
	]);
	query.on('end', function(result,err) {

	});
	query.on('error', function (error) {
		console.log(sql + ' ' + error);
	});
};