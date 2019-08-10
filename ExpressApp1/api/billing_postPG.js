//
// 請求情報ダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var notify = models['notify_settings'];
var billing_post = require('./billing_postPG');

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
					billing_post.checkPayResultForUpdateEntryStatus(billing.billing_entry_no);
					// 請求区分が「請求可」の場合はメール通知する
					checkPayResult(billing);
				}
			});
		});
	}
};

var billing_check = function (billing) {
	billing.nyukin_yotei_p = (billing.nyukin_yotei_p == 1)
	// 日付項目チェック
	billing.nyukin_yotei_date = tools.dateCheck(billing.nyukin_yotei_date);
	billing.pay_planning_date = tools.dateCheck(billing.pay_planning_date);
	billing.pay_complete_date = tools.dateCheck(billing.pay_complete_date);
	// 数値変換
	if (billing.billing_delete_check) {
		billing.billing_delete_check = Number(billing.billing_delete_check);
	} else {
		billing.billing_delete_check = 0;
	}
	if (billing.billing_no) {
		billing.billing_no = Number(billing.billing_no);
	} else {
		billing.billing_no = 0;
	}
	// 税抜請求額
	if (billing.pay_amount) {
		billing.pay_amount = Number(billing.pay_amount);
	} else {
		billing.pay_amount = 0;
	}
	// 消費税
	if (billing.pay_amount_tax) {
		billing.pay_amount_tax = Number(billing.pay_amount_tax);
	} else {
		billing.pay_amount_tax = 0;
	}
	// 請求額合計
	if (billing.pay_amount_total) {
		billing.pay_amount_total = Number(billing.pay_amount_total);
	} else {
		billing.pay_amount_total = 0;
	}
	// 入金額
	if (billing.pay_complete) {
		billing.pay_complete = Number(billing.pay_complete);
	} else {
		billing.pay_complete = 0;
	}
	if (billing.pay_result) {
		billing.pay_result = Number(billing.pay_result);
	} else {
		billing.pay_result = 0;
	}
	if (billing.billing_kind) {
		billing.billing_kind = Number(billing.billing_kind);
	} else {
		billing.billing_kind = 0;
	}
	if (billing.furikomi_ryo) {
		billing.furikomi_ryo = Number(billing.furikomi_ryo);
	} else {
		billing.furikomi_ryo = 0;
	}
	if (billing.nyukin_total) {
		billing.nyukin_total = Number(billing.nyukin_total);
	} else {
		billing.nyukin_total = 0;
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
			+ "billing_number,"			// 請求番号（経理用）
			+ "pay_planning_date,"		// 請求日
			+ "nyukin_yotei_date,"		// 入金予定日
			+ "pay_complete_date,"		// 入金日
			+ "pay_amount,"				// 税抜請求金額
			+ "pay_amount_tax,"			// 消費税
			+ "pay_amount_total,"		// 請求金額合計
			+ "pay_complete,"			// 入金額
			+ "pay_result,"				// 請求区分
			+ "client_cd,"				// クライアントCD
			+ "client_name,"			// クライアント名
			+ "client_division_cd,"		// クライアント部署CD
			+ "client_division_name,"	// クライアント部署名
			+ "client_person_id,"		// クライアント担当者ID
			+ "client_person_name,"		// クライアント担当者名
			+ "client_info,"			// 請求先情報（住所、電話、Fax）
			+ "memo,"					// 備考
			+ "agent_cd,"				// 代理店CD
			+ "agent_name,"				// 代理店名
			+ "agent_division_cd,"		// 代理店部署CD
			+ "agent_division_name,"	// 代理店部署名
			+ "agent_person_id,"		// 代理店担当者ID
			+ "agent_person_name,"		// 代理店担当者名
			+ "agent_info,"				// 請求先情報（住所、電話、Fax）
			+ "agent_memo,"				// 備考
			+ "etc_cd,"					// その他請求先CD
			+ "etc_name,"				// その他請求先名
			+ "etc_division_cd,"		// その他請求先部署CD
			+ "etc_division_name,"		// その他請求先部署名
			+ "etc_person_id,"			// その他請求先担当者ID
			+ "etc_person_name,"		// その他請求先担当者名
			+ "etc_info,"				// 請求先情報（住所、電話、Fax）
			+ "etc_memo,"				// 備考
			+ "billing_kind,"			// 請求先種別
			+ 'furikomi_ryo,'			// 振込手数料
			+ 'nyukin_total,'			// 合計
			+ "nyukin_yotei_p,"			// 入金予定日（仮）
			+ 'kentai,'					// 検体名
			+ 'delete_check,'			// 削除フラグ
			+ 'created,'				// 作成日
			+ 'created_id,'				// 作成者ID
			+ 'updated,'				// 更新日
			+ 'updated_id'				// 更新者ID
			+ ') values ('
			+ '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'
			+ '$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,'
			+ '$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44)'
			;
		// SQL実行
		var query = connection.query(sql, [
			billing.billing_entry_no,		// 案件番号
			billing.billing_number,			// 請求番号
			billing.pay_planning_date,		// 請求日
			billing.nyukin_yotei_date,		// 入金予定日
			billing.pay_complete_date,		// 入金日
			billing.pay_amount,				// 請求金額
			billing.pay_amount_tax,			// 消費税
			billing.pay_amount_total,		// 請求金額合計
			billing.pay_complete,			// 入金額
			billing.pay_result,				// 請求区分
			billing.billing_client_cd,				// クライアントCD
			billing.billing_client_name,			// クライアント名
			billing.billing_client_division_cd,		// クライアント部署CD
			billing.billing_client_division_name,	// クライアント部署名
			billing.billing_client_person_id,		// クライアント担当者ID
			billing.billing_client_person_name,		// クライアント担当者名
			billing.billing_client_info,			// 請求先情報（住所、電話、Fax）
			billing.billing_memo,					// 備考
			billing.billing_agent_cd,				// クライアントCD
			billing.billing_agent_name,				// 代理店名
			billing.billing_agent_division_cd,		// 代理店部署CD
			billing.billing_agent_division_name,	// 代理店部署名
			billing.billing_agent_person_id,		// 代理店担当者ID
			billing.billing_agent_person_name,		// 代理店担当者名
			billing.billing_agent_info,				// 請求先情報（住所、電話、Fax）
			billing.billing_agent_memo,				// 備考
			billing.billing_etc_cd,					// その他請求先CD
			billing.billing_etc_name,				// その他請求先名
			billing.billing_etc_division_cd,		// その他請求先部署CD
			billing.billing_etc_division_name,		// その他請求先部署名
			billing.billing_etc_person_id,			// その他請求先担当者ID
			billing.billing_etc_person_name,		// その他請求先担当者名
			billing.billing_etc_info,				// 請求先情報（住所、電話、Fax）
			billing.billing_etc_memo,				// 備考
			billing.billing_kind,					// 請求先種別
			billing.furikomi_ryo,					// 振込手数料
			billing.nyukin_total,					// 合計
			billing.nyukin_yotei_p,					// 入金予定日（仮）
			billing.kentai,							// 検体名
			billing.billing_delete_check,			// 削除フラグ
			created,						// 作成日
			created_id,						// 作成者ID
			updated,						// 更新日
			updated_id						// 更新者ID
		], function (err, result) {
			connection.end();
			if (err) {
				console.log(err);
				res.send({error_msg:'データベースの登録に失敗しました。'});
			} else {
				res.send(billing);
			}
		})

};
var updateBilling = function (connection, billing, req, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = req.session.uid;
	var sql = 'UPDATE drc_sch.billing_info SET '
			+ "entry_no = $1,"				// 案件番号
			+ "billing_number = $2,"		// 請求番号
			+ "pay_planning_date = $3,"		// 請求日
			+ "nyukin_yotei_date = $4,"		// 入金予定日
			+ "pay_complete_date = $5,"		// 入金日
			+ "pay_amount = $6,"			// 税抜請求金額
			+ "pay_amount_tax = $7,"		// 消費税
			+ "pay_amount_total = $8,"		// 請求金額合計
			+ "pay_complete = $9,"			// 入金額
			+ "pay_result = $10,"			// 請求区分
			+ "client_cd = $11,"			// クライアントCD
			+ "client_name = $12,"			// クライアント名
			+ "client_division_cd = $13,"	// クライアント部署CD
			+ "client_division_name = $14,"	// クライアント部署名
			+ "client_person_id = $15,"		// クライアント担当者ID
			+ "client_person_name = $16,"	// クライアント担当者名
			+ "client_info = $17,"			// 請求先情報（住所、電話、Fax)
			+ "memo = $18,"					// 備考
			+ "agent_cd = $19,"				// 代理店CD
			+ "agent_name = $20,"				// 代理店名
			+ "agent_division_cd = $21,"		// 代理店部署CD
			+ "agent_division_name = $22,"	// 代理店部署名
			+ "agent_person_id = $23,"		// 代理店担当者ID
			+ "agent_person_name = $24,"		// 代理店担当者名
			+ "agent_info = $25,"				// 請求先情報（住所、電話、Fax）
			+ "agent_memo = $26,"				// 備考
			+ "etc_cd = $27,"					// その他請求先CD
			+ "etc_name = $28,"				// その他請求先名
			+ "etc_division_cd = $29,"		// その他請求先部署CD
			+ "etc_division_name = $30,"		// その他請求先部署名
			+ "etc_person_id = $31,"			// その他請求先担当者ID
			+ "etc_person_name = $32,"		// その他請求先担当者名
			+ "etc_info = $33,"				// 請求先情報（住所、電話、Fax）
			+ "etc_memo = $34,"				// 備考
			+ "billing_kind = $35,"			// 請求先種別
			+ 'furikomi_ryo = $36,'
			+ 'nyukin_total = $37,'
			+ 'nyukin_yotei_p = $38,'
			+ 'kentai = $39,'				// 検体名
			+ 'delete_check = $40,'			// 削除フラグ
			+ 'updated = $41,'				// 更新日
			+ 'updated_id = $42'			// 更新者ID
			+ " WHERE entry_no = $43 AND billing_no = $44";
		// SQL実行
		var query = connection.query(sql, [
			billing.billing_entry_no,		// 案件番号
			billing.billing_number,			// 請求番号
			billing.pay_planning_date,		// 請求日
			billing.nyukin_yotei_date,		// 入金予定日
			billing.pay_complete_date,		// 入金日
			billing.pay_amount,				// 税抜請求金額
			billing.pay_amount_tax,			// 消費税
			billing.pay_amount_total,		// 請求金額合計
			billing.pay_complete,			// 入金額
			billing.pay_result,				// 請求区分
			billing.billing_client_cd,				// クライアントCD
			billing.billing_client_name,			// クライアント名
			billing.billing_client_division_cd,		// クライアント部署CD
			billing.billing_client_division_name,	// クライアント部署名
			billing.billing_client_person_id,		// クライアント担当者ID
			billing.billing_client_person_name,		// クライアント担当者名
			billing.billing_client_info,			// 請求先情報（住所、電話、Fax）
			billing.billing_memo,					// 備考
			billing.billing_agent_cd,				// クライアントCD
			billing.billing_agent_name,				// 代理店名
			billing.billing_agent_division_cd,		// 代理店部署CD
			billing.billing_agent_division_name,	// 代理店部署名
			billing.billing_agent_person_id,		// 代理店担当者ID
			billing.billing_agent_person_name,		// 代理店担当者名
			billing.billing_agent_info,				// 請求先情報（住所、電話、Fax）
			billing.billing_agent_memo,				// 備考
			billing.billing_etc_cd,					// その他請求先CD
			billing.billing_etc_name,				// その他請求先名
			billing.billing_etc_division_cd,		// その他請求先部署CD
			billing.billing_etc_division_name,		// その他請求先部署名
			billing.billing_etc_person_id,			// その他請求先担当者ID
			billing.billing_etc_person_name,		// その他請求先担当者名
			billing.billing_etc_info,				// 請求先情報（住所、電話、Fax）
			billing.billing_etc_memo,				// 備考
			billing.billing_kind,					// 請求先種別
			billing.furikomi_ryo,					// 振込手数料
			billing.nyukin_total,					// 合計
			billing.nyukin_yotei_p,					// 入金予定日（仮）
			billing.kentai,							// 検体名
			billing.billing_delete_check,			// 削除フラグ
			updated,						// 更新日
			updated_id,						// 更新者ID
			billing.billing_entry_no,
			billing.billing_no
		], function (err, results) {
			connection.end();
			if (err) {
				console.log(err);
				res.send({ error_msg: 'データベースの更新に失敗しました。' });
			} else {
				res.send(billing);
			}
		});
};

// 「請求可」の時にメール通知する
var checkPayResult = function(billing) {
	if (billing.pay_result == 1) {
		var attr = {where:{notify_id:1}};
	  notify.schema('drc_sch').find(attr).then(function(setting){
			if ((setting != null) && (setting.smpt_server != '') && (setting.smtp_port != '') && (setting.usrid != '') && (setting.password != '') && (setting.send_address_1 != '')) {
				var transpoter = nodemailer.createTransport(smtpTransport({
	        host : setting.smtp_server,
	        port : setting.smtp_port,
	        auth : {
	          user : setting.userid,
	          pass : setting.password
	        }
	      }));
	      var mailOptions = {
	        from : setting.userid,
	        to : setting.send_address_1,
	        subject : setting.mail_title_1 + " 案件No[" + billing.billing_entry_no + "]",
	        text : setting.mail_body_1 + "案件No[" + billing.billing_entry_no + "]"
	      };
	      transpoter.sendMail(mailOptions, function( error, info) {
	        if (error) {
	          return console.log(error);
	        }
	        console.log("Message Sent: " + info.response);
	      })
			}
	  }).catch(function(error){
	    console.log(error);
	  });
	}
};

// entry_noの案件情報の案件ステータスを依頼に変更する
var updateEntryStatus = function(entry_no,entry_status) {
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var sql = 'UPDATE drc_sch.entry_info SET entry_status = $1 WHERE entry_no = $2';
		var query = connection.query(sql, [entry_status, entry_no]);	// 案件ステータス:04　完了
		console.log("updateEntryStatus:" + entry_no + " status:" + entry_status);
		query.on('end', function (result, err) {
			console.log(err);
			connection.end();
		});
	});
};

// 請求区分を確認して案件ステータスを更新する
exports.checkPayResultForUpdateEntryStatus = function(entry_no) {
	var sql_pay_result = "SELECT pay_result FROM drc_sch.billing_info WHERE entry_no = $1 AND delete_check = $2";
	var sql = 'SELECT '
		+ 'MIN(entry_info.report_submit_date) as report_submit_date,'
		+ 'SUM(pay_amount) AS amount_total_notax,'
		+ 'SUM(pay_amount_total) AS amount_total,'
		+ 'SUM(furikomi_ryo) AS furikomi_total,'
		+ 'SUM(pay_complete) AS complete_total'
		+ ' FROM drc_sch.billing_info'
		+ ' LEFt JOIN drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)'
		+ ' WHERE billing_info.entry_no = $1 AND billing_info.delete_check = $2'
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		connection.query(sql_pay_result, [entry_no,0], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var f = 0
				for (var i in results.rows) {
					console.log(results.rows[i]);
					// 全ての請求情報が入金確認済になっているか確認する
					if (results.rows[i].pay_result < 3) {
						f = 1;
						break;
					}
				}
				if (f == 1) {
					// 入金確認済になっていない請求情報がある
					updateEntryStatus(entry_no,"03");
					connection.end();
					return;
				} else {
					connection.query(sql, [entry_no,0], function (err, results) {
						if (err) {
							console.log(err);
						} else {
							var f = 0;
							for (var i in results.rows) {
								console.log(results.rows[i]);
								if (Number(results.rows[i].amount_total) == Number(results.rows[i].complete_total) + Number(results.rows[i].furikomi_total)) {
									f = 1;
									break;
								}
							}
							if (f == 1) {
								// 案件合計額と入金済金額が一致している場合
								// 報告書提出日が入力済？
								if (results.rows[0].report_submit_date != null && results.rows[0].report_submit_date != "") {
									updateEntryStatus(entry_no,"04");
								}
							} else {
								// 案件合計額と入金済金額が一致していない場合
								updateEntryStatus(entry_no,"03");
							}
							connection.end();
						}
					});
				}
			}
		});
	});

}