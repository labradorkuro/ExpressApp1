//
// 権限設定ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 権限データのPOST
exports.auth_settings_post = function (req, res) {
//	var auth = req.body;
	var sql = "SELECT code FROM drc_sch.auth_settings WHERE code = $1 AND auth_no = $2";
	// 権限設定内容の取得	
//	for(var i = 1;i <= 13;i++) {
//		var fno = "00" + i;
//		fno = "f" + fno.slice(-2);
//		for(var j = 1;j <= 13;j++) {
//			var pno = "00" + j;
//			pno = "p" + pno.slice(-2);
//			var v = auth[fno + "_" + pno];
	pg.connect(connectionString, function (err, connection) {
		exePost(connection, req, res,sql, 1, 1);
	});	
//		}
//	}
};
var exePost = function(connection, req, res, sql, f_no, p_no) {
	var fno = "00" + f_no;
	fno = "f" + fno.slice(-2);
	var pno = "00" + p_no;
	pno = "p" + pno.slice(-2);
	var value = Number(req.body[fno + "_" + pno]);
//	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		connection.query(sql,[fno,pno ], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				if (results.rows.length == 0) {
					// DB追加
					insertAuth(connection, fno, pno, value, req, res);
				} else {
					// DB更新
					updateAuth(connection, fno, pno, value, req, res);
				}
				if (p_no < 6) {
					p_no++;
				} else{
					f_no++;
					p_no = 1;
				}
				if (f_no <= 13) {
					exePost(connection, req, res,sql, f_no, p_no);	
				}
			}
		});
//	});
};
var insertAuth = function (connection, fno, pno, value, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.auth_settings(' 
			+ 'code,'
			+ 'auth_no,'
			+ 'auth_value,'
			+ 'created,' // 作成日
			+ 'created_id,' // 作成者ID
			+ 'updated,' // 
			+ 'updated_id' // 更新者ID
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7)'
			;
	// SQL実行
	var query = connection.query(sql, [
		fno,
		pno,
		value,
		created,			// 作成日
		created_id,			// 作成者ID
		updated,
		updated_id			// 更新者ID
	], function (err, result) {
		if (err) {
			console.log(err);
		}
		if ((fno == "f13") && (pno == "p06")) {
			connection.end();
			res.send("");
		} 
	});
};
var updateAuth = function (connection, fno, pno, value, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.auth_settings SET ' 
			+ 'auth_value = $3,'
			+ 'updated_id = $4,' // 更新者ID
			+ 'updated = $5'
			+ " WHERE code = $1 AND auth_no = $2";
		// SQL実行
	var query = connection.query(sql, [
		fno,
		pno,
		value,
		updated_id,			// 更新者ID
		updated
	], function (err, results) { 
		if (err) {
			console.log(err);
		} else {
		}
		if ((fno == "f13") && (pno == "p06")) {
			connection.end();
			res.send("");
		} 
	});
};
