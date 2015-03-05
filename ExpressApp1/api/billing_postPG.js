﻿//
// 請求情報ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// 請求データのPOST
exports.billing_post = function (req, res) {
	var billing = billing_check(req.body);
	if (billing.billing_entry_no === "") {
		res.send(billing);
	} else {
		var sql = "SELECT entry_no,billing_no FROM drc_sch.billing_info WHERE entry_no = $1 AND billing_no = $2";
		pg.connect(connectionString, function (err, connection) {
			// SQL実行
			connection.query(sql,[billing.billing_entry_no, billing.billing_no], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					if (results.rows.length == 0) {
						// 請求データのDB追加
						insertBilling(connection,billing, req, res);
					} else {
						// 請求データの更新
						updateBilling(connection, billing, req, res);
					}
				}
			});
		});
	}
};

var billing_check = function (billing) {
	// 日付項目チェック
	billing.pay_planning_date = tools.dateCheck(billing.pay_planning_date);
	billing.pay_complete_date = tools.dateCheck(billing.pay_complete_date);
	// 数値変換
	if (billing.delete_check) {
		billing.delete_check = Number(billing.delete_check);
	} else {
		billing.delete_check = 0;
	}
	if (billing.billing_no) {
		billing.billing_no = Number(billing.billing_no);
	} else {
		billing.billing_no = 0;
	}
	if (billing.pay_amount) {
		billing.pay_amount = Number(billing.pay_amount);
	} else {
		billing.pay_amount = 0;
	}
	if (billing.pay_result) {
		billing.pay_result = Number(billing.pay_result);
	} else {
		billing.pay_result = 0;
	}
	return billing;
};
var insertBilling = function (connection, billing, req, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = req.session.uid;
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.billing_info(' 
			+ "entry_no,"				// 案件番号
			+ "pay_planning_date,"		// 請求日
			+ "pay_complete_date,"		// 入金日
			+ "pay_amount,"				// 請求金額 
			+ "pay_result,"				// 請求区分
			+ "client_cd,"				// クライアントCD
			+ "client_division_cd,"		// クライアント部署CD
			+ "client_person_id,"		// クライアント担当者ID
			+ "memo,"					// 備考
			+ 'delete_check,'			// 削除フラグ
			+ 'created,'				// 作成日
			+ 'created_id,'				// 作成者ID
			+ 'updated,'				// 更新日 
			+ 'updated_id'				// 更新者ID
			+ ') values (' 
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)'
			;
		// SQL実行
		var query = connection.query(sql, [
			billing.billing_entry_no,		// 案件番号
			billing.pay_planning_date,		// 請求日
			billing.pay_complete_date,		// 入金日
			billing.pay_amount,				// 請求金額 
			billing.pay_result,				// 請求区分
			billing.billing_client_cd,				// クライアントCD
			billing.billing_client_division_cd,		// クライアント部署CD
			billing.billing_client_person_id,		// クライアント担当者ID
			billing.billing_memo,					// 備考
			billing.delete_check,			// 削除フラグ
			created,						// 作成日
			created_id,						// 作成者ID
			updated,						// 更新日
			updated_id						// 更新者ID
		], function (err, result) {
			if (err) {
				console.log(err);
				res.send({error_msg:'データベースの登録に失敗しました。'});
				connection.end();
			} else {
				res.send(billing);
				connection.end();
			}
		})

};
var updateBilling = function (connection, billing, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.billing_info SET ' 
			+ "entry_no = $1,"				// 案件番号
			+ "pay_planning_date = $2,"		// 請求日
			+ "pay_complete_date = $3,"		// 入金日
			+ "pay_amount = $4,"			// 請求金額 
			+ "pay_result = $5,"			// 請求区分
			+ "client_cd = $6,"				// クライアントCD
			+ "client_division_cd = $7,"	// クライアント部署CD
			+ "client_person_id = $8,"		// クライアント担当者ID
			+ "memo = $9,"					// 備考
			+ 'delete_check = $10,'			// 削除フラグ
			+ 'updated = $11,'				// 更新日 
			+ 'updated_id = $12'			// 更新者ID
			+ " WHERE entry_no = $13 AND billing_no = $14";
		// SQL実行
		var query = connection.query(sql, [
			billing.billing_entry_no,		// 案件番号
			billing.pay_planning_date,		// 請求日
			billing.pay_complete_date,		// 入金日
			billing.pay_amount,				// 請求金額 
			billing.pay_result,				// 請求区分
			billing.billing_client_cd,				// クライアントCD
			billing.billing_client_division_cd,		// クライアント部署CD
			billing.billing_client_person_id,		// クライアント担当者ID
			billing.billing_memo,					// 備考
			billing.delete_check,			// 削除フラグ
			updated,						// 更新日
			updated_id,						// 更新者ID
			billing.billing_entry_no,
			billing.billing_no
		], function (err, results) { 
			if (err) {
				console.log(err);
				res.send({ error_msg: 'データベースの更新に失敗しました。' });
				connection.end();
			} else {
				res.send(billing);
				connection.end();
			}
		});
};