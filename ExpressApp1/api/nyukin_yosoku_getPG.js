var tools = require('../tools/tool');
//
// 入金予測集計
//
var nyukin_yosoku = nyukin_yosoku || {};
//  全社入金予測集計（件数取得）
nyukin_yosoku.sql_zensha_list_count = "SELECT "
    + "billing_info.entry_no,"
    + "count(pay_amount_total) as cnt"
    + " from drc_sch.billing_info"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0 group by billing_info.entry_no";
//  全社入金予測集計リスト
nyukin_yosoku.sql_zensha_list = "SELECT "
    + "billing_info.entry_no,"
    + "to_char(billing_info.pay_planning_date, 'YYYY/MM/DD') as seikyu_date,"
    + "to_char(billing_info.pay_complete_date, 'YYYY/MM/DD') as nyukin_date,"
    + "to_char(billing_info.nyukin_yotei_date, 'YYYY/MM/DD') as nyukin_yotei_date,"
    + "sum(pay_amount) as yosoku_sum,"
    + "sum(pay_amount_tax) as yosoku_tax,"
    + "sum(pay_amount_total) as yosoku_total,"
    + "entry_info.*,"
    + "test_large_class.item_name as test_large_class_name,"
    + "test_middle_class.item_name as test_middle_class_name,"
    + "client_list.name_1 as client_name,"
    + "agent_list.name_1 as agent_name,"
    + "user_list.name as sales_person_name"
    + " from drc_sch.billing_info"
    + " left join drc_sch.entry_info on(entry_info.entry_no = billing_info.entry_no)"
    + " left join drc_sch.test_large_class on(test_large_class.item_cd = entry_info.test_large_class_cd)"
    + " left join drc_sch.test_middle_class on(test_middle_class.large_item_cd = entry_info.test_large_class_cd and test_middle_class.item_cd = entry_info.test_middle_class_cd)"
    + " left join drc_sch.client_list on(client_list.client_cd = entry_info.client_cd)"
    + " left join drc_sch.client_list as agent_list on(agent_list.client_cd = entry_info.agent_cd)"
    + " left join drc_sch.user_list on(user_list.uid = entry_info.sales_person_id)"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0"
    + " group by billing_info.entry_no,billing_info.pay_planning_date,billing_info.nyukin_yotei_date,billing_info.pay_complete_date,entry_info.entry_no,test_large_class.item_name,test_middle_class.item_name,client_list.name_1,"
    + " agent_list.name_1,user_list.name";
// 全社入金予測集計（総合計）
nyukin_yosoku.sql_zensha_total = "SELECT "
    + "sum(pay_amount_total) as nyukin_yosoku_total"
    + " from drc_sch.billing_info"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0";


// 試験課別入金予測集計(件数取得)
nyukin_yosoku.sql_division_summary_count = "select count(*) as cnt from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " left join drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)"
  + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0"
  + " group by entry_info.test_large_class_cd";

// 試験課別入金予測集計
nyukin_yosoku.sql_division_summary = "select entry_info.test_large_class_cd as division_cd,test_large_class.item_name as division,sum(pay_amount_total) as nyukin_yosoku_sum"
  + " from drc_sch.billing_info left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no)"
  + " left join drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)"
  + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0"
  + " group by entry_info.test_large_class_cd,test_large_class.item_name";

// 顧客別入金予測集計
nyukin_yosoku.sql_client_summary_count = "select count(*) from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) "
  + " left join drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd) "
  + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0";
  + " group by entry_info.client_cd,client_list.name_1";
nyukin_yosoku.sql_client_summary = "select entry_info.client_cd,client_list.name_1 as client,sum(pay_amount_total) as nyukin_yosoku_sum from drc_sch.billing_info"
  + " left join drc_sch.entry_info ON(billing_info.entry_no = entry_info.entry_no) "
  + " left join drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd) "
  + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0"
  + " group by entry_info.client_cd,client_list.name_1";

//  試験課別案件リスト（件数取得）
nyukin_yosoku.sql_division_list_count = "SELECT "
    + "billing_info.entry_no,"
    + "count(pay_amount_total) as cnt"
    + " from drc_sch.billing_info"
    + " left join drc_sch.entry_info on(entry_info.entry_no = billing_info.entry_no)"
    + " left join drc_sch.test_large_class on(test_large_class.item_cd = entry_info.test_large_class_cd)"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0 and (entry_info.test_large_class_cd = $3) and billing_info.delete_check = 0"
    + " group by billing_info.entry_no,entry_info.test_large_class_cd";
//  試験課別案件リスト
nyukin_yosoku.sql_division_list = "SELECT "
    + "billing_info.entry_no,"
    + "to_char(billing_info.pay_planning_date, 'YYYY/MM/DD') as seikyu_date,"
    + "to_char(billing_info.pay_complete_date, 'YYYY/MM/DD') as nyukin_date,"
    + "'yyyy-mm-dd' as nyukin_yotei_date,"
    + "sum(pay_amount) as yosoku_sum,"
    + "sum(pay_amount_tax) as yosoku_tax,"
    + "sum(pay_amount_total) as yosoku_total,"
    + "entry_info.*,"
    + "test_large_class.item_name as test_large_class_name,"
    + "test_middle_class.item_name as test_middle_class_name,"
    + "client_list.name_1 as client_name,"
    + "agent_list.name_1 as agent_name,"
    + "user_list.name as sales_person_name"
    + " from drc_sch.billing_info"
    + " left join drc_sch.entry_info on(entry_info.entry_no = billing_info.entry_no)"
    + " left join drc_sch.test_large_class on(test_large_class.item_cd = entry_info.test_large_class_cd)"
    + " left join drc_sch.test_middle_class on(test_middle_class.large_item_cd = entry_info.test_large_class_cd and test_middle_class.item_cd = entry_info.test_middle_class_cd)"
    + " left join drc_sch.client_list on(client_list.client_cd = entry_info.client_cd)"
    + " left join drc_sch.client_list as agent_list on(agent_list.client_cd = entry_info.agent_cd)"
    + " left join drc_sch.user_list on(user_list.uid = entry_info.sales_person_id)"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0 and (entry_info.test_large_class_cd = $3) and billing_info.delete_check = 0"
    + " group by billing_info.entry_no,billing_info.pay_planning_date,billing_info.pay_complete_date,entry_info.entry_no,entry_info.test_large_class_cd,test_large_class.item_name,test_middle_class.item_name,client_list.name_1,"
    + " agent_list.name_1,user_list.name";

//  顧客別案件リスト（件数取得）
nyukin_yosoku.sql_client_list_count = "SELECT "
    + "billing_info.entry_no,"
    + "count(pay_amount_total) as cnt"
    + " from drc_sch.billing_info"
    + " left join drc_sch.entry_info on(entry_info.entry_no = billing_info.entry_no)"
    + " left join drc_sch.client_list on(client_list.client_cd = entry_info.client_cd)"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0 and (entry_info.client_cd = $3) and billing_info.delete_check = 0 group by billing_info.entry_no";
//  顧客別案件リスト
nyukin_yosoku.sql_client_list = "SELECT "
    + "billing_info.entry_no,"
    + "to_char(billing_info.pay_planning_date, 'YYYY/MM/DD') as seikyu_date,"
    + "to_char(billing_info.pay_complete_date, 'YYYY/MM/DD') as nyukin_date,"
    + "'yyyy-mm-dd' as nyukin_yotei_date,"
    + "sum(pay_amount) as yosoku_sum,"
    + "sum(pay_amount_tax) as yosoku_tax,"
    + "sum(pay_amount_total) as yosoku_total,"
    + "entry_info.*,"
    + "test_large_class.item_name as test_large_class_name,"
    + "test_middle_class.item_name as test_middle_class_name,"
    + "client_list.name_1 as client_name,"
    + "agent_list.name_1 as agent_name,"
    + "user_list.name as sales_person_name"
    + " from drc_sch.billing_info"
    + " left join drc_sch.entry_info on(entry_info.entry_no = billing_info.entry_no)"
    + " left join drc_sch.test_large_class on(test_large_class.item_cd = entry_info.test_large_class_cd)"
    + " left join drc_sch.test_middle_class on(test_middle_class.large_item_cd = entry_info.test_large_class_cd and test_middle_class.item_cd = entry_info.test_middle_class_cd)"
    + " left join drc_sch.client_list on(client_list.client_cd = entry_info.client_cd)"
    + " left join drc_sch.client_list as agent_list on(agent_list.client_cd = entry_info.agent_cd)"
    + " left join drc_sch.user_list on(user_list.uid = entry_info.sales_person_id)"
    + " where (billing_info.nyukin_yotei_date between $1 and $2) and billing_info.delete_check = 0 and (entry_info.client_cd = $3) and billing_info.delete_check = 0"
    + " group by billing_info.entry_no,billing_info.pay_planning_date,billing_info.pay_complete_date,entry_info.entry_no,test_large_class.item_name,test_middle_class.item_name,client_list.name_1,"
    + " agent_list.name_1,user_list.name";


// 集計検索処理エントリーポイント
exports.summary = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = tools.getPagingParams(req);
  // 検索集計処理
  nyukin_yosoku.getYosokuSummary(req, res, pg_params);
}
exports.list = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = tools.getPagingParams(req);
  // 案件リスト検索処理
  nyukin_yosoku.getYosokuList(req, res, pg_params);
}

// 売上集計総合計の取得
exports.total = function(req, res) {
  if ((req.query.start_date != undefined) && (req.query.end_date != '')) {
		// SQL実行
		pg.connect(connectionString, function (err, connection) {
			// データを取得するためのクエリーを実行する
			connection.query(nyukin_yosoku.sql_zensha_total, [req.query.start_date, req.query.end_date], function (err, results) {
				if (err) {
					console.log(err);
				} else {
					var result = [];
					for (var i in results.rows) {
						result = results.rows[i];
					}
					connection.end();
					res.send(result);
				}
			});
		});
	}

}
// 検索集計処理
nyukin_yosoku.getYosokuSummary = function(req, res, pg_params) {
  var sql_summary = "";
  var sql_count = "";
  var params = [req.query.start_date,req.query.end_date];
  if (req.query.op == 'all') {
    // 全社
    sql_count = nyukin_yosoku.sql_zensha_list_count;
    sql_summary = nyukin_yosoku.sql_zensha_list + " ORDER BY entry_info."  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'division') {
    // 試験課別
    sql_count = nyukin_yosoku.sql_division_summary_count;
    sql_summary = nyukin_yosoku.sql_division_summary + " ORDER BY entry_info.test_large_class_cd, "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'client') {
    // 顧客別
    sql_count = nyukin_yosoku.sql_client_summary_count;
    sql_summary = nyukin_yosoku.sql_client_summary + " ORDER BY "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  }
  // SQL実行
  nyukin_yosoku.exeQuery(req,res,pg_params,sql_count,sql_summary,params);
}

// 案件リスト取得
nyukin_yosoku.getYosokuList = function(req, res, pg_params) {
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
    sql_count = nyukin_yosoku.sql_all_count;
    sql_summary = nyukin_yosoku.sql_all + " ORDER BY "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'division') {
    sql_count = nyukin_yosoku.sql_division_list_count;
    sql_summary = nyukin_yosoku.sql_division_list + " ORDER BY entry_info.test_large_class_cd, entry_info."  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  } else if (req.query.op == 'client') {
    sql_count = nyukin_yosoku.sql_client_list_count;
    sql_summary = nyukin_yosoku.sql_client_list + " ORDER BY entry_info.client_cd,entry_info. "  + pg_params.sidx + ' ' + pg_params.sord  + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
  }
  // SQL実行
  nyukin_yosoku.exeQuery(req,res,pg_params,sql_count,sql_summary,params);
}
// クエリー実行
nyukin_yosoku.exeQuery = function(req, res, pg_params,sql_count,sql,params) {
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
