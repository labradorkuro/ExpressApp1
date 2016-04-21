//
// 売上集計
//
var uriage_sum = uriage_sum || {};
// 全社売上集計
uriage_sum.sql_summary_count = "select count(*) as cnt from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) where billing_info.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 group by billing_info.entry_no";
uriage_sum.sql_summary = "select billing_info.entry_no,entry_info.entry_title,sum(pay_complete) as uriage_sum from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) where billing_info.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 group by billing_info.entry_no,entry_info.entry_title";
// 顧客別売上集計
uriage_sum.sql_groupby_client = "select billing_info.entry_no,entry_info.client_cd,sum(pay_complete) from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) where billing_info.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 group by entry_info.client_cd,billing_info.entry_no";

// 集計検索処理エントリーポイント
exports.list = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = uriage_sum.getPagingParams(req);
  // 検索集計処理
  uriage_sum.getUriageSummary(req, res, pg_params);
}

// グリッドのページング用パラメータ取得処理
uriage_sum.getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "entry_no";
	pg_param.sord = "desc";
	pg_param.limit = 10;
	pg_param.offset = 0;
	pg_param.page = 1;
	if (req.query.rows) pg_param.limit = req.query.rows;
	if (req.query.page) pg_param.page = req.query.page;
	if (req.query.sidx) pg_param.sidx = req.query.sidx;
	if (req.query.sord) pg_param.sord = req.query.sord;
	pg_param.offset = (pg_param.page - 1) * pg_param.limit;
	return pg_param;
};

// 検索集計処理
uriage_sum.getUriageSummary = function(req, res, pg_params) {
  var sql_summary = "";
  var sql_count = "";
  var params = [req.query.start_date,req.query.end_date];
  var result = { page: 1, total: 1, records: 0, rows: [] };
  if (req.query.op == 'all') {
    sql_count = uriage_sum.sql_summary_count;
    sql_summary = uriage_sum.sql_summary + " ORDER BY "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  }
  // SQL実行
  pg.connect(connectionString, function (err, connection) {
    if (err) {
      console.log(err);
      connection.end();
      res.send(result);
    }
    // 最初に件数を取得する
    connection.query(sql_count, params, function (err, results) {
      if (err) {
        console.log(err);
        connection.end();
        res.send(result);
      } else {
        // 取得した件数からページ数を計算する
        if (results.rows.length) {
          result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
        }
        result.page = pg_params.page;
        // データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
        connection.query(sql_summary, params, function (err, results) {
          if (err) {
            console.log(err);
            connection.end();
            res.send(result);
          } else {
            result.records = results.rows.length;
            result.page = pg_params.page;
            for (var i in results.rows) {
              var row = { id: '', cell: [] };
              row.id = (i + 1);
              row.cell = results.rows[i];
              result.rows.push(row);
            }
            connection.end();
            res.send(result);
          }
        });
      }
    });
  });

}
