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
		+ 'to_char(test_schedule.start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(test_schedule.end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'to_char(test_schedule.start_time, \'HH24:MI\') AS start_time,' 
		+ 'to_char(test_schedule.end_time, \'HH24:MI\') AS end_time,' 
		+ 'am_pm,' 
		+ 'patch_no,' 
		+ 'entry_info.entry_title,' // 案件情報テーブルから案件名を取得する 
		+ 'entry_info.base_cd,' // 案件情報テーブルからを取得する 
		+ 'entry_info.division,' // 案件情報テーブルから部門コードを取得する 
		+ 'quote_info.test_item,' // 試験明細情報テーブルから試験項目名を取得する
		+ 'test_schedule.created_id,' 
		+ 'to_char(test_schedule.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'test_schedule.updated_id' 
		+ ' FROM drc_sch.test_schedule LEFT JOIN drc_sch.entry_info ON (test_schedule.entry_no = entry_info.entry_no)' 
		+ ' LEFT JOIN drc_sch.quote_info ON (test_schedule.entry_no = quote_info.entry_no AND test_schedule.quote_detail_no = quote_info.quote_detail_no)' 
		+ ' WHERE test_schedule.delete_check = $1' 
		+ ' AND (test_schedule.start_date >= $2 AND test_schedule.start_date <= $3)' 
		+ ' AND entry_info.base_cd = $4' 
		+ ' AND entry_info.division = $5' 
		+ ' ORDER BY test_schedule.start_date ASC';
	return schedule_get_list_for_table(res, sql, ['0',req.params.start, req.params.end, req.params.base_cd, req.params.test_type]);
};

var schedule_get_list_for_table = function (res, sql, params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			result.records = rows.length;
			result.rows = rows;
			res.send(result);
			connection.end();
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
