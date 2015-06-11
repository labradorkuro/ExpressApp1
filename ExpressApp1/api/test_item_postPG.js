//
// 試験分類ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// データのPOST
exports.test_item_post = function (req, res) {
	var test_item = test_item_check(req.body);
	if (test_item.item_cd === "") {
		res.send(test_item);
	} else {
		if (!test_item.large_item_cd || test_item.large_item_cd == "") {
			// 大分類の保存
			var sql = "SELECT item_cd FROM drc_sch.test_large_class WHERE item_cd = $1";
			pg.connect(connectionString, function (err, connection) {
				// SQL実行
				connection.query(sql,[test_item.item_cd], function (err, results) {
					if (err) {
						console.log(err);
					} else {
						if (results.rows.length == 0) {
							// データのDB追加
							insertTest_item_large(connection,test_item, req, res);
						} else {
							// データの更新
							updateTest_item_large(connection, test_item, req, res);
						}
					}
				});
			});
		} else {
			// 中分類の保存
			var sql = "SELECT item_cd FROM drc_sch.test_middle_class WHERE item_cd = $1 AND large_item_cd = $2";
			pg.connect(connectionString, function (err, connection) {
				// SQL実行
				connection.query(sql,[test_item.item_cd, test_item.large_item_cd], function (err, results) {
					if (err) {
						console.log(err);
					} else {
						if (results.rows.length == 0) {
							// データのDB追加
							insertTest_item_middle(connection,test_item, req, res);
						} else {
							// データの更新
							updateTest_item_middle(connection, test_item, req, res);
						}
					}
				});
			});
		}
	}
};

var test_item_check = function (test_item) {
	// 数値変換
	if (test_item.delete_check) {
		test_item.delete_check = Number(test_item.delete_check);
	} else {
		test_item.delete_check = 0;
	}
	return test_item;
};

// 大分類の追加
var insertTest_item_large = function (connection, test_item, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.test_large_class(' 
			+ 'item_cd,'		// 項目CD 
			+ 'item_name,'		// 項目名称
			+ 'memo,'			// 備考
			+ 'delete_check,'	// 削除フラグ
			+ 'created,'		// 作成日
			+ 'created_id,'		// 作成者ID
			+ 'updated,'		// 更新日 
			+ 'updated_id'		// 更新者ID
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7,$8)'
			;
		// SQL実行
		var query = connection.query(sql, [
			test_item.item_cd,
			test_item.item_name,
			test_item.memo,
			test_item.delete_check,
			created,			// 作成日
			created_id,			// 作成者ID
			updated,
			updated_id			// 更新者ID
		], function (err, result) {
			connection.end();
			if (err) {
				console.log(err);
				res.send({error_msg:'データベースの登録に失敗しました。'});
			} else {
				res.send(test_item);
			}
		});
	//});
};
// 大分類の更新
var updateTest_item_large = function (connection, test_item, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.test_large_class SET ' 
			+ 'item_name = $1,'		// 項目名称
			+ 'memo = $2,'			// 備考
			+ 'delete_check = $3,'	// 削除フラグ
			+ 'updated_id = $4,'	// 更新者ID
			+ 'updated = $5'
			+ " WHERE item_cd = $6";
		// SQL実行
		var query = connection.query(sql, [
			test_item.item_name,
			test_item.memo,
			test_item.delete_check,
			updated_id,			// 更新者ID
			updated,
			test_item.item_cd
		], function (err, results) { 
			connection.end();
			if (err) {
				console.log(err);
				res.send({ error_msg: 'データベースの更新に失敗しました。' });
			} else {
				res.send(test_item);
			}
		});
	//});
};
// 中分類の追加
var insertTest_item_middle = function (connection, test_item, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.test_middle_class(' 
			+ 'large_item_cd,'	// 大分類CD
			+ 'item_cd,'		// 項目CD 
			+ 'item_name,'		// 項目名称
			+ 'memo,'			// 備考
			+ 'delete_check,'	// 削除フラグ
			+ 'created,'		// 作成日
			+ 'created_id,'		// 作成者ID
			+ 'updated,'		// 更新日 
			+ 'updated_id'		// 更新者ID
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9)'
			;
		// SQL実行
		var query = connection.query(sql, [
			test_item.large_item_cd,
			test_item.item_cd,
			test_item.item_name,
			test_item.memo,
			test_item.delete_check,
			created,			// 作成日
			created_id,			// 作成者ID
			updated,
			updated_id			// 更新者ID
		], function (err, result) {
			connection.end();
			if (err) {
				console.log(err);
				res.send({error_msg:'データベースの登録に失敗しました。'});
			} else {
				res.send(test_item);
			}
		});
	//});
};
// 中分類の更新
var updateTest_item_middle = function (connection, test_item, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.test_middle_class SET ' 
			+ 'item_name = $1,'		// 項目名称
			+ 'memo = $2,'			// 備考
			+ 'delete_check = $3,'	// 削除フラグ
			+ 'updated_id = $4,'	// 更新者ID
			+ 'updated = $5'
			+ " WHERE item_cd = $6 AND large_item_cd = $7";
		// SQL実行
		var query = connection.query(sql, [
			test_item.item_name,
			test_item.memo,
			test_item.delete_check,
			updated_id,			// 更新者ID
			updated,
			test_item.item_cd,
			test_item.large_item_cd
		], function (err, results) { 
			connection.end();
			if (err) {
				console.log(err);
				res.send({ error_msg: 'データベースの更新に失敗しました。' });
			} else {
				res.send(test_item);
			}
		});
	//});
};
