//
// 得意先情報ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 社員データのPOST
exports.client_post = function (req, res) {
	var client = client_check(req.body);
	if (client.client_cd === "") {
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

var client_check = function (client) {
	// 日付項目チェック
	client.billing_limit = tools.dateCheck(client.billing_limit);
	client.payment_date = tools.dateCheck(client.payment_date);
	// 数値変換
	if (client.delete_check) {
		client.delete_check = Number(client.delete_check);
	} else {
		client.delete_check = 0;
	}
	return client;
};

var insertClient = function (connection, client, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.client_list(' 
		+ 'client_cd,' 
		+ 'name_1,' 
		+ 'name_2,' 
		+ "compellation," // 敬称
		+ "kana," // カナ
		+ "email," // メールアドレス 
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "prepared_name," // 担当者氏名
		+ "prepared_compellation," // 担当者敬称
		+ "prepared_division," // 担当部署
		+ "prepared_title," // 担当者役職名
		+ "prepared_cellular," // 担当者携帯電話番号
		+ "prepared_email," // 担当者メールアドレス
		+ "prepared_telno," // 担当者電話番号
		+ "prepared_faxno," // 担当者FAX番号
		+ "billing_limit," // 請求締日
		+ "payment_date," // 支払日
		+ "memo," 
		+ 'delete_check,' 
		+ "created," 
		+ 'created_id,' 
		+ "updated," 
		+ 'updated_id' 
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)'
			;
	//pg.connect(connectionString, function (err, connection) {
	// SQL実行
	var query = connection.query(sql, [
		client.client_cd,
		client.name_1,
		client.name_2, 
		client.compellation, // 敬称
		client.kana, // カナ
		client.email, // メールアドレス 
		client.zipcode, // 郵便番号
		client.address_1, // 住所１
		client.address_2, // 住所２
		client.tel_no, // 電話番号
		client.fax_no, // FAX番号
		client.prepared_name, // 担当者氏名
		client.prepared_compellation, // 担当者敬称
		client.prepared_division, // 担当部署
		client.prepared_title, // 担当者役職名
		client.prepared_cellular, // 担当者携帯電話番号
		client.prepared_email, // 担当者メールアドレス
		client.prepared_telno, // 担当者電話番号
		client.prepared_faxno, // 担当者FAX番号
		client.billing_limit, // 請求締日
		client.payment_date, // 支払日
		client.memo, 
		client.delete_check,
		created,			// 作成日
		created_id,			// 作成者ID
		updated,
		updated_id			// 更新者ID
	], function (err, result) {
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの登録に失敗しました。' });
			connection.end();
		} else {
			res.send(client);
			connection.end();
		}
	});
	//});
};
var updateClient = function (connection, client, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.client_list SET ' 
		+ 'client_cd = $1,' 
		+ 'name_1 = $2,' 
		+ 'name_2 = $3,' 
		+ "compellation = $4," // 敬称
		+ "kana = $5," // カナ
		+ "email = $6," // メールアドレス 
		+ "zipcode = $7," // 郵便番号
		+ "address_1 = $8," // 住所１
		+ "address_2 = $9," // 住所２
		+ "tel_no = $10," // 電話番号
		+ "fax_no = $11," // FAX番号
		+ "prepared_name = $12," // 担当者氏名
		+ "prepared_compellation = $13," // 担当者敬称
		+ "prepared_division = $14," // 担当部署
		+ "prepared_title = $15," // 担当者役職名
		+ "prepared_cellular = $16," // 担当者携帯電話番号
		+ "prepared_email = $17," // 担当者メールアドレス
		+ "prepared_telno = $18," // 担当者電話番号
		+ "prepared_faxno = $19," // 担当者FAX番号
		+ "billing_limit = $20," // 請求締日
		+ "payment_date = $21," // 支払日
		+ "memo = $22," 
		+ 'delete_check = $23,' // 削除フラグ
		+ 'updated_id = $24,' // 更新者ID
		+ 'updated = $25' 
		+ " WHERE client_cd = $26";
	//pg.connect(connectionString, function (err, connection) {
	// SQL実行
	var query = connection.query(sql, [
		client.client_cd,
		client.name_1,
		client.name_2, 
		client.compellation, // 敬称
		client.kana, // カナ
		client.email, // メールアドレス 
		client.zipcode, // 郵便番号
		client.address_1, // 住所１
		client.address_2, // 住所２
		client.tel_no, // 電話番号
		client.fax_no, // FAX番号
		client.prepared_name, // 担当者氏名
		client.prepared_compellation, // 担当者敬称
		client.prepared_division, // 担当部署
		client.prepared_title, // 担当者役職名
		client.prepared_cellular, // 担当者携帯電話番号
		client.prepared_email, // 担当者メールアドレス
		client.prepared_telno, // 担当者電話番号
		client.prepared_faxno, // 担当者FAX番号
		client.billing_limit, // 請求締日
		client.payment_date, // 支払日
		client.memo, 
		client.delete_check,
		updated_id,			// 更新者ID
		updated,
		client.client_cd
	], function (err, results) {
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの更新に失敗しました。' });
			connection.end();
		} else {
			res.send(client);
			connection.end();
		}
	});
	//});
};

