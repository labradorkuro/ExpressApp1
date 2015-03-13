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
		var sql = "SELECT item_cd FROM drc_sch.test_item_list WHERE item_cd = $1";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql,[test_item.item_cd], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// データのDB追加
						insertTest_item(connection,test_item, req, res);
					} else {
						// データの更新
						updateTest_item(connection, test_item, req, res);
					}
				}
			});
		});
	}
};

var test_item_check = function (test_item) {
	// 数値変換
	if (test_item.item_type) {
		test_item.item_type = Number(test_item.item_type);
	} else {
		test_item.item_type = 1;
	}
	if (test_item.delete_check) {
		test_item.delete_check = Number(test_item.delete_check);
	} else {
		test_item.delete_check = 0;
	}
	return test_item;
};
var insertTest_item = function (connection, test_item, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.test_item_list(' 
			+ 'item_cd,'		// 項目CD 
			+ 'item_name,'		// 項目名称
			+ 'item_type,'		// 分類区分
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
			test_item.item_cd,
			test_item.item_name,
			test_item.item_type,
			test_item.memo,
			test_item.delete_check,
			created,			// 作成日
			created_id,			// 作成者ID
			updated,
			updated_id			// 更新者ID
		], function (err, result) {
			if (err) {
				console.log(err);
				res.send({error_msg:'データベースの登録に失敗しました。'});
				connection.end();
			} else {
				res.send(test_item);
				connection.end();
			}
		});
	//});
};
var updateTest_item = function (connection, test_item, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.test_item_list SET ' 
			+ 'item_name = $1,'		// 項目名称
			+ 'item_type = $2,'		// 分類区分
			+ 'memo = $3,'			// 備考
			+ 'delete_check = $4,'	// 削除フラグ
			+ 'updated_id = $5,'	// 更新者ID
			+ 'updated = $6'
			+ " WHERE item_cd = $7";
		// SQL実行
		var query = connection.query(sql, [
			test_item.item_name,
			test_item.item_type,
			test_item.memo,
			test_item.delete_check,
			updated_id,			// 更新者ID
			updated,
			test_item.item_cd
		], function (err, results) { 
			if (err) {
				console.log(err);
				res.send({ error_msg: 'データベースの更新に失敗しました。' });
				connection.end();
			} else {
				res.send(test_item);
				connection.end();
			}
		});
	//});
};

