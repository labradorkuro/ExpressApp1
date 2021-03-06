﻿//
// ガントチャート作業項目のPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');
/*
var connection = mysql.createConnection({
	host     : 'localhost',
	port     : '3306',
	user     : 'drc_root',
	password : 'drc_r00t@',
	database : 'drc_sch'
});
*/
// 作業項目データのPOST
exports.workitem_post = function (req, res) {
	var workitem = workitem_check(req.body);
	if (workitem.delete_check === '1') {
		// 削除
		delete_workitem(workitem, res);
		return;
	}
	if (workitem.work_item_id === -1) {
		// 追加
		insert_workitem(workitem, res);
	} else {
		// 更新
		update_workitem(workitem, res);
	}
};

// 作業項目データの追加
var insert_workitem = function (workitem, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = "tanaka";
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.workitem_schedule (' 
			+ "entry_no," // 案件番号（yymmdd-###)
			+ "work_title," // 作業項目名称
			+ "start_date," // 作業開始予定日
			+ "end_date," // 作業終了予定日
			+ "start_date_result," // 作業開始日
 			+ "end_date_result," // 作業終了日
			+ "priority_item_id," // 先行（優先）項目
			+ "subsequent_item_id," // 後続項目
			+ "progress," // 作業進捗度
			+ "delete_check,"	// 削除フラグ
			+ "created," // 作成日
			+ "created_id," // 作成者ID
			+ "updated," // 更新日
			+ "updated_id" // 更新者ID
			+ ") values (" 
			+ "?," // 案件番号
			+ "?," // 作業項目名称
			+ "?," // 作業開始予定日
			+ "?," // 作業終了予定日
			+ "?," // 作業開始日
			+ "?," // 作業終了日
			+ "?," // 先行項目
			+ "?," // 後続項目
			+ "?," // 進捗度
			+ "?," // 削除フラグ
			+ "?," // 作成日
			+ "?," // 作成者ID
			+ "?," // 更新日
			+ "?" // 更新者ID
			+ ")";
	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, [
			workitem.entry_no, // 案件No
			workitem.work_title,
			workitem.start_date,
			workitem.end_date,
			workitem.start_date_result,
			workitem.end_date_result,
			workitem.priority_item_id,
			workitem.subsequent_item_id,
			workitem.progress,
			"0", // 削除フラグ
			created, // 作成日
			created_id, // 作成者ID
			updated, // 更新日
			updated_id // 更新者ID
		], function (err, rows) {
			if (err) throw err;
			connection.release();
			res.send(workitem);
		});
	});
};
// 作業項目データの更新
var update_workitem = function (workitem, res) {
	var updated_id = "tanaka";
	var sql = 'UPDATE drc_sch.workitem_schedule SET ' 
			+ "entry_no = ?," // 案件番号（yymmdd-###)
			+ "work_title = ?," // 作業項目名称
			+ "start_date = ?," // 作業開始予定日
			+ "end_date = ?," // 作業終了予定日
			+ "start_date_result = ?," // 作業開始日
 			+ "end_date_result = ?," // 作業終了日
			+ "priority_item_id = ?," // 先行（優先）項目
			+ "subsequent_item_id = ?," // 後続項目
			+ "progress = ?," // 作業進捗度
			+ "updated_id = ?" // 更新者ID
			+ " WHERE work_item_id = ?";
	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, [
			workitem.entry_no, // 案件No
			workitem.work_title,
			workitem.start_date,
			workitem.end_date,
			workitem.start_date_result,
			workitem.end_date_result,
			workitem.priority_item_id,
			workitem.subsequent_item_id,
			workitem.progress,
			updated_id, // 更新者ID
			workitem.work_item_id
		], function (err, rows) {
			if (err) throw err;
			connection.release();
			res.send(workitem);
		});
	});
};
// 作業項目データの削除
var delete_workitem = function (workitem, res) {
	var updated_id = "tanaka";
	var sql = 'UPDATE drc_sch.workitem_schedule SET ' 
			+ "delete_check = ?," // 削除フラグ
			+ "updated_id = ?" // 更新者ID
			+ " WHERE work_item_id = ?";
	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, [
			workitem.delete_check,
			updated_id, // 更新者ID
			workitem.work_item_id
		], function (err, rows) {
			if (err) throw err;
			connection.release();
			res.send(workitem);
		});
	});
};

// 日付項目のチェックと値変換
var dateCheck = function (dt) {
	var rtn = null;
	if ((dt === '') || (dt === null)) {
		rtn = null;
	} else {
		rtn = dt;
	}
	return rtn;
};

var workitem_check = function (workitem) {
	// 日付項目チェック
	workitem.start_date = dateCheck(workitem.start_date);
	workitem.end_date = dateCheck(workitem.end_date);
	workitem.start_date_result = dateCheck(workitem.start_date_result);
	workitem.end_date_result = dateCheck(workitem.end_date_result);
	// 数値変換
	workitem.work_item_id = Number(workitem.work_item_id);
	workitem.priority_item_id = Number(workitem.priority_item_id);
	workitem.subsequent_item_id = Number(workitem.subsequent_item_id);
	workitem.progress = Number(workitem.progress);
	return workitem;
};

