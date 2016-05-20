var tools = require('../tools/tool');
//
// 売上集計
//
var uriage_sum = uriage_sum || {};
// 請求金額合計を求める（案件全体）
uriage_sum.sqlTotalAmount = 'SELECT '
  + 'entry_no,'
  + 'SUM(pay_amount_total) AS amount_total'
  + ' FROM drc_sch.billing_info'
  + " WHERE billing_info.delete_check = 0 group by entry_no";
// 入金済合計金額を求める（指定期日まで）
uriage_sum.sqlTotalComplete = 'SELECT '
    + 'entry_no,'
    + 'SUM(pay_complete) AS complete_total'
    + ' FROM drc_sch.billing_info'
    + " WHERE billing_info.delete_check = 0 AND pay_result = 3 AND (pay_complete_date <= $2) group by entry_no";
// 全社売上集計
uriage_sum.sql_all_summary_count = "select count(*) as cnt from drc_sch.billing_info"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND pay_result = 3 AND (pay_complete_date BETWEEN $1 AND $2)";

uriage_sum.sql_all_summary = "select '全社集計' as title,subq2.complete_total as uriage_sum from drc_sch.billing_info"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND pay_result = 3 AND (pay_complete_date BETWEEN $1 AND $2)";
// 案件リスト取得用
uriage_sum.sql_all_count = "select count(*) as cnt from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 "
  + " AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 group by billing_info.entry_no";

uriage_sum.sql_all = "select billing_info.entry_no,entry_info.entry_title,subq2.complete_total as uriage_sum"
  + " from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2"
  + " group by billing_info.entry_no,entry_info.entry_title,subq2.complete_total";

// 試験課別売上集計
uriage_sum.sql_division_summary_count = "select count(*) as cnt from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " left join drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 AND test_large_class.delete_check = 0 "
  + " AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 group by entry_info.test_large_class_cd";

uriage_sum.sql_division_summary = "select entry_info.test_large_class_cd as division_cd,test_large_class.item_name as division,subq2.complete_total as uriage_sum"
  + " from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " left join drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 AND test_large_class.delete_check = 0 "
  + " AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2"
  + " group by entry_info.test_large_class_cd,test_large_class.item_name,subq2.complete_total";
// 案件リスト取得用
uriage_sum.sql_division_count = "select count(*) as cnt from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " left join drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 AND test_large_class.delete_check = 0 "
  + " AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 AND entry_info.test_large_class_cd = $3 group by billing_info.entry_no";

uriage_sum.sql_division = "select billing_info.entry_no,entry_info.entry_title,subq2.complete_total as uriage_sum"
  + " from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  //+ " left join drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 "//AND test_large_class.delete_check = 0 "
  + " AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 AND entry_info.test_large_class_cd = $3"
  + " group by billing_info.entry_no,entry_info.entry_title,entry_info.test_large_class_cd,subq2.complete_total";
// 顧客別売上集計
uriage_sum.sql_client_summary_count = "select count(*) from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) "
  + " left join drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd) "
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND client_list.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2"
  + " group by entry_info.client_cd,client_list.name_1";
uriage_sum.sql_client_summary = "select entry_info.client_cd,client_list.name_1 as client,subq2.complete_total as uriage_sum from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) "
  + " left join drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd) "
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND client_list.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2"
  + " group by entry_info.client_cd,client_list.name_1,subq2.complete_total";

// 案件リスト取得用
uriage_sum.sql_client_count = "select count(*) from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) "
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 AND entry_info.client_cd = $3"
  + " group by billing_info.entry_no";
uriage_sum.sql_client = "select billing_info.entry_no, entry_info.entry_title ,subq2.complete_total as uriage_sum from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) "
  + " LEFT JOIN (" + uriage_sum.sqlTotalAmount + ") AS subq1 ON(subq1.entry_no = billing_info.entry_no)"
  + " LEFT JOIN (" + uriage_sum.sqlTotalComplete + ") AS subq2 ON(subq2.entry_no = billing_info.entry_no)"
  + " where (subq1.amount_total <= subq2.complete_total) AND billing_info.delete_check = 0 AND entry_info.delete_check = 0 AND pay_result = 3 AND pay_complete_date BETWEEN $1 AND $2 AND entry_info.client_cd = $3"
  + " group by entry_info.client_cd,billing_info.entry_no, entry_info.entry_title,subq2.complete_total";

// 集計検索処理エントリーポイント
exports.summary = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = tools.getPagingParams(req);
  // 検索集計処理
  uriage_sum.getUriageSummary(req, res, pg_params);
}
exports.list = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = tools.getPagingParams(req);
  // 案件リスト検索処理
  uriage_sum.getUriageList(req, res, pg_params);
}

// 検索集計処理
uriage_sum.getUriageSummary = function(req, res, pg_params) {
  var sql_summary = "";
  var sql_count = "";
  var params = [req.query.start_date,req.query.end_date];
  if (req.query.op == 'all') {
    // 全社
    sql_count = uriage_sum.sql_all_summary_count;
    sql_summary = uriage_sum.sql_all_summary + " ORDER BY "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'division') {
    // 試験課別
    sql_count = uriage_sum.sql_division_summary_count;
    sql_summary = uriage_sum.sql_division_summary + " ORDER BY entry_info.test_large_class_cd, "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'client') {
    // 顧客別
    sql_count = uriage_sum.sql_client_summary_count;
    sql_summary = uriage_sum.sql_client_summary + " ORDER BY "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  }
  // SQL実行
  uriage_sum.exeQuery(req,res,pg_params,sql_count,sql_summary,params);
}

// 案件リスト取得
uriage_sum.getUriageList = function(req, res, pg_params) {
  var sql_summary = "";
  var sql_count = "";
  var params = [req.query.start_date,req.query.end_date];
  if (req.query.division_cd) {
    params.push(req.query.division_cd);
  }
  if (req.query.client_cd) {
    params.push(req.query.client_cd);
  }
  if (req.query.op == 'all') {
    sql_count = uriage_sum.sql_all_count;
    sql_summary = uriage_sum.sql_all + " ORDER BY "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'division') {
    sql_count = uriage_sum.sql_division_count;
    sql_summary = uriage_sum.sql_division + " ORDER BY entry_info.test_large_class_cd, "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'client') {
    sql_count = uriage_sum.sql_client_count;
    sql_summary = uriage_sum.sql_client + " ORDER BY entry_info.client_cd, "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  }
  // SQL実行
  uriage_sum.exeQuery(req,res,pg_params,sql_count,sql_summary,params);
}
// クエリー実行
uriage_sum.exeQuery = function(req, res, pg_params,sql_count,sql,params) {
  var result = { page: 1, total: 1, records: 0, rows: [] };
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
        connection.query(sql, params, function (err, results) {
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
