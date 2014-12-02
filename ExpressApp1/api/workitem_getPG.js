//
// ガントチャート用作業項目データの取得
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
// 作業項目データのGET
exports.workitem_get = function (req, res) {
	workitem_get_list(req, res);
};

// 作業項目リストの取得
var workitem_get_list = function (req, res) {
	var sql = 'SELECT ' 
		+ 'entry_no,' 
		+ 'work_item_id,' 
		+ 'work_title,' 
		+ 'to_char(start_date, \'YYYY/MM/DD\') AS start_date,' 
		+ 'to_char(end_date, \'YYYY/MM/DD\') AS end_date,' 
		+ 'to_char(start_date_result, \'YYYY/MM/DD\') AS start_date_result,' 
		+ 'to_char(end_date_result, \'YYYY/MM/DD\') AS end_date_result,' 
		+ 'priority_item_id,' 
		+ 'subsequent_item_id,' 
		+ 'progress' 
		+ ' FROM drc_sch.workitem_schedule WHERE entry_no = $1 and delete_check = \'0\'';
	return workitem_get_list_for_gantt(res, sql, [req.params.entry_no]);
};



// ガントチャート用作業項目データリスト取得
var workitem_get_list_for_gantt = function (res, sql, params) {
	var result = [];
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		var query = connection.query(sql, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			for (var i in rows) {
				result.push(rows[i]);
			}
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
