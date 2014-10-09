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
		+ 'DATE_FORMAT(start_date, "%Y/%m/%d") AS start_date,' 
		+ 'DATE_FORMAT(end_date, "%Y/%m/%d") AS end_date,' 
		+ 'DATE_FORMAT(start_date_result, "%Y/%m/%d") AS start_date_result,' 
		+ 'DATE_FORMAT(end_date_result, "%Y/%m/%d") AS end_date_result,' 
		+ 'priority_item_id,' 
		+ 'subsequent_item_id,' 
		+ 'progress' 
		+ ' FROM drc_sch.workitem_schedule WHERE entry_no = ? and delete_check = "0"';
	return workitem_get_list_for_gantt(res, sql, [req.params.entry_no]);
};



// ガントチャート用作業項目データリスト取得
var workitem_get_list_for_gantt = function (res, sql, params) {
	var result = [];
	// SQL実行
	pool.getConnection(function (err, connection) {
		connection.query(sql, params, function (err, rows) {
			if (err) throw err;
			for (var i in rows) {
				result.push(rows[i]);
			}
			connection.release();
			res.send(result);
		});
	});
};
