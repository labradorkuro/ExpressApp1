﻿//
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
		+ 'test_schedule.quote_no,' 
		+ 'test_schedule.quote_detail_no,' 
		+ 'to_char(test_schedule.start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(test_schedule.end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'to_char(test_schedule.start_time, \'HH24:MI\') AS start_time,' 
		+ 'to_char(test_schedule.end_time, \'HH24:MI\') AS end_time,' 
		+ 'am_pm,' 
		+ 'patch_no,' 
		+ 'test_schedule.memo,'
		+ 'entry_info.entry_title,'					// 案件情報テーブルから案件名を取得する 
		+ 'test_middle_class.item_name AS test_item,'				// 試験項目名を取得する
		+ 'test_schedule.base_cd,'
		+ 'test_schedule.created_id,' 
		+ 'to_char(test_schedule.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,' 
		+ 'test_schedule.updated_id' 
		+ ' FROM drc_sch.test_schedule'
		+ ' LEFT JOIN drc_sch.entry_info ON (test_schedule.entry_no = entry_info.entry_no)' 
		+ ' LEFT JOIN drc_sch.quote_specific_info ON (quote_specific_info.quote_no = test_schedule.quote_no AND quote_specific_info.quote_detail_no = test_schedule.quote_detail_no AND quote_specific_info.entry_no = test_schedule.entry_no)' 
		+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = $4)' 
		+ ' WHERE test_schedule.delete_check = $1' 
		+ ' AND (test_schedule.start_date >= $2 AND test_schedule.start_date <= $3) AND entry_info.test_large_class_cd = $4 AND test_schedule.base_cd = $5' 
		+ ' ORDER BY test_schedule.start_date ASC, test_schedule.start_time ASC';
	return schedule_get_list_for_table(res, sql, ['0',req.params.start, req.params.end, req.params.test_large_item_cd, req.params.base_cd]);
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
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
