//
// 得意先情報ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 得意先データのPOST
exports.client_post = function (req, res) {
	var client = client_check(req.body);
	if ((client.client_cd === null) || (client.client_cd === "")) {
		res.send(client);
	} else {
		var sql = "SELECT client_cd FROM drc_sch.client_list WHERE client_cd = $1";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql, [client.client_cd], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// 得意先データのDB追加
						insertClient(connection, client, req, res);
					} else {
						// 得意先データの更新
						updateClient(connection, client, req, res);
					}
				}
			});
		});
	}
};
// 部署データのPOST
exports.client_division_post = function (req, res) {
	var division = client_check(req.body);
	if ((division.division_client_cd === "") || (division.division_cd === '')) {
		res.send(division);
	} else {
		var sql = "SELECT client_cd, division_cd FROM drc_sch.client_division_list WHERE client_cd = $1 AND division_cd = $2";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql, [division.division_client_cd,division.division_cd], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// 部署データのDB追加
						insertClientDivision(connection, division, req, res);
					} else {
						// 部署データの更新
						updateClientDivision(connection, division, req, res);
					}
				}
			});
		});
	}
};
// 担当者データのPOST
exports.client_person_post = function (req, res) {
	var person = client_check(req.body);
	if (person.person_client_cd === "" || person.person_division_cd === '' || person.person_id === '') {
		res.send(person);
	} else {
		var sql = "SELECT client_cd, division_cd, person_id FROM drc_sch.client_person_list WHERE client_cd = $1 AND person_id = $2";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql, [person.person_client_cd, person.person_id], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// 担当者データのDB追加
						insertClientPerson(connection, person, req, res);
					} else {
						// 担当者データの更新
						updateClientPerson(connection, person, req, res);
					}
				}
			});
		});
	}
};

var client_check = function (client) {
	// 日付項目チェック
	//client.billing_limit = tools.dateCheck(client.billing_limit);
	//client.payment_date = tools.dateCheck(client.payment_date);
	// 数値変換
	if (client.delete_check) {
		client.delete_check = Number(client.delete_check);
	} else {
		client.delete_check = 0;
	}
	return client;
};

// 得意先情報の追加
var insertClient = function (connection, client, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.client_list('
		+ 'client_cd,'
		+ 'name_1,'
		+ 'name_2,'
		+ "kana," // カナ
		+ "email," // メールアドレス
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "memo,"
		+ 'delete_check,'
		+ "created,"
		+ 'created_id,'
		+ "updated,"
		+ 'updated_id'
			+ ') values ('
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)'
			;
	// SQL実行
	var query = connection.query(sql, [
		client.client_cd,	// クライアントCD
		client.name_1,		// クライアント名１
		client.name_2,		// クライアント名２
		client.kana,		// カナ
		client.email,		// メールアドレス
		client.zipcode,		// 郵便番号
		client.address_1,	// 住所１
		client.address_2,	// 住所２
		client.tel_no,		// 電話番号
		client.fax_no,		// FAX番号
		client.memo,		// メモ
		client.delete_check,// 削除フラグ
		created,			// 作成日
		created_id,			// 作成者ID
		updated,			// 更新日
		updated_id			// 更新者ID
	], function (err, result) {
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの登録に失敗しました。' });
		} else {
			res.send(client);
		}
	});
};
// 得意先情報の更新
var updateClient = function (connection, client, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.client_list SET '
		+ 'client_cd = $1,'
		+ 'name_1 = $2,'
		+ 'name_2 = $3,'
		+ "kana = $4,"		// カナ
		+ "email = $5,"		// メールアドレス
		+ "zipcode = $6,"	// 郵便番号
		+ "address_1 = $7," // 住所１
		+ "address_2 = $8," // 住所２
		+ "tel_no = $9,"	// 電話番号
		+ "fax_no = $10,"	// FAX番号
		+ "memo = $11,"
		+ 'delete_check = $12,' // 削除フラグ
		+ 'updated_id = $13,' // 更新者ID
		+ 'updated = $14'
		+ " WHERE client_cd = $15";
	// SQL実行
	var query = connection.query(sql, [
		client.client_cd,
		client.name_1,
		client.name_2,
		client.kana,		// カナ
		client.email,		// メールアドレス
		client.zipcode,		// 郵便番号
		client.address_1,	// 住所１
		client.address_2,	// 住所２
		client.tel_no,		// 電話番号
		client.fax_no,		// FAX番号
		client.memo,
		client.delete_check,
		updated_id,			// 更新者ID
		updated,
		client.client_cd
	], function (err, results) {
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの更新に失敗しました。' });
		} else {
			res.send(client);
		}
	});
};

// 部署情報の追加
var insertClientDivision = function (connection, division, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.client_division_list('
		+ 'client_cd,'			// クライアントコード
		+ 'division_cd,'		// 部署コード
		+ 'name,'				// 部署名
		+ "kana,"				// カナ
		+ "email,"				// メールアドレス
		+ "zipcode,"			// 郵便番号
		+ "address_1,"			// 住所１
		+ "address_2,"			// 住所２
		+ "tel_no,"				// 電話番号
		+ "fax_no,"				// FAX番号
		+ "billing_limit,"		// 請求締日
		+ "payment_date,"		// 支払日
		+ "holiday_support,"	// 休日対応
		+ "memo,"				// メモ
		+ 'delete_check,'
		+ "created,"
		+ 'created_id,'
		+ "updated,"
		+ 'updated_id'
			+ ') values ('
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)'
			;
	// SQL実行
	var query = connection.query(sql, [
		division.division_client_cd,// クライアントCD
		division.division_cd,		// 部署CD
		division.division_name,		// 部署名
		division.division_kana,		// カナ
		division.division_email,	// メールアドレス
		division.division_zipcode,	// 郵便番号
		division.division_address_1,// 住所１
		division.division_address_2,// 住所２
		division.division_tel_no,	// 電話番号
		division.division_fax_no,	// FAX番号
		division.billing_limit,		// 請求締日
		division.payment_date,		// 支払日
		division.holiday_support,	// 休日対応
		division.division_memo,				// メモ
		division.division_delete_check,		// 削除フラグ
		created,					// 作成日
		created_id,					// 作成者ID
		updated,					// 更新日
		updated_id					// 更新者ID
	], function (err, result) {
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの登録に失敗しました。' });
		} else {
			res.send(division);
		}
	});
};
// 得意先情報の更新
var updateClientDivision = function (connection, division, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.client_division_list SET '
		+ 'client_cd = $1,'		// クライアントCD
		+ 'division_cd = $2,'	// 部署CD
		+ 'name = $3,'			// 部署名
		+ "kana = $4,"			// カナ
		+ "email = $5,"			// メールアドレス
		+ "zipcode = $6,"		// 郵便番号
		+ "address_1 = $7,"		// 住所１
		+ "address_2 = $8,"		// 住所２
		+ "tel_no = $9,"		// 電話番号
		+ "fax_no = $10,"		// FAX番号
		+ "billing_limit = $11,"	// 請求締日
		+ "payment_date = $12,"		// 支払日
		+ "holiday_support = $13,"	// 休日対応
		+ "memo = $14,"			// メモ
		+ 'delete_check = $15,' // 削除フラグ
		+ 'updated_id = $16,'	// 更新者ID
		+ 'updated = $17'		// 更新日
		+ " WHERE client_cd = $18 AND division_cd = $19";
	// SQL実行
	var query = connection.query(sql, [
		division.division_client_cd,// クライアントCD
		division.division_cd,		// 部署CD
		division.division_name,		// 部署名
		division.division_kana,		// カナ
		division.division_email,	// メールアドレス
		division.division_zipcode,	// 郵便番号
		division.division_address_1,// 住所１
		division.division_address_2,// 住所２
		division.division_tel_no,	// 電話番号
		division.division_fax_no,	// FAX番号
		division.billing_limit,		// 請求締日
		division.payment_date,		// 支払日
		division.holiday_support,	// 休日対応
		division.division_memo,		// メモ
		division.division_delete_check,		// 削除フラグ
		updated_id,					// 更新者ID
		updated,					// 更新日
		division.division_client_cd,// クライアントCD
		division.division_cd		// 部署CD
	], function (err, results) {
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの更新に失敗しました。' });
		} else {
			res.send(division);
		}
	});
};

// 担当者情報の追加
var insertClientPerson = function (connection, person, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.client_person_list('
		+ 'client_cd,'			// クライアントコード
		+ 'division_cd,'		// 部署コード
		+ 'person_id,'			// 担当者ID
		+ 'name,'				// 担当者名
		+ "kana,"				// カナ
		+ "compellation,"		// 敬称
		+ "title,"				// 役職名
		+ "email,"				// メールアドレス
		+ "memo,"				// メモ
		+ 'delete_check,'
		+ "created,"
		+ 'created_id,'
		+ "updated,"
		+ 'updated_id'
			+ ') values ('
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)'
			;
	// SQL実行
	var query = connection.query(sql, [
		person.person_client_cd,	// クライアントCD
		person.person_division_cd,	// 部署CD
		person.person_id,			// 担当者ID
		person.person_name,			// 担当者名
		person.person_kana,			// カナ
		person.compellation,		// 敬称
		person.title,				// 役職名
		person.person_email,		// メールアドレス
		person.person_memo,			// メモ
		person.person_delete_check,	// 削除フラグ
		created,					// 作成日
		created_id,					// 作成者ID
		updated,					// 更新日
		updated_id					// 更新者ID
	], function (err, result) {
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの登録に失敗しました。' });
		} else {
			res.send(person);
		}
	});
};
// 担当者情報の更新
var updateClientPerson = function (connection, person, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.client_person_list SET '
		+ 'client_cd = $1,'		// クライアントCD
		+ 'division_cd = $2,'	// 部署CD
		+ 'person_id = $3,'		// 担当者CD
		+ 'name = $4,'			// 担当者名
		+ "kana = $5,"			// カナ
		+ "compellation = $6,"	// 敬称
		+ "title = $7,"			// 役職名
		+ "email = $8,"			// メールアドレス
		+ "memo = $9,"			// メモ
		+ 'delete_check = $10,' // 削除フラグ
		+ 'updated_id = $11,'	// 更新者ID
		+ 'updated = $12'		// 更新日
		+ " WHERE client_cd = $13 AND person_id = $14";
	// SQL実行
	var query = connection.query(sql, [
		person.person_client_cd,	// クライアントCD
		person.person_division_cd,	// 部署CD
		person.person_id,			// 担当者ID
		person.person_name,				// 担当者名
		person.person_kana,				// カナ
		person.compellation,		// 敬称
		person.title,				// 役職名
		person.person_email,				// メールアドレス
		person.person_memo,				// メモ
		person.person_delete_check,		// 削除フラグ
		updated_id,					// 更新者ID
		updated,					// 更新日
		person.person_client_cd,	// クライアントCD
		person.person_id
	], function (err, results) {
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの更新に失敗しました。' });
		} else {
			res.send(person);
		}
	});
};
