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

var schedule_check = function (schedule) {
	// 日付項目チェック
	schedule.start_date = tools.dateCheck(schedule.start_date);
	schedule.end_date = tools.dateCheck(schedule.end_date);
	schedule.start_time = tools.dateCheck(schedule.start_time);
	schedule.end_time = tools.dateCheck(schedule.end_time);
	if (!schedule.ampm) schedule.ampm = '0';
	// 数値変換
	if (schedule.patch_no) {
		schedule.patch_no = Number(schedule.patch_no);
	} else {
		schedule.patch_no = 0;
	}
	return schedule;
};
var insertSchedule = function (schedule, res) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var created_id = "tanaka";
	var updated = null;
	var updated_id = "";
	var sql = 'INSERT INTO drc_sch.test_schedule(' 
			+ 'entry_no,' // 案件No
			+ 'quote_detail_no,' // 明細番号
			+ 'start_date,' // 開始日付
			+ 'end_date,' // 終了日付
			+ 'start_time,' // 開始時間
			+ 'end_time,' // 終了時間
			+ 'am_pm,' // AM/PM
			+ 'patch_no,' // パッチ番号	
			+ 'delete_check,' // 削除フラグ
			+ 'created,' // 作成日
			+ 'created_id,' // 作成者ID
			+ 'updated,' // 
			+ 'updated_id' // 更新者ID
			+ ') values (' 
			+ '$1,' // 案件No
			+ '$2,' // 明細番号
			+ '$3,' // 開始日付
			+ '$4,' // 終了日付
			+ '$5,' // 開始時間
			+ '$6,' // 終了時間
			+ '$7,' // AMPM
			+ '$8,' // パッチ番号
			+ '$9,' // 削除フラグ
			+ '$10,' // 作成日
			+ '$11,' // 作成者ID
			+ '$12,' // 更新日
			+ '$13' // 更新者ID
			+ ')'
			;
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		var query = connection.query(sql, [
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
		]);
		query.on('end', function(result,err) {
			res.send(schedule);
			connection.end();
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
var updateSchedule = function (schedule, res) {
	var updated = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var updated_id = "tanaka";
	var sql = 'UPDATE drc_sch.test_schedule SET ' 
			+ 'entry_no = $1,' // 案件No
			+ 'quote_detail_no = $2,' // 明細番号
			+ 'start_date = $3,' // 開始日付
			+ 'end_date = $4,' // 終了日付
			+ 'start_time = $5,' // 開始時間
			+ 'end_time = $6,' // 終了時間
			+ 'am_pm = $7,' // AM/PM
			+ 'patch_no = $8,' // パッチ番号	
			+ 'delete_check = $9,' // 削除フラグ
			+ 'updated_id = $10' // 更新者ID
			+ " WHERE schedule_id = $11";
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		var query = connection.query(sql, [
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
		]);
		query.on('end', function (result, err) {
			res.send(schedule);
			connection.end();
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
