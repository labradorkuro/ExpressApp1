//
// 動作設定ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 社員データのPOST
exports.configuration_post = function (req, res) {
	var config = req.body;
	var sql = "SELECT id FROM drc_sch.configuration WHERE id = $1";
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		connection.query(sql,[req.params.id ], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				if (results.rows.length == 0) {
					// DB追加
					insertConfig(connection, config, req, res);
				} else {
					// DB更新
					updateConfig(connection, config, req, res);
				}
			}
		});
	});
};

var insertConfig = function (connection, config, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.configuration(' 
			+ 'drc_name,'
			+ 'drc_zipcode,'
			+ 'drc_address1,'
			+ 'drc_address2,'
			+ 'drc_telno,'
			+ 'drc_faxno,'
			+ 'consumption_tax,'
			+ 'quote_form_memo_define_1,' 
			+ 'quote_form_memo_define_2,' 
			+ 'quote_form_memo_define_3,' 
			+ 'created,' // 作成日
			+ 'created_id,' // 作成者ID
			+ 'updated,' // 
			+ 'updated_id' // 更新者ID
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)'
			;
	// SQL実行
	var query = connection.query(sql, [
		config.drc_name,
		config.drc_zipcode,
		config.drc_address1,
		config.drc_address2,
		config.drc_telno,
		config.drc_faxno,
		config.consumption_tax,
		config.quote_form_memo_define_1,
		config.quote_form_memo_define_2,
		config.quote_form_memo_define_3,
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
			res.send(config);
		}
	});
};
var updateConfig = function (connection, config, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.configuration SET ' 
			+ 'drc_name = $1,'
			+ 'drc_zipcode = $2,'
			+ 'drc_address1 = $3,'
			+ 'drc_address2 = $4,'
			+ 'drc_telno = $5,'
			+ 'drc_faxno = $6,'
			+ 'consumption_tax = $7,'
			+ 'quote_form_memo_define_1 = $8,' 
			+ 'quote_form_memo_define_2 = $9,' 
			+ 'quote_form_memo_define_3 = $10,' 
			+ 'updated_id = $11,' // 更新者ID
			+ 'updated = $12'
			+ " WHERE id = $13";
		// SQL実行
	var query = connection.query(sql, [
		config.drc_name,
		config.drc_zipcode,
		config.drc_address1,
		config.drc_address2,
		config.drc_telno,
		config.drc_faxno,
		config.consumption_tax,
		config.quote_form_memo_define_1,
		config.quote_form_memo_define_2,
		config.quote_form_memo_define_3,
		updated_id,			// 更新者ID
		updated,
		req.params.id
	], function (err, results) { 
		connection.end();
		if (err) {
			console.log(err);
			res.send({ error_msg: 'データベースの更新に失敗しました。' });
		} else {
			res.send(config);
		}
	});
};
