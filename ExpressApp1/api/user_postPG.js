//
// 社員情報ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 社員データのPOST
exports.user_post = function (req, res) {
	var user = user_check(req.body);
	if (user.uid === "") {
		res.send(user);
	} else {
		var sql = "SELECT uid FROM drc_sch.user_list WHERE uid = $1";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql,[user.uid], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// 社員データのDB追加
						insertUser(connection,user, req, res);
					} else {
						// 社員データの更新
						updateUser(connection, user, req, res);
					}
				}
			});
		});
	}
};

var user_check = function (user) {
	// 日付項目チェック
	user.start_date = tools.dateCheck(user.start_date);
	// 数値変換
	if (user.delete_check) {
		user.delete_check = Number(user.delete_check);
	} else {
		user.delete_check = 0;
	}
	return user;
};
var insertUser = function (connection, user, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.user_list('
			+ 'uid,'		// ユーザID
			+ 'password,'
			+ 'name,'		// 名前
			+ 'u_no,'		// 社員番号
			+ 'start_date,' // 入社日
			+ 'base_cd,'	// 拠点CD
			+ 'division,'	// 事業部CD
			+ 'telno,'		// 内線
			+ 'title,'		// 役職名
			+ 'auth_no,'		// 権限設定
			+ 'delete_check,'	// 削除フラグ
			+ 'created,'	// 作成日
			+ 'created_id,' // 作成者ID
			+ 'updated,'	//
			+ 'updated_id,' // 更新者ID*/
			+ 'email'		// メールアドレス*/
			+ ') values ('
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)'
			;
	//pg.connect(connectionString, function (err, connection) {
		// SQL実行
		var query = connection.query(sql, [
			user.uid,
			//user.password,
			"",
			user.name,
			user.u_no,
			user.start_date,
			user.base_cd,
			user.division,
			user.telno,
			user.title,
			user.auth_no,
			user.delete_check,
			created,			// 作成日
			created_id,			// 作成者ID
			updated,
			updated_id,			// 更新者ID*/
			user.email
		], function (err, result) {
			connection.end();
			if (err) {
				console.log(err);
				res.send({error_msg:'データベースの登録に失敗しました。'});
			} else {
				res.send(user);
			}
		});
	//});
};
var updateUser = function (connection, user, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.user_list SET '
			+ 'uid = $1,'			// ユーザID
			+ 'name = $2,'			// 名前
			+ 'u_no = $3,'			//
			+ 'start_date = $4,'	// 入社日
			+ 'base_cd = $5,'		// 拠点CD
			+ 'division = $6,'		// 事業部CD
			+ 'telno = $7,'			// 内線
			+ 'title = $8,'			// 役職名
			+ 'auth_no = $9,'		// 権限設定
			+ 'email = $10,'		// メールアドレス
			+ 'delete_check = $11,'	// 削除フラグ
			+ 'updated_id = $12,'	// 更新者ID
			+ 'updated = $13'
			+ " WHERE uid = $14";
	//pg.connect(connectionString, function (err, connection) {
		// SQL実行
		var query = connection.query(sql, [
			user.uid,
			//user.password,
			user.name,
			user.u_no,
			user.start_date,
			user.base_cd,
			user.division,
			user.telno,
			user.title,
			user.auth_no,
			user.email,
			user.delete_check,
			updated_id,			// 更新者ID
			updated,
			user.uid
		], function (err, results) {
			connection.end();
			if (err) {
				console.log(err);
				res.send({ error_msg: 'データベースの更新に失敗しました。' });
			} else {
				res.send(user);
			}
		});
	//});
};

exports.password_post = function (req, res) {
	var user = req.body;
	if (user.uid === "") {
		res.send(user);
	} else {
		var sql = "SELECT uid FROM drc_sch.user_list WHERE uid = $1";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql, [user.uid], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// ユーザが未登録
						res.send(user);
					} else {
						// 社員データの更新
						updateUserPassword(connection, user, req, res);
					}
				}
			});
		});
	}
};

var updateUserPassword = function (connection, user, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.user_list SET '
			+ 'password = $1,' // ユーザID
			+ 'updated_id = $2,' // 更新者ID
			+ 'updated = $3'
			+ " WHERE uid = $4";
	// SQL実行
	var query = connection.query(sql, [
			user.password,
			updated_id,			// 更新者ID
			updated,
			user.uid
		], function (err, results) {
		connection.end();
		if (err) {
			console.log(err);
		} else {
			res.send(user);
		}
	});
};
