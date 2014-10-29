//
// スケジュールダイアログからのPOSTを処理する
//
//var mysql = require('mysql');
var tools = require('../tools/tool');

// スケジュールデータのPOST
exports.schedule_post = function (req, res) {
	var schedule = schedule_check(req.body);
	if (schedule.schedule_id === "0") {
		// スケジュールのDB追加
		insertSchedule(schedule, res);
	} else {
		// スケジュールの更新
		updateSchedule(schedule, res);
	}
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

var schedule_check = function (schedule) {
	// 日付項目チェック
	schedule.start_date = dateCheck(schedule.start_date);
	schedule.end_date = dateCheck(schedule.end_date);
	schedule.start_time = dateCheck(schedule.start_time);
	schedule.end_time = dateCheck(schedule.end_time);
	// 数値変換
	schedule.patch_no = Number(schedule.patch_no);
	return schedule;
};
var insertSchedule = function (schedule, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = "tanaka";
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.test_schedule(' 
			+ 'entry_no,'			// 案件No
			+ 'quote_detail_no,'	// 明細番号
			+ 'start_date,'			// 開始日付
			+ 'end_date,'			// 終了日付
			+ 'start_time,'			// 開始時間
			+ 'end_time,'			// 終了時間
			+ 'am_pm,'				// AM/PM
			+ 'patch_no,'			// パッチ番号	
			+ 'delete_check,'		// 削除フラグ
			+ 'created,'			// 作成日
			+ 'created_id,'			// 作成者ID
			+ 'updated,'			// 
			+ 'updated_id'			// 更新者ID
			+ ') values (' 
			+ '?,' // 案件No
			+ '?,' // 明細番号
			+ '?,' // 開始日付
			+ '?,' // 終了日付
			+ '?,' // 開始時間
			+ '?,' // 終了時間
			+ '?,' // AMPM
			+ '?,' // パッチ番号
			+ '?,' // 削除フラグ
			+ '?,' // 作成日
			+ '?,' // 作成者ID
			+ '?,' // 更新日
			+ '?' // 更新者ID
			+ ')'
			;
	pool.getConnection(function (err, connection) {
		// SQL実行
		connection.query(sql, [
			schedule.entry_no,	// 案件No
			schedule.quote_detail_no,
			schedule.start_date,
			schedule.end_date,
			schedule.start_time,
			schedule.end_time,
			schedule.am_pm,
			schedule.patch_no,
			schedule.delete_check,
			created,			// 作成日
			created_id,			// 作成者ID
			updated,
			updated_id			// 更新者ID
		], function (err, rows) {
			if (err) throw err;
			console.log(rows);
			//connection.destory();
			connection.release();
			res.send(schedule);
		});
	});
};
var updateSchedule = function (schedule, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = "tanaka";
	var sql = 'UPDATE drc_sch.test_schedule SET ' 
			+ 'entry_no = ?,' // 案件No
			+ 'quote_detail_no = ?,' // 明細番号
			+ 'start_date = ?,' // 開始日付
			+ 'end_date = ?,' // 終了日付
			+ 'start_time = ?,' // 開始時間
			+ 'end_time = ?,' // 終了時間
			+ 'am_pm = ?,' // AM/PM
			+ 'patch_no = ?,' // パッチ番号	
			+ 'delete_check = ?,' // 削除フラグ
			+ 'updated_id = ?' // 更新者ID
			+ " WHERE schedule_id = ?";
	pool.getConnection(function (err, connection) {
		// SQL実行
		connection.query(sql, [
			schedule.entry_no,	// 案件No
			schedule.quote_detail_no,
			schedule.start_date,
			schedule.end_date,
			schedule.start_time,
			schedule.end_time,
			schedule.am_pm,
			schedule.patch_no,
			schedule.delete_check,
			updated_id,			// 更新者ID
			schedule.schedule_id
		], function (err, rows) {
			if (err) throw err;
			console.log(rows);
			connection.release();
			res.send(schedule);
		});
	});
};
