//
// 社員情報ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 社員データのPOST
exports.division_post = function (req, res) {
	var division = division_check(req.body);
	if (division.division === "") {
		res.send(division);
	} else {
		var sql = "SELECT division FROM drc_sch.division_info WHERE division = $1";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql, [division.division], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// データのDB追加
						insertDivision(connection, division, req, res);
					} else {
						// データの更新
						updateDivision(connection, division, req, res);
					}
				}
			});
		});
	}
};

var division_check = function (division) {
	return division;
};

var insertDivision = function (connection, division, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.division_info(' 
			+ 'division,'		// 事業部ID
			+ 'division_name,'	// 事業部名 
			+ 'delete_check,'	// 削除フラグ
			+ 'created,'		// 作成日
			+ 'created_id,'		// 作成者ID
			+ 'updated,'		// 更新日
			+ 'updated_id'		// 更新者ID
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7)'
			;
	//pg.connect(connectionString, function (err, connection) {
	// SQL実行
	var query = connection.query(sql, [
			division.division,
			division.division_name,
			division.delete_check,
			created,			// 作成日
			created_id,			// 作成者ID
			updated,
			updated_id			// 更新者ID
		], function (err, result) {
		connection.end();
		if (err) {
			console.log(err);
		} else {
			res.send(division);
		}
	});
	//});
};
var updateDivision = function (connection, division, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.division_info SET ' 
			+ 'division = $1,' // 事業部ID
			+ 'division_name = $2,' // 事業部名
			+ 'delete_check = $3,' // 削除フラグ
			+ 'updated_id = $4,' // 更新者ID
			+ 'updated = $5' 
			+ " WHERE division = $6";
	//pg.connect(connectionString, function (err, connection) {
	// SQL実行
	var query = connection.query(sql, [
			division.division,
			division.division_name,
			division.delete_check,
			updated_id,			// 更新者ID
			updated,
			division.division
		], function (err, results) {
		connection.end();
		if (err) {
			console.log(err);
		} else {
			res.send(division);
		}
	});
	//});
};
