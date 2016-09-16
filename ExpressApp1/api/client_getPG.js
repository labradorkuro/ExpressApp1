// 得意先の取得
exports.client_get = function (req, res) {
	if (req.query.searchField != undefined) {
		// 虫メガネの検索ダイアログからの検索実行
		client_get_list_searchField(req, res);
	}
	else if ((req.query.client_cd != undefined) && (req.query.client_cd != '')) {
		client_get_detail(req, res);
	} else {
		client_get_list(req, res);
	}
};

// 顧客マスタの検索（虫めがねアイコンの検索）
var client_get_list_searchField = function (req, res) {
	// 虫眼鏡の検索条件
	var searchField = req.query.searchField;
	var searchString = req.query.searchString;
	var searchOper = req.query.searchOper;
	var searchParams = client_parse_search_params(searchField,searchOper,searchString);
	var pg_params = getPagingParams(req);
	// レコード件数取得用SQL生成
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_list WHERE delete_check = $1';
	if (searchParams != '') {
		sql_count += ' AND ' +  searchParams;
	}
	// 案件リスト取得用SQL生成
	var sql = client_get_list_sql(11);
	if (searchParams != '') {
		sql += ' AND ' +  searchParams;
	}
	sql += ' ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return client_get_list_for_grid(res, sql_count, sql, [req.query.delete_check], pg_params);
};
// 検索条件（虫眼鏡アイコンの検索）の解析
var client_parse_search_params = function(searchField,searchOper,searchString) {
	if (searchField === "") {
		return "";
	}
	// 検索対象列名の置換
	if (searchField === "client_cd") {
		searchField = "client_cd";
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

exports.client_division_get = function (req, res) {
	if ((req.params.division_cd != undefined) && (req.params.division_cd != '')) {
		client_division_get_detail(req, res);
	} else {
		client_division_get_list(req, res);
	}
};
// 部署コード、部署名のリストを取得する
exports.client_division_list = function (req, res) {
	division_list(req, res);
};
exports.client_person_get = function (req, res) {
	if ((req.params.person_id != undefined) && (req.params.person_id != '')) {
		client_person_get_detail(req, res);
	} else {
		client_person_get_list(req, res);
	}
};
var getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "client_cd";
	pg_param.sord = "asc";
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

var client_get_list_sql = function(index_no) {
	var index_str = ['','アイウエオヴ','カキクケコガギグゲゴ','サシスセソザジズゼゾ','タチツテトダヂヅデド','ナニヌネノ','ハヒフヘホバビブベボ','マミムメモ','ヤユヨ','ラリルレロ','ワヲン',''];
	var sql = 'SELECT '
		+ 'client_cd,'
		+ 'name_1,'
		+ 'name_2,'
		+ "kana," // カナ
		+ "email," // メールアドレス
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "memo,"
		+ 'delete_check,'
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'created_id,'
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'updated_id';
//		+ ' FROM drc_sch.client_list WHERE delete_check = $1 AND client_cd LIKE \'' + index_str[index_no] + '%\' ORDER BY '
//		+ ' FROM drc_sch.client_list WHERE delete_check = $1 AND client_cd ~* \'^[' + index_str[index_no] + ']\' ORDER BY '
	if (index_no < 11) {
		sql += ' FROM drc_sch.client_list WHERE delete_check = $1 AND kana ~* \'^[' + index_str[index_no] + ']\' ';
	} else {
		sql += ' FROM drc_sch.client_list WHERE delete_check = $1 ';
	}
	return sql;
};

// 得意先リストの取得
var client_get_list = function (req, res) {
	var index_str = ['','アイウエオヴ','カキクケコガギグゲゴ','サシスセソザジズゼゾ','タチツテトダヂヅデド','ナニヌネノ','ハヒフヘホバビブベボ','マミムメモ','ヤユヨ','ラリルレロ','ワヲン',''];
	var pg_params =  getPagingParams(req);
	var index_no = Number(req.query.no);
	var sql_count = "";
	if (index_no < 10) {
		sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_list WHERE delete_check = $1 AND kana ~* \'^[' + index_str[index_no] + ']\'';
	} else {
		sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_list WHERE delete_check = $1';
	}
	var sql = client_get_list_sql(index_no) + ' ORDER BY ' + pg_params.sidx + ' ' + pg_params.sord + ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return client_get_list_for_grid(res, sql_count, sql, [req.query.delete_check], pg_params);
};

// 部署情報リストの取得
var client_division_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_division_list WHERE client_cd = $1 AND delete_check = $2';
	var sql = 'SELECT '
		+ 'client_cd,'
		+ 'division_cd,'
		+ 'name,'
		+ "kana," // カナ
		+ "email," // メールアドレス
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "billing_limit," // 請求締日
		+ "payment_date," // 支払日
		+ "holiday_support,"
		+ "memo,"
		+ 'delete_check,'
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'created_id,'
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'updated_id'
		+ ' FROM drc_sch.client_division_list WHERE client_cd = $1 AND delete_check = $2 ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return client_get_list_for_grid(res, sql_count, sql, [req.query.client_cd,req.query.delete_check], pg_params);
};

//
// 部署コード、部署名のリストを取得する
var division_list = function (req, res) {
	var division_list = [];
	var sql = 'SELECT '
		+ 'division_cd,'
		+ 'name'
		+ ' FROM drc_sch.client_division_list WHERE client_cd = $1 AND delete_check = $2 ORDER BY kana';
  // SQL実行
	pg.connect(connectionString, function (err, connection) {
			// データを取得するためのクエリーを実行する
			connection.query(sql, [req.query.client_cd,req.query.delete_check], function (err, results) {
				if (err) {
					console.log(err);
					connection.end();
					res.send(division_list);
				} else {
					division_list = results.rows;
					connection.end();
					res.send(division_list);
				}
			});
		});
};

// 担当者情報リストの取得
var client_person_get_list = function (req, res) {
	var pg_params = getPagingParams(req);
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_person_list WHERE client_cd = $1 AND division_cd = $2 AND delete_check = $3';
	var sql = 'SELECT '
		+ 'client_cd,'
		+ 'division_cd,'
		+ 'person_id,'
		+ 'name,'
		+ "kana,"
		+ "compellation,"
		+ "title,"
		+ "email,"
		+ "memo,"
		+ 'delete_check,'
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'created_id,'
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'updated_id'
		+ ' FROM drc_sch.client_person_list WHERE client_cd = $1 AND division_cd = $2 AND delete_check = $3 ORDER BY '
		+ pg_params.sidx + ' ' + pg_params.sord
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return client_get_list_for_grid(res, sql_count, sql, [req.query.client_cd, req.query.division_cd, req.query.delete_check], pg_params);
};
var client_get_list_for_grid = function (res, sql_count, sql, params, pg_params) {
	var result = { page: 1, total: 20, records: 0, rows: [] };
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// 最初に件数を取得する
		connection.query(sql_count, params, function (err, results) {
			if (err) {
				console.log(err);
			} else {
				// 取得した件数からページ数を計算する
				result.total = Math.ceil(results.rows[0].cnt / pg_params.limit);
				// データを取得するためのクエリーを実行する（LIMIT OFFSETあり）
				connection.query(sql, params, function (err, results) {
					if (err) {
						console.log(err);
					} else {
						result.records = results.rows.length;
						result.page = pg_params.page;
						for (var i in results.rows) {
							var row = { id: '', cell: [] };
							var user = [];
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
// 得意先データの取得
var client_get_detail = function (req, res) {
	var sql = 'SELECT '
		+ 'client_cd,'
		+ 'name_1,'
		+ 'name_2,'
		+ "kana," // カナ
		+ "email," // メールアドレス
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "memo,"
		+ 'delete_check,'
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created,"
		+ 'created_id,'
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated,"
		+ 'updated_id'
		+ ' FROM drc_sch.client_list WHERE client_cd = $1';
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		// データを取得するためのクエリーを実行する
		console.log(sql + " " + req.query.client_cd);
		connection.query(sql, [req.query.client_cd], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var client = null;
				if (results.rows.length > 0) {
					client = results.rows[0];
				}
				connection.end();
				res.send(client);
			}
		});
	});
};
