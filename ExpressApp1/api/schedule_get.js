//
// 試験スケジュールデータの取得処理
//

exports.schedule_get = function (req, res) {
	if ((req.params.start != undefined) && (req.params.start != '')) {
		if ((req.params.end != undefined) && (req.params.end != '')) {
			schedule_get_list_term(req, res);
		}
	}	
	else if ((req.params.schedule_id != undefined) && (req.params.schedule_id != '')) {
		schedule_get_detail(req, res);
	} else {
		schedule_get_list(req, res);
	}
};

var schedule_get_list_term = function (req, res) {
	var sql = 'SELECT ' 
		+ 'test_schedule.schedule_id,' 
		+ 'test_schedule.entry_no,' 
		+ 'test_schedule.quote_detail_no,' 
		+ 'DATE_FORMAT(test_schedule.start_date, "%Y/%m/%d") AS start_date,' 
		+ 'DATE_FORMAT(test_schedule.end_date, "%Y/%m/%d") AS end_date,' 
		+ 'TIME_FORMAT(test_schedule.start_time, "%H:%i:%s") AS start_time,' 
		+ 'TIME_FORMAT(test_schedule.end_time, "%H:%i:%s") AS end_time,' 
		+ 'am_pm,' 
		+ 'patch_no,' 
		+ 'entry_info.entry_title,' // 案件情報テーブルから案件名を取得する 
		+ 'entry_info.base_cd,'		// 案件情報テーブルからを取得する 
		+ 'entry_info.division,'	// 案件情報テーブルから部門コードを取得する 
		+ 'quote_info.test_item,'	// 試験明細情報テーブルから試験項目名を取得する
		+ 'test_schedule.created_id,' 
		+ 'DATE_FORMAT(test_schedule.updated,"%Y/%m/%d %H:%i:%s") AS updated,' 
		+ 'test_schedule.updated_id' 
		+ ' FROM test_schedule LEFT JOIN (entry_info,quote_info) ON (test_schedule.entry_no = entry_info.entry_no AND test_schedule.entry_no = quote_info.entry_no AND test_schedule.quote_detail_no = quote_info.quote_detail_no)'
		+ ' WHERE test_schedule.delete_check = ?' 
		+ ' AND (test_schedule.start_date >= ? AND test_schedule.start_date < ?)'
		+ ' AND entry_info.base_cd = ?' 
		+ ' AND entry_info.division = ?' 
		+ ' ORDER BY test_schedule.start_date ASC ';
	return schedule_get_list_for_table(res, sql, ["0",req.params.start, req.params.end, req.params.base_cd, req.params.test_type]);
};

var schedule_get_list_for_table = function (res, sql, params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, params, function (err, rows) {
			if (err) throw err;
			result.records = rows.length;
			result.rows = rows;
			connection.release();
			res.send(result);
		});
	});
};
