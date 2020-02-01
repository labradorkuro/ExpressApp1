//
// 案件リストからのGETを処理する
//
var tools = require('../tools/tool');
// 案件基本データのGET
exports.entry_get = function (req, res) {
	if (req.query.searchField != undefined) {
		// 虫メガネの検索ダイアログからの検索実行
		entry_get_list_searchField(req, res,"grid");
	}
	else if (req.query.keyword != undefined) {
		// フリーキーワード検索
		entry_get_searchKeyword(req, res,"grid");
	}
	else if ((req.params.no != undefined) && (req.params.no != '')) {
		entry_get_detail(req, res);
	} else {
		entry_get_list(req, res,"grid");
	}
};

// 印刷、CSV出力用
exports.entry_print = function (req, res) {
	if (req.query.searchField != undefined) {
		// 虫メガネの検索ダイアログからの検索実行
		entry_get_list_searchField(req, res,"print");
	}
	else if (req.query.keyword != undefined) {
		// フリーキーワード検索
		entry_get_searchKeyword(req, res,"print");
	}
	else {
		console.log("print");
		entry_get_list(req, res,"print");
	}
};

// 未回収売掛金リスト
exports.mikaishu_list = function(req,res) {
	var today = tools.getToday("{0}/{1}/{2}");
	// 試験大分類の絞り込み用
	var large_item_params = parse_large_item_params(req);
	var pg_params = getPagingParams(req);
	// 試験場
	var shikenjo = getTagetShikenjo(req);
	// レコード件数取得用SQL生成
	var sql_count = mikaishu_list_sql_count();

	if (large_item_params != '') {
		sql_count += ' ' +  large_item_params + ' AND ';
	}
	if (shikenjo != "") {
		sql_count += ' ' + shikenjo + ' AND '
	}

	sql_count += ' entry_info.delete_check = $1' + ' AND subq2.pay_result = 2 AND subq2.nyukin_yotei_date < \'' + today + '\'';

	// 案件リスト取得用SQL生成
	var sql = mikaishu_list_sql();
	if (large_item_params != '') {
		sql += ' ' + large_item_params + ' AND ';
	}
	if (shikenjo != "") {
		sql += ' ' + shikenjo + ' AND '
	}
	sql	+= ' entry_info.delete_check = $1 AND subq2.pay_result = 2 AND subq2.nyukin_yotei_date < \'' + today + '\' ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	//console.log(sql);
	return entry_get_list_for_grid(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
};

exports.mikaishu_list_csv = function(req,res) {
	var today = tools.getToday("{0}/{1}/{2}");
	// 試験大分類の絞り込み用
	var large_item_params = parse_large_item_params(req);
	var pg_params = getPagingParams(req);
	// レコード件数取得用SQL生成
	var sql_count = mikaishu_list_sql_count();

	if (large_item_params != '') {
		sql_count += ' ' +  large_item_params + ' AND ';
	}
	if (shikenjo != "") {
		sql_count += ' ' + shikenjo + ' AND '
	}

	sql_count += ' entry_info.delete_check = $1' + ' AND subq2.pay_result = 2 AND subq2.nyukin_yotei_date < \'' + today + '\'';

	// 案件リスト取得用SQL生成
	var sql = mikaishu_list_sql();
	if (large_item_params != '') {
		sql += ' ' + large_item_params + ' AND ';
	}
	// 試験場
	var shikenjo = getTagetShikenjo(req);
	if (shikenjo != "") {
		sql += ' ' + shikenjo + ' AND '
	}

	sql	+= ' entry_info.delete_check = $1 AND subq2.pay_result = 2 AND subq2.nyukin_yotei_date < \'' + today + '\' ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord;
	//console.log(sql);
	return entry_get_list_for_print(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
};

var getPagingParams = function (req) {
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

// 試験大分類での絞り込み用クエリー変数の取り出しとSQL生成
var parse_large_item_params = function(req) {
	var params = "";
	var searchField = "test_large_class.item_cd";
	var searchString = "";
	if (req.query.L01 == '1') {
		searchString = "'L01'";
		if (params != "") params += " OR ";
		params += searchField + "=" + searchString;
	}
	if (req.query.L02 == '1') {
		searchString = "'L02'";
		if (params != "") params += " OR ";
		params += searchField + "=" + searchString;
	}
	if (req.query.L03 == '1') {
		searchString = "'L03'";
		if (params != "") params += " OR ";
		params += searchField + "=" + searchString;
	}
	if (req.query.L04 == '1') {
		searchString = "'L04'";
		if (params != "") params += " OR ";
		params += searchField + "=" + searchString;
	}
	if (req.query.L05 == '1') {
		searchString = "'L05'";
		if (params != "") params += " OR ";
		params += searchField + "=" + searchString;
	}
	if (req.query.L06 == '1') {
		if (params != "") params += " OR ";
		searchString = "'L06'";
		params += searchField + "=" + searchString;
	}
	if (req.query.L07 == '1') {
		if (params != "") params += " OR ";
		searchString = "'L07'";
		params += searchField + "=" + searchString;
	}
	if (params != '') {
		params = '(' + params + ')'
	}
	return params;
}
// 試験場選択
var getTagetShikenjo = function(req) {
	var shikenjo = "";
	if (req.query.shikenjo != 0) {
		shikenjo = " shikenjo = " + req.query.shikenjo;
	}
	return shikenjo;
}

// 検索条件（虫眼鏡アイコンの検索）の解析
var entry_parse_search_params = function(searchField,searchOper,searchString) {
	if (searchField === "") {
		return "";
	}
	// 検索対象列名の置換
	if (searchField === "test_large_class_name") {
		searchField = "test_large_class.item_name";
	}
	else if (searchField === "test_middle_class_name") {
		searchField = "test_middle_class.item_name";
	}
	else if (searchField === "pay_result") {
		searchField = "subq2.pay_result";
		if (searchString === "未登録") {
				if (searchOper === "eq") {
					searchOper = ' IS NULL';
				} else {
					searchOper = ' IS NOT NULL';
				}

		}	else if (searchString === "請求待ち") {
			searchString = 0;
		} else if (searchString === "請求可") {
			searchString = 1;
		} else if (searchString === "請求済") {
			searchString = 2;
		} else if (searchString === "入金済") {
			searchString = 3;
		}
	} else if (searchField === "pay_complete") {
			searchField = "subq.pay_complete";
			if (searchString === "有") {
					if (searchOper === "eq") {
						searchOper = ' IS NOT NULL';
					} else {
						searchOper = ' IS NULL';
					}
			}
	} else if (searchField === "report_limit_date") {
		searchField = "to_char(report_limit_date, 'YYYY/MM/DD')";
	} else if (searchField === "inquiry_date") {
		searchField = "to_char(inquiry_date, 'YYYY/MM/DD')";
	} else if (searchField === "entry_no") {
		searchField = "entry_info.entry_no";
	} else if (searchField === "client_name_1") {
		searchField = "client_list.name_1";
	} else if (searchField === "agent_name_1") {
		searchField = "agent_list.name_1";
	} else if (searchField === "entry_status") {
		if (searchString === "引合") {
			searchString = '01';
		} else if (searchString === "見積") {
			searchString = '02';
		} else if (searchString === "依頼") {
			searchString = '03';
		} else if (searchString === "完了") {
			searchString = '04';
		} else if (searchString === "失注") {
			searchString = '05';
		}
	} else if (searchField === "order_accept_check") {
		if (searchString === "本登録") {
			searchString = 0;
		} else if (searchString === "仮登録") {
			searchString = 1;
		}
	}
	// 演算子指定の解析
	if (searchOper === "eq") {
		searchOper = " = '" + searchString + "'";
	} else if (searchOper === "ne") {
		searchOper = " <> '" + searchString + "'";
	} else if (searchOper === "lt") {
		searchOper = " < '" + searchString + "'";
//		searchOper = " < " + searchString;
	} else if (searchOper === "le") {
		searchOper = " <= '" + searchString + "'";
//		searchOper = " <= " + searchString;
	} else if (searchOper === "gt") {
		searchOper = " > '" + searchString + "'";
//		searchOper = " > " + searchString;
	} else if (searchOper === "ge") {
		searchOper = " >= '" + searchString + "'";
//		searchOper = " >= " + searchString;
	} else if (searchOper === "bw") {
		searchOper = " LIKE '" + searchString + "%'";
	} else if (searchOper === "bn") {
		searchOper = " NOT LIKE '" + searchString + "%'";
	} else if (searchOper === "ew") {
		searchOper = " LIKE '%" + searchString + "'";
	} else if (searchOper === "en") {
		searchOper = " NOT LIKE '%" + searchString + "'";
	} else if (searchOper === "in") {
		searchOper = " LIKE '%" + searchString + "%'";
	} else if (searchOper === "ni") {
		searchOper = " NOT LIKE '%" + searchString + "%'";
	} else if (searchOper === "cn") {
			searchOper = " LIKE '%" + searchString + "%'";
	} else if (searchOper === "nc") {
			searchOper = " NOT LIKE '%" + searchString + "%'";
	} else if (searchOper === "nu") {
			searchOper = " IS NULL ";
	} else if (searchOper === "nn") {
			searchOper = " IS NOT NULL ";
	}
	return searchField +  searchOper;
}

// 案件リストの検索（虫めがねアイコンの検索）
var entry_get_list_searchField = function (req, res, func) {
	// 虫眼鏡の検索条件
	var searchField = req.query.searchField;
	var searchString = req.query.searchString;
	var searchOper = req.query.searchOper;

	var searchParams = entry_parse_search_params(searchField,searchOper,searchString);
	// 試験大分類の絞り込み用
	var large_item_params = parse_large_item_params(req);
	var pg_params = getPagingParams(req);
	// レコード件数取得用SQL生成
	var sql_count = entry_get_list_sql_count();
	if (searchParams != '') {
		sql_count += ' ' +  searchParams + ' AND';
	}
	if (large_item_params != '') {
		sql_count += ' ' +  large_item_params + ' AND';
	}
	sql_count += ' entry_info.delete_check = $1';
	// 案件リスト取得用SQL生成
	var sql = entry_get_list_sql();
	if (searchParams != '') {
		sql += ' ' +  searchParams + ' AND';
	}
	if (large_item_params != '') {
		sql += ' ' +  large_item_params + ' AND';
	}
	// 試験場
	var shikenjo = getTagetShikenjo(req);
	if (shikenjo != "") {
		sql += ' ' + shikenjo + ' AND '
	}
	if (func === "grid") {
		// grid表示
		sql += ' entry_info.delete_check = $1  ORDER BY '
			+ pg_params.sidx + ' ' + pg_params.sord
			+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
			return entry_get_list_for_grid(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
	} else if (func === "print") {
		// 印刷、CSV出力
		sql += ' entry_info.delete_check = $1  ORDER BY '
			+ pg_params.sidx + ' ' + pg_params.sord;
		return entry_get_list_for_print(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
	}
};

// キーワードの検索文生成
var getEntrySearchKeywordParam = function(keyword) {
	var kw = "";
	if ((keyword != "undefined") && (keyword != "")) {
		kw = "(drc_sch.sf_translate_case(test_large_class.item_name) LIKE drc_sch.sf_translate_case('%" + keyword + "%') OR drc_sch.sf_translate_case(test_middle_class.item_name) LIKE drc_sch.sf_translate_case('%" + keyword + "%') OR drc_sch.sf_translate_case(entry_title) LIKE drc_sch.sf_translate_case('%" + keyword + "%') OR drc_sch.sf_translate_case(client_list.name_1) LIKE drc_sch.sf_translate_case('%" + keyword + "%') OR " +
			"drc_sch.sf_translate_case(client_list.name_2) LIKE drc_sch.sf_translate_case('%" + keyword + "%') OR drc_sch.sf_translate_case(agent_list.name_1) LIKE drc_sch.sf_translate_case('%" + keyword + "%') OR drc_sch.sf_translate_case(entry_info.entry_no) LIKE drc_sch.sf_translate_case('%" + keyword + "%'))";
	}
	return kw;
};
// 期間開始
var getEntrySearchStartDateParam = function(sd) {
	var dd = "";
	if ((sd != "undefined") && (sd != "")) {
		dd = "(inquiry_date >='" + sd + "' OR order_accepted_date >='" + sd + "')";
	}
	return dd;
}
// 期間終了
var getEntrySearchEndDateParam = function(ed) {
	var dd = "";
	if ((ed != "undefined") && (ed != "")) {
		dd = "(inquiry_date <='" + ed + "' OR order_accepted_date <='" + ed + "')";
	}
	return dd;
}

// キーワード検索
var entry_get_searchKeyword = function(req, res, func) {
	// 試験大分類の絞り込み用
	var large_item_params = parse_large_item_params(req);
	var pg_params = getPagingParams(req);
	// レコード件数取得用SQL生成
	var sql_count = entry_get_list_sql_count();
	// キーワードを検索するためのSQL生成
	var keyword = getEntrySearchKeywordParam(req.query.keyword);
	// 試験場
	var shikenjo = getTagetShikenjo(req);
	// 期間設定
	var sd = getEntrySearchStartDateParam(req.query.search_start_date);
	var ed = getEntrySearchEndDateParam(req.query.search_end_date);

	if (large_item_params != '') {
		sql_count += ' ' +  large_item_params + ' AND';
	}
	if (keyword != '') {
		sql_count += ' ' +  keyword + " AND ";
	}
	if (sd != '') {
		sql_count += ' ' +  sd + " AND ";
	}
	if (ed != '') {
		sql_count += ' ' +  ed + " AND ";
	}
	if (shikenjo != "") {
		sql_count += ' ' + shikenjo + ' AND '
	}
	sql_count += ' entry_info.delete_check = $1';

	// 案件リスト取得用SQL生成
	var sql = entry_get_list_sql();
	if (large_item_params != '') {
		sql += ' ' + large_item_params + ' AND ';
	}
	if (keyword != '') {
		sql += ' ' +  keyword + " AND ";
	}
	if (sd != '') {
		sql += ' ' +  sd + " AND ";
	}
	if (ed != '') {
		sql += ' ' +  ed + " AND ";
	}
	if (shikenjo != "") {
		sql += ' ' + shikenjo + ' AND '
	}
	if (func === "grid") {
		// grid表示
		sql += ' entry_info.delete_check = $1  ORDER BY '
			+ pg_params.sidx + ' ' + pg_params.sord
			+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
			return entry_get_list_for_grid(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
	} else if (func === "print") {
		// 印刷、CSV出力
		sql += ' entry_info.delete_check = $1  ORDER BY '
			+ pg_params.sidx + ' ' + pg_params.sord;
		return entry_get_list_for_print(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
	}

};

// 案件リストの取得
var entry_get_list = function (req, res, func) {
	// 試験大分類の絞り込み用
	var large_item_params = parse_large_item_params(req);
	var pg_params = getPagingParams(req);
	// 試験場
	var shikenjo = getTagetShikenjo(req);
	// レコード件数取得用SQL生成
	var sql_count = entry_get_list_sql_count();
	if (large_item_params != '') {
		sql_count += ' ' +  large_item_params + ' AND';
	}
	if (shikenjo != "") {
		sql_count += ' ' + shikenjo + ' AND '
	}
	sql_count += ' entry_info.delete_check = $1';
	// 案件リスト取得用SQL生成
	var sql = entry_get_list_sql();
	if (large_item_params != '') {
		sql += ' ' + large_item_params + ' AND ';
	}
	if (shikenjo != "") {
		sql += ' ' + shikenjo + ' AND '
	}
	if (func === "grid") {
		// grid表示
		sql += ' entry_info.delete_check = $1  ORDER BY '
			+ pg_params.sidx + ' ' + pg_params.sord
			+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
			return entry_get_list_for_grid(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
	} else if (func === "print") {
		// 印刷、CSV出力
		sql += ' entry_info.delete_check = $1  ORDER BY '
			+ pg_params.sidx + ' ' + pg_params.sord;
		return entry_get_list_for_print(res, sql_count, sql, [req.query.delete_check,req.query.entry_status_01, req.query.entry_status_02, req.query.entry_status_03, req.query.entry_status_04,req.query.entry_status_05], pg_params);
	}
};

// 案件リスト取得用SQL生成
var entry_get_list_sql = function() {
	var sql = 'SELECT '
		+ 'entry_info.entry_no,'
		+ 'entry_title,'
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date,"
		+ "to_char(shiken_kaishi_date, 'YYYY/MM/DD') AS shiken_kaishi_date,"
		+ "to_char(report_limit_date, 'YYYY/MM/DD') AS report_limit_date,"
		+ "to_char(report_submit_date, 'YYYY/MM/DD') AS report_submit_date,"
		+ 'to_char(prompt_report_limit_date_1,\'YYYY/MM/DD\') AS prompt_report_limit_date_1,'		// 速報提出期限１
		+ 'to_char(prompt_report_submit_date_1,\'YYYY/MM/DD\') AS prompt_report_submit_date_1,'		// 速報提出日１
		+ 'to_char(prompt_report_limit_date_2,\'YYYY/MM/DD\') AS prompt_report_limit_date_2,'		// 速報提出期限２
		+ 'to_char(prompt_report_submit_date_2,\'YYYY/MM/DD\') AS prompt_report_submit_date_2,'		// 速報提出日２
		+ 'subq.pay_complete,'
		+ 'subq2.pay_result,'
		+ 'subq3.pay_result_1,'
		+ 'entry_status,'
		+ 'sales_person_id,'
		+ 'quote_info.quote_no,'
		+ "to_char(quote_date, 'YYYY/MM/DD') AS quote_date,"
		+ 'quote_info.order_status,'
		+ 'total_price,'																// 合計金額（税抜）
		+ 'quote_info.consumption_tax,'
		+ 'quote_info.monitors_num,'										// 被験者数
		+ 'quote_info.quote_submit_check,'							// PDF発行
		+ 'amount_total,'																// 請求合計
		+ 'complete_total,'															// 入金合計
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date,"
		+ "entry_info.client_cd,"
		+ "client_list.name_1 AS client_name_1,"
		+ "client_list.name_2 AS client_name_2,"
		+ "client_list.zipcode AS client_zipcode,"
		+ "client_list.address_1 AS client_address_1,"
		+ "client_list.address_2 AS client_address_2,"
		+ "client_division_list.zipcode AS client_division_zipcode,"
		+ "client_division_list.address_1 AS client_division_address_1,"
		+ "client_division_list.address_2 AS client_division_address_2,"
		+ "client_list.tel_no AS client_tel_no,"
		+ "client_list.fax_no AS client_fax_no,"
		+ "client_division_list.tel_no AS client_division_tel_no,"
		+ "client_division_list.fax_no AS client_division_fax_no,"
		+ "client_division_list.division_cd AS client_division_cd,"
		+ "client_division_list.name AS client_division_name,"
		+ "client_person_list.person_id AS client_person_id,"
		+ "client_person_list.name AS client_person_name,"
		+ "client_person_list.compellation AS client_person_compellation,"
		+ 'agent_cd,'																			// 代理店CD
		+ "agent_division_cd,"														// 代理店部署CD
		+ "agent_person_id,"															// 代理店担当者ID
		+ 'agent_list.name_1 AS agent_name_1,'									// 代理店名称1
		+ 'agent_list.name_2 AS agent_name_2,'									// 代理店名称2
		+ "agent_division_list.name AS agent_division_name,"					// 代理店部署名
		+ "agent_division_list.memo AS agent_division_memo,"					// 代理店部署メモ
		+ "agent_person_list.name AS agent_person_name,"						// 代理店担当者名
		+ "agent_person_list.memo AS agent_person_memo,"						// 代理店担当者メモ
		+ "agent_person_list.compellation AS agent_person_compellation,"

		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date,"
		+ 'order_accept_check,'
		+ 'order_type,'
		+ 'entry_info.test_large_class_cd,'
		+ 'test_large_class.item_name AS test_large_class_name,'
		+ 'entry_info.test_middle_class_cd,'
		+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'acounting_period_no,'
		+ 'out_list.name_1 AS outsourcing_name,'
		+ 'test_person_id,'
		+ 'kentai_name,'
		+ 'entry_memo,'
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'entry_info.created_id,'
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'entry_info.updated_id,'
		+ 'entry_info.shikenjo'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list AS agent_division_list ON(entry_info.agent_cd = agent_division_list.client_cd AND entry_info.agent_division_cd = agent_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list AS agent_person_list ON(entry_info.agent_cd = agent_person_list.client_cd AND entry_info.agent_division_cd = agent_person_list.division_cd AND entry_info.agent_person_id = agent_person_list.person_id)'
		+ ' LEFT JOIN drc_sch.itakusaki_list AS out_list ON(entry_info.outsourcing_cd = out_list.client_cd)'
		// 請求情報のサブクエリ 未入金ありを表示するため(入金確認済になっていないか、入金確認済でも入金額が少ないもの)
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_complete FROM drc_sch.billing_info WHERE (pay_result < 3 OR (pay_result = 3 AND (pay_amount > pay_complete))) AND billing_info.delete_check = 0 GROUP BY entry_no) as subq ON(subq.entry_no = entry_info.entry_no)'
		// 請求情報のサブクエリ 請求区分を表示するため
		+ ' LEFT JOIN (SELECT entry_no,MIN(pay_result) AS pay_result ,SUM(pay_amount_total) AS amount_total,SUM(pay_complete) AS complete_total FROM drc_sch.billing_info WHERE billing_info.delete_check = 0 GROUP BY entry_no) as subq2 ON(subq2.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_result_1 FROM drc_sch.billing_info WHERE (pay_result = 1 AND billing_info.delete_check = 0) GROUP BY entry_no) as subq3 ON(subq3.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN drc_sch.quote_info ON(entry_info.entry_no = quote_info.entry_no AND quote_info.order_status = 2 AND quote_info.quote_delete_check = 0)'
		// 合計金額を求めるサブクエリー
		+ ' LEFT JOIN (SELECT entry_no,quote_no,sum(price) AS total_price FROM drc_sch.quote_specific_info WHERE quote_specific_info.specific_delete_check = 0 GROUP BY entry_no,quote_no) AS subq4 ON (quote_info.entry_no = subq4.entry_no AND quote_info.quote_no = subq4.quote_no )'
		+ ' WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5 OR entry_status = $6) AND';
		return sql;
}
var entry_get_list_sql_count = function() {
	var sql = 'SELECT COUNT(*) as cnt'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
		// 請求情報のサブクエリ 未入金ありを表示するため(入金確認済になっていないか、入金確認済でも入金額が少ないもの)
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_complete FROM drc_sch.billing_info WHERE (pay_result < 3 OR (pay_result = 3 AND (pay_amount > pay_complete))) AND billing_info.delete_check = 0 GROUP BY entry_no) as subq ON(subq.entry_no = entry_info.entry_no)'
		// 請求情報のサブクエリ 請求区分を表示するため
		+ ' LEFT JOIN (SELECT entry_no,MIN(pay_result) AS pay_result FROM drc_sch.billing_info WHERE billing_info.delete_check = 0 GROUP BY entry_no) as subq2 ON(subq2.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_result_1 FROM drc_sch.billing_info WHERE (pay_result = 1 AND billing_info.delete_check = 0) GROUP BY entry_no) as subq3 ON(subq3.entry_no = entry_info.entry_no)'
		+ ' WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5 OR entry_status = $6) AND';
		return sql;
}
// 未回収リスト取得用SQL生成
var mikaishu_list_sql = function() {
	var sql = 'SELECT '
		+ 'entry_info.entry_no,'
		+ 'entry_title,'
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date,"
		+ "to_char(shiken_kaishi_date, 'YYYY/MM/DD') AS shiken_kaishi_date,"
		+ "to_char(report_limit_date, 'YYYY/MM/DD') AS report_limit_date,"
		+ "to_char(report_submit_date, 'YYYY/MM/DD') AS report_submit_date,"
		+ 'subq.pay_complete,'
		+ 'subq2.pay_result,'
		+ 'subq3.pay_result_1,'
		+ 'entry_status,'
		+ 'sales_person_id,'
		+ 'quote_no,'
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date,"
		+ "entry_info.client_cd,"
		+ "client_list.name_1 AS client_name_1,"
		+ "client_list.name_2 AS client_name_2,"
		+ "client_list.address_1 AS client_address_1,"
		+ "client_list.address_2 AS client_address_2,"
		+ "client_division_list.address_1 AS client_division_address_1,"
		+ "client_division_list.address_2 AS client_division_address_2,"
		+ "client_list.tel_no AS client_tel_no,"
		+ "client_list.fax_no AS client_fax_no,"
		+ "client_division_list.tel_no AS client_division_tel_no,"
		+ "client_division_list.fax_no AS client_division_fax_no,"
		+ "client_division_list.division_cd AS client_division_cd,"
		+ "client_division_list.name AS client_division_name,"
		+ "client_person_list.person_id AS client_person_id,"
		+ "client_person_list.name AS client_person_name,"
		+ "client_person_list.compellation AS client_person_compellation,"
		+ 'agent_cd,'																			// 代理店CD
		+ "agent_division_cd,"														// 代理店部署CD
		+ "agent_person_id,"															// 代理店担当者ID
		+ 'agent_list.name_1 AS agent_name_1,'									// 代理店名称1
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date,"
		+ 'order_accept_check,'
		+ 'order_type,'
		+ 'entry_info.test_large_class_cd,'
		+ 'test_large_class.item_name AS test_large_class_name,'
		+ 'entry_info.test_middle_class_cd,'
		+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'test_person_id,'
		+ 'consumption_tax,'
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'entry_info.created_id,'
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'entry_info.updated_id,'
		+ 'entry_info.shikenjo'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)'
		// 請求情報のサブクエリ 未入金ありを表示するため(入金確認済になっていないか、入金確認済でも入金額が少ないもの)
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_complete FROM drc_sch.billing_info WHERE (pay_result < 3 OR (pay_result = 3 AND (pay_amount > pay_complete))) AND billing_info.delete_check = 0 GROUP BY entry_no) as subq ON(subq.entry_no = entry_info.entry_no)'
		// 請求情報のサブクエリ 請求区分を表示するため
		+ ' LEFT JOIN (SELECT entry_no,MIN(pay_result) AS pay_result,nyukin_yotei_date FROM drc_sch.billing_info WHERE billing_info.delete_check = 0 GROUP BY entry_no,nyukin_yotei_date) as subq2 ON(subq2.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_result_1 FROM drc_sch.billing_info WHERE (pay_result = 1 AND billing_info.delete_check = 0) GROUP BY entry_no) as subq3 ON(subq3.entry_no = entry_info.entry_no)'
		+ ' WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5 OR entry_status = $6) AND';
		return sql;
}
var mikaishu_list_sql_count = function() {
	var sql = 'SELECT COUNT(*) as cnt'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
		// 請求情報のサブクエリ 未入金ありを表示するため(入金確認済になっていないか、入金確認済でも入金額が少ないもの)
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_complete FROM drc_sch.billing_info WHERE (pay_result < 3 OR (pay_result = 3 AND (pay_amount > pay_complete))) AND billing_info.delete_check = 0 GROUP BY entry_no) as subq ON(subq.entry_no = entry_info.entry_no)'
		// 請求情報のサブクエリ 請求区分を表示するため
		+ ' LEFT JOIN (SELECT entry_no,MIN(pay_result) AS pay_result,nyukin_yotei_date FROM drc_sch.billing_info WHERE billing_info.delete_check = 0 GROUP BY entry_no,nyukin_yotei_date) as subq2 ON(subq2.entry_no = entry_info.entry_no)'
		+ ' LEFT JOIN (SELECT entry_no,COUNT(pay_result) AS pay_result_1 FROM drc_sch.billing_info WHERE (pay_result = 1 AND billing_info.delete_check = 0) GROUP BY entry_no) as subq3 ON(subq3.entry_no = entry_info.entry_no)'
		+ ' WHERE (entry_status = $2 OR entry_status = $3 OR entry_status = $4 OR entry_status = $5 OR entry_status = $6) AND';
		return sql;
}
// 案件リストの取得（ガントチャート用）
exports.entry_get_list_gantt = function (req, res) {
	var sql = 'SELECT '
		+ 'entry_info.entry_no,'
		+ 'client_list.name_1 AS client_name_1,'
		+ 'client_division_list.name AS client_division_name,'
		+ 'entry_title,'
		+ 'to_char(inquiry_date, \'YYYY/MM/DD\') AS inquiry_date,'
		+ 'entry_status,'
		+ 'sales_person_id,'
		+ 'quote_info.quote_no,'
		+ "to_char(quote_info.quote_date,'YYYY/MM/DD') AS quote_issue_date,"
		+ 'to_char(order_accepted_date,\'YYYY/MM/DD\') AS order_accepted_date,'
		+ 'order_accept_check,'
		+ 'order_type,'
		+ 'entry_info.test_large_class_cd,'
		+ 'test_large_class.item_name AS test_large_class_name,'
		+ 'entry_info.test_middle_class_cd,'
		+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'entry_info.created_id,'
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'entry_info.updated_id,'
		+ 'entry_info.shikenjo'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
		+ ' LEFT JOIN drc_sch.quote_info ON(entry_info.entry_no = quote_info.entry_no AND quote_info.order_status = 2)'
		+ ' WHERE entry_info.delete_check = $1 '
		+ ' AND entry_info.test_large_class_cd = $2 AND entry_info.entry_status != \'04\' AND entry_info.entry_status != \'05\' AND quote_info.quote_delete_check = 0'
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql, [0,req.params.test_type]);
};
// 案件リストの取得（スケジュール用）
exports.entry_get_list_cal = function (req, res) {
	var sql = 'SELECT '
		+ 'entry_info.entry_no,'
		+ 'client_list.name_1 AS client_name_1,'
		+ 'client_division_list.name AS client_division_name,'
		+ 'entry_title,'
		+ 'to_char(inquiry_date, \'YYYY/MM/DD\') AS inquiry_date,'
		+ 'entry_status,'
		+ 'sales_person_id,'
///		+ 'quote_info.quote_no,'
///		+ "to_char(quote_info.quote_date,'YYYY/MM/DD') AS quote_issue_date,"
		+ 'to_char(order_accepted_date,\'YYYY/MM/DD\') AS order_accepted_date,'
		+ 'order_accept_check,'
		+ 'order_type,'
		+ 'entry_info.test_large_class_cd,'
		+ 'test_large_class.item_name AS test_large_class_name,'
		+ 'entry_info.test_middle_class_cd,'
		+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'entry_info.created_id,'
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'entry_info.updated_id,'
		+ 'entry_info.shikenjo'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
//		+ ' LEFT JOIN drc_sch.quote_info ON(entry_info.entry_no = quote_info.entry_no)'// AND quote_info.order_status = 2)'
		+ ' WHERE entry_info.delete_check = $1 '
//		+ ' AND entry_info.test_large_class_cd = $2 AND entry_info.entry_status != \'04\' AND entry_info.entry_status != \'05\' AND quote_info.quote_delete_check = 0'
		+ ' AND entry_info.test_large_class_cd = $2 AND entry_info.entry_status != \'04\' AND entry_info.entry_status != \'05\' '
		//+ ' AND order_accept_date NOT NULL '
		+ ' ORDER BY entry_no ASC ';
	return entry_get_list_for_gantt(res, sql, [0,req.params.test_type]);
};

// 案件リスト取得
var entry_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
//	console.log(sql);
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
				result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
				result.page = pg_params.page;
				result.records = results.rows[0].cnt;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
						connection.end();
						res.send(result);
					} else {
//						result.records = results.rows.length;
						result.page = pg_params.page;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var entry = [];
							row.id = (i + 1);
							row.cell = results.rows[i];
							result.rows.push(row);
							//console.log(row);
						}
						connection.end();
						res.send(result);
					}
				});
			}
		});
	});
};

var entry_get_list_for_print = function (res, sql_count, sql, params, pg_params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
			connection.end();
			res.send(result);
		} else {
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
						connection.end();
						res.send(result);
					} else {
						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var entry = [];
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
}

// ガントチャート用案件データリスト取得
var entry_get_list_for_gantt = function (res, sql, params) {
	var result = { rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function(result,err) {
			result.records = rows.length;
			for (var i in rows) {
				var entry = rows[i];
				rows[i].quote = [];
			}
			result.rows = rows;
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};

// 案件データ（案件No）取得
var entry_get_detail = function (req, res) {
	var sql = 'SELECT '
		+ 'entry_no,'															// 案件Ｎｏ
		+ 'quote_no,'															// 見積番号
		+ "to_char(inquiry_date, 'YYYY/MM/DD') AS inquiry_date,"				// 問合せ日
		+ 'entry_status,'														// 案件ステータス
		+ 'sales_person_id,'													// 営業担当者ID
//		+ "to_char(quote_issue_date,'YYYY/MM/DD') AS quote_issue_date,"
		+ 'agent_cd,'															// 代理店CD
		+ "agent_division_cd,"													// 代理店部署CD
		+ "agent_person_id,"													// 代理店担当者ID
		+ 'agent_list.name_1 AS agent_name_1,'									// 代理店名称1
		+ 'agent_list.name_2 AS agent_name_2,'									// 代理店名称2
		+ "agent_list.zipcode AS agent_zipcode,"						// 郵便番号
		+ "agent_list.address_1 AS agent_address_1,"					// 代理店住所１
		+ "agent_list.address_2 AS agent_address_2,"					// 代理店住所２
		+ "agent_list.tel_no AS agent_tel_no,"
		+ "agent_list.fax_no AS agent_fax_no,"
		+ "agent_division_list.name AS agent_division_name,"					// 代理店部署名
		+ "agent_division_list.memo AS agent_division_memo,"					// 代理店部署メモ
		+ "agent_division_list.zipcode AS agent_division_zipcode,"				// 郵便番号
		+ "agent_division_list.address_1 AS agent_division_address_1,"
		+ "agent_division_list.address_2 AS agent_division_address_2,"
		+ "agent_division_list.tel_no AS agent_division_tel_no,"
		+ "agent_division_list.fax_no AS agent_division_fax_no,"
		+ "agent_person_list.name AS agent_person_name,"						// 代理店担当者名
		+ "agent_person_list.memo AS agent_person_memo,"						// 代理店担当者メモ
		+ "agent_person_list.compellation AS agent_person_compellation,"
		+ "entry_info.client_cd,"												// 得意先CD
		+ "entry_info.client_division_cd,"										// 得意先部署CD
		+ "entry_info.client_person_id,"										// 得意先担当者ID
		+ "client_list.name_1 AS client_name_1,"								// 得意先名１
		+ "client_list.name_2 AS client_name_2,"								// 得意先名２
		+ "client_list.tel_no AS client_tel_no,"
		+ "client_list.fax_no AS client_fax_no,"
		+ "client_list.zipcode AS client_zipcode,"						// 郵便番号
		+ "client_list.address_1 AS client_address_1,"					// 得意先住所１
		+ "client_list.address_2 AS client_address_2,"					// 得意先住所２
		+ "client_division_list.name AS client_division_name,"					// 得意先部署名
		+ "client_division_list.memo AS client_division_memo,"					// 得意先部署メモ
		+ "client_division_list.zipcode AS client_division_zipcode,"			// 郵便番号
		+ "client_division_list.address_1 AS client_division_address_1,"
		+ "client_division_list.address_2 AS client_division_address_2,"
		+ "client_division_list.tel_no AS client_division_tel_no,"
		+ "client_division_list.fax_no AS client_division_fax_no,"
		+ "client_person_list.name AS client_person_name,"						// 得意先担当者名
		+ "client_person_list.memo AS client_person_memo,"						// 得意先担当者メモ
		+ "client_person_list.compellation AS client_person_compellation,"
		+ 'entry_info.test_large_class_cd,'										// 試験大分類CD
		+ 'test_large_class.item_name AS test_large_class_name,'				// 試験大分類名
		+ 'entry_info.test_middle_class_cd,'									// 試験中分類CD
		+ 'test_middle_class.item_name AS test_middle_class_name,'				// 試験中分類名
		+ 'entry_title,'														// 試験タイトル
		+ 'order_type,'															// 受託区分
		+ 'outsourcing_cd,'														// 受託先CD
		+ 'out_list.name_1 AS outsourcing_name,'								// 受託先CD
		+ "to_char(order_accepted_date,'YYYY/MM/DD') AS order_accepted_date,"	// 受注日
		+ 'order_accept_check,'													// 仮受注チェック
		+ 'acounting_period_no,'												// 会計期No
		+ 'test_person_id,'														// 試験担当者ID
		+ 'entry_amount_price,'													// 案件合計金額
		+ 'entry_amount_billing,'												// 案件請求合計金額
		+ 'entry_amount_deposit,'												// 案件入金合計金額
		+ 'to_char(shiken_kaishi_date,\'YYYY/MM/DD\') AS shiken_kaishi_date,'						// 試験開始日
		+ 'to_char(report_limit_date,\'YYYY/MM/DD\') AS report_limit_date,'							// 報告書提出期限
		+ 'to_char(report_submit_date,\'YYYY/MM/DD\') AS report_submit_date,'						// 報告書提出日
		+ 'to_char(prompt_report_limit_date_1,\'YYYY/MM/DD\') AS prompt_report_limit_date_1,'		// 速報提出期限１
		+ 'to_char(prompt_report_submit_date_1,\'YYYY/MM/DD\') AS prompt_report_submit_date_1,'		// 速報提出日１
		+ 'to_char(prompt_report_limit_date_2,\'YYYY/MM/DD\') AS prompt_report_limit_date_2,'		// 速報提出期限２
		+ 'to_char(prompt_report_submit_date_2,\'YYYY/MM/DD\') AS prompt_report_submit_date_2,'		// 速報提出日２
		+ 'consumption_tax,'															//
		+ 'kentai_name,'																// 検体名
		+ 'entry_memo,'																	// メモ
		+ "entry_info.delete_check,"													// 削除フラグ
		+ "entry_info.delete_reason,"													// 削除理由
		+ "to_char(entry_info.input_check_date,'YYYY/MM/DD') AS input_check_date,"		// 入力日
		+ "entry_info.input_check,"														// 入力完了チェック
		+ "entry_info.input_operator_id,"												// 入力者ID
		+ "to_char(entry_info.confirm_check_date,'YYYY/MM/DD') AS confirm_check_date,"	// 確認日
		+ "entry_info.confirm_check,"													// 確認完了チェック
		+ "entry_info.confirm_operator_id,"												// 確認者ID
		+ "to_char(entry_info.created,'YYYY/MM/DD HH24:MI:SS') AS created,"		// 作成日
		+ 'entry_info.created_id,'												// 作成者ID
		+ "to_char(entry_info.updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"		// 更新日
		+ 'entry_info.updated_id,'												// 更新者ID
		+ 'entry_info.shikenjo'
		+ ' FROM drc_sch.entry_info'
		+ ' LEFT JOIN drc_sch.test_large_class ON(entry_info.test_large_class_cd = test_large_class.item_cd)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON(entry_info.test_middle_class_cd = test_middle_class.item_cd AND entry_info.test_large_class_cd = test_middle_class.large_item_cd)'
		+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_list AS agent_list ON(entry_info.agent_cd = agent_list.client_cd)'
		+ ' LEFT JOIN drc_sch.itakusaki_list AS out_list ON(entry_info.outsourcing_cd = out_list.client_cd)'
		+ ' LEFT JOIN drc_sch.client_division_list ON(entry_info.client_cd = client_division_list.client_cd AND entry_info.client_division_cd = client_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list ON(entry_info.client_cd = client_person_list.client_cd AND entry_info.client_division_cd = client_person_list.division_cd AND entry_info.client_person_id = client_person_list.person_id)'
		+ ' LEFT JOIN drc_sch.client_division_list AS agent_division_list ON(entry_info.agent_cd = agent_division_list.client_cd AND entry_info.agent_division_cd = agent_division_list.division_cd)'
		+ ' LEFT JOIN drc_sch.client_person_list AS agent_person_list ON(entry_info.agent_cd = agent_person_list.client_cd AND entry_info.agent_division_cd = agent_person_list.division_cd AND entry_info.agent_person_id = agent_person_list.person_id)'
		+ ' WHERE entry_no = $1 ';
	var entry = {};
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, [req.params.no]);
		var rows = [];
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function(result,err) {
			for (var i in rows) {
				entry = rows[i];
			}
			connection.end();
			res.send(entry);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};

// 受注確定の見積があるか確認する
exports.order_status_check = function(req, res) {
	var sql = "select quote_no ,order_status from drc_sch.quote_info where entry_no = $1 AND order_status = $2 AND quote_delete_check = 0";
//	var sql = "select quote_no from drc_sch.quote_info where entry_no = $1 AND quote_delete_check = 0";
	// SQL実行
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
			connection.end();
			res.send(result);
		} else {
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, [req.query.entry_no,2], function (err, results) {
					if (err) {
						console.log(err);
						connection.end();
						res.send(result);
					} else {
						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var entry = [];
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
}

// 見積情報データの取得
exports.quote_get = function (req, res) {
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_no != undefined) && (req.params.quote_no != '')) {
			// 案件番号と見積番号に該当する情報を取得する
			quote_get_detail(req, res);
		} else {
			// 案件に含まれる見積のリストを取得する
			quote_get_list(req, res);
		}
	}
};
// 見積明細データの取得(グリッド用）
exports.quote_specific_get_grid = function (req, res) {
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_no != undefined) && (req.params.quote_no != '')) {
			if ((req.params.quote_detail_no != undefined) && (req.params.quote_detail_no != '')) {
				// 見積の中の明細情報を取得する
				quote_specific_get_detail(req, res);
			} else {
				// 見積の中の明細情報のリストを取得する
				quote_specific_get_list_grid(req, res);
			}
		}
	}
};
// 見積明細データの取得(フォーム用）
exports.quote_specific_get_list = function (req, res) {
	if ((req.params.entry_no != undefined) && (req.params.entry_no != '')) {
		if ((req.params.quote_no != undefined) && (req.params.quote_no != '')) {
			// 見積の中の明細情報のリストを取得する
			var sql = 'SELECT '
				+ 'entry_no,'
				+ 'quote_no,'			// 見積番号
				+ 'quote_detail_no,'
				+ 'quote_specific_info.test_middle_class_cd,'
				+ 'test_middle_class_name,'
				+ 'test_middle_class.period_term,'	// 2017.08
				+ 'test_middle_class.period_unit,'	// 2017.08
				//+ 'test_middle_class.item_name AS test_middle_class_name,'
				+ 'unit,'
				+ 'unit_price,'
				+ 'quantity,'
				+ 'price,'
				+ 'summary_check,'
				+ 'specific_memo,'
				+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
				+ 'quote_specific_info.created_id,'
				+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
				+ 'quote_specific_info.updated_id'
				+ ' FROM drc_sch.quote_specific_info'
				+ ' LEFT JOIN drc_sch.test_middle_class ON (quote_specific_info.test_middle_class_cd = test_middle_class.item_cd AND test_middle_class.large_item_cd = $3)'
				+ ' WHERE specific_delete_check = 0 AND (entry_no = $1 AND quote_no = $2) ORDER BY quote_detail_no'
			// SQL実行
			var params = [req.params.entry_no, req.params.quote_no, req.query.large_item_cd];
			//var params = [req.params.entry_no, req.params.quote_no];
			var result = { page: 1, total: 20, records: 0, rows: [] };
			var rows = [];
			// SQL実行
			pg.connect(connectionString, function (err, connection) {
				if (err) {
					console.log(err);
				}
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
		}
	}
};

// 報告書期限情報の取得（ガントチャート用）
exports.report_gantt = function (req, res) {
	var sql = 'SELECT '
		+ '\'報告書\' AS title,'
		+ 'to_char(report_limit_date,\'YYYY/MM/DD\') AS report_limit_date,'							// 報告書提出期限
		+ 'to_char(report_submit_date,\'YYYY/MM/DD\') AS report_submit_date,'						// 報告書提出日
		+ 'to_char(prompt_report_limit_date_1,\'YYYY/MM/DD\') AS prompt_report_limit_date_1,'		// 速報提出期限１
		+ 'to_char(prompt_report_submit_date_1,\'YYYY/MM/DD\') AS prompt_report_submit_date_1,'		// 速報提出日１
		+ 'to_char(prompt_report_limit_date_2,\'YYYY/MM/DD\') AS prompt_report_limit_date_2,'		// 速報提出期限２
		+ 'to_char(prompt_report_submit_date_2,\'YYYY/MM/DD\') AS prompt_report_submit_date_2'		// 速報提出日２
		+ ' FROM drc_sch.entry_info'
		+ ' WHERE entry_no = $1';
	// SQL実行
	var result = [];
	var rows = [];
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, [req.params.entry_no]);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function (results, err) {
			if (err) throw err;
			for (var i in rows) {
				result.push(rows[i]);
			}
			connection.end();
			res.send(result);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};

// 見積情報リストの取得
var quote_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.quote_info WHERE quote_delete_check = $1 AND entry_no = $2';
	var sql = 'SELECT '
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'to_char(quote_date,\'YYYY/MM/DD\') AS quote_date,'	// 見積日
		+ 'expire_date,'		// 有効期限
		+ 'quote_specific.total_price,'
		+ 'monitors_num,'		// 被験者数
		+ 'quote_submit_check,'	// 見積書提出済フラグ
		+ 'order_status,'		// 受注ステータス
		+ 'quote_form_memo,'	// 見積書備考
		+ 'consumption_tax,'	// 消費税率
		+ 'quote_delete_check,' // 削除フラグ
		+ 'to_char(quote_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
		+ 'quote_info.created_id,'
		+ 'to_char(quote_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
		+ 'quote_info.updated_id,'
		+ 'quote_delete_check'
		+ ' FROM drc_sch.quote_info'
		// 合計金額を求めるサブクエリー
		+ ' LEFT JOIN (SELECT entry_no,quote_no,sum(price) AS total_price FROM drc_sch.quote_specific_info WHERE quote_specific_info.specific_delete_check = 0 GROUP BY entry_no,quote_no) AS quote_specific ON (quote_info.entry_no = quote_specific.entry_no AND quote_info.quote_no = quote_specific.quote_no )'
		+ ' WHERE quote_delete_check = $1 AND quote_info.entry_no = $2 ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	var dc = Number(req.query.quote_delete_check);
	var params = [dc,req.params.entry_no];
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		// 最初に件数を取得する
		connection.query(sql_count, params, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
				result.page = pg_params.page;
				result.records = results.rows[0].cnt;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
//						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var quote = [];
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
};


// 見積情報データ取得
var quote_get_detail = function (req, res) {
	var sql = 'SELECT '
		+ 'entry_no,'			// 案件番号
		+ 'quote_no,'			// 見積番号
		+ 'to_char(quote_date,\'YYYY/MM/DD HH24:MI:SS\') AS quote_date,'	// 見積日
		+ 'expire_date,'		// 有効期限
		+ 'monitors_num,'		// 被験者数
		+ 'quote_submit_check,'	// 見積書提出済フラグ
		+ 'order_status,'		// 受注ステータス
		+ 'quote_form_memo,'	// 見積書備考
		+ 'consumption_tax,'	// 消費税率
		+ 'quote_delete_check,' // 削除フラグ
		+ 'to_char(quote_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
		+ 'quote_info.created_id,'
		+ 'to_char(quote_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
		+ 'quote_info.updated_id'
		+ ' FROM drc_sch.quote_info'
		+ ' WHERE quote_info.entry_no = $1 AND quote_no = $2';
	var entry = {};
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql, [req.params.entry_no, req.params.quote_no]);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end', function (result, err) {
			if (err) throw err;
			for (var i in rows) {
				entry = rows[i];
			}
			connection.end();
			res.send(entry);
		});
		query.on('error', function (error) {
			console.log(error);
		});
	});
};
// 見積情報リストの取得（グリッド用）
var quote_specific_get_list_grid = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.quote_specific_info WHERE specific_delete_check = $1 AND (entry_no = $2 AND quote_no = $3)';
	var sql = 'SELECT '
		+ 'entry_no,'
		+ 'quote_no,'			// 見積番号
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
		+ 'quote_specific_info.created_id,'
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
		+ 'quote_specific_info.updated_id'
		+ ' FROM drc_sch.quote_specific_info'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (quote_specific_info.test_middle_class_cd = test_middle_class.item_cd AND test_middle_class.large_item_cd = $4)'
		+ ' WHERE specific_delete_check = $1 AND (entry_no = $2 AND quote_no = $3 ) ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	var rows = [];
	var dc = Number(req.query.specific_delete_check);
	var params_0 = [dc,req.params.entry_no, req.params.quote_no];
	//var params = [dc,req.params.entry_no, req.params.quote_no,req.query.large_item_cd];
	var params = [dc,req.params.entry_no, req.params.quote_no];
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		// 最初に件数を取得する
		connection.query(sql_count, params_0, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
				result.page = pg_params.page;
				result.records = results.rows[0].cnt;
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
//						result.records = results.rows.length;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var quote = [];
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
};

// 見積明細リストの取得（案件フォーム用）
// 受注確定になっている見積Noの明細を取得する
exports.quote_specific_get_list_for_entryform = function (req, res) {
	var sql = 'SELECT '
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'quote_info.consumption_tax,'
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'period_term,'	// 2018.11
		+ 'period_unit,'	// 2018.11
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
		+ 'quote_specific_info.created_id,'
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
		+ 'quote_specific_info.updated_id'
		+ ' FROM drc_sch.quote_specific_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (entry_info.entry_no = $1)'
		+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = entry_info.test_large_class_cd)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.quote_no = quote_specific_info.quote_no AND quote_info.entry_no = $1 AND quote_info.order_status = 2)'
		+ ' WHERE quote_info.quote_delete_check = 0 AND specific_delete_check = 0 AND (quote_specific_info.entry_no = $1 AND quote_info.order_status = 2) ORDER BY quote_detail_no'
	// SQL実行
	var params = [req.params.entry_no];
	var result = { page: 1, total: 20, records: 0, rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
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
// 見積明細リストの取得（案件フォーム用）
// 案件に登録されている見積全部を取得する
exports.quote_specific_get_list_for_calendar = function (req, res) {
	// 受注確定の見積検索
	var sql_a = 'SELECT '
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
		+ 'quote_specific_info.created_id,'
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
		+ 'quote_specific_info.updated_id'
		+ ' FROM drc_sch.quote_specific_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (entry_info.entry_no = $1)'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = entry_info.test_large_class_cd)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.quote_no = quote_specific_info.quote_no AND quote_info.entry_no = $1 AND quote_info.order_status = 2)'
		+ ' WHERE quote_info.quote_delete_check = 0 AND specific_delete_check = 0 AND (quote_specific_info.entry_no = $1 AND quote_info.order_status = 2) ORDER BY quote_detail_no'
	// 全見積の取得
	var sql_b = 'SELECT '
		+ 'quote_info.entry_no,'
		+ 'quote_info.quote_no,'			// 見積番号
		+ 'quote_detail_no,'
		+ 'quote_specific_info.test_middle_class_cd,'
		+ 'test_middle_class_name,'
		//+ 'test_middle_class.item_name AS test_middle_class_name,'
		+ 'unit,'
		+ 'unit_price,'
		+ 'quantity,'
		+ 'price,'
		+ 'summary_check,'
		+ 'specific_memo,'
		+ 'to_char(quote_specific_info.created,\'YYYY/MM/DD HH24:MI:SS\') AS created,'
		+ 'quote_specific_info.created_id,'
		+ 'to_char(quote_specific_info.updated,\'YYYY/MM/DD HH24:MI:SS\') AS updated,'
		+ 'quote_specific_info.updated_id'
		+ ' FROM drc_sch.quote_specific_info'
		+ ' LEFT JOIN drc_sch.entry_info ON (entry_info.entry_no = $1)'
		//+ ' LEFT JOIN drc_sch.test_middle_class ON (test_middle_class.item_cd = quote_specific_info.test_middle_class_cd AND test_middle_class.large_item_cd = entry_info.test_large_class_cd)'
		+ ' LEFT JOIN drc_sch.quote_info ON (quote_info.quote_no = quote_specific_info.quote_no AND quote_info.entry_no = $1)'
		+ ' WHERE quote_info.quote_delete_check = 0 AND specific_delete_check = 0 AND (quote_specific_info.entry_no = $1) ORDER BY quote_detail_no'
	// SQL実行
	var params = [req.params.entry_no];
	var result = { page: 1, total: 20, records: 0, rows: [] };
	var rows = [];
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		if (err) {
			console.log(err);
		}
		var query = connection.query(sql_a, params);
		query.on('row', function (row) {
			rows.push(row);
		});
		query.on('end',function(results,err) {
			result.records = rows.length;
			result.rows = rows;
			if (rows.length > 0) {
				// 受注確定になっている見積が見つかった場合はそれを取得して終了
				connection.end();
				res.send(result);
			} else {
				// 受注確定になっている見積が見つからない場合は全見積データを取得して返す
				query = connection.query(sql_b, params);
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
			}
		});
		query.on('error', function (error) {
			console.log(sql + ' ' + error);
		});
	});
};
