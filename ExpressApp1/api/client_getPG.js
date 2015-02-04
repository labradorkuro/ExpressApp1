// 得意先の取得
exports.client_get = function (req, res) {
	if ((req.params.client_cd != undefined) && (req.params.client_cd != '')) {
		client_get_detail(req, res);
	} else {
		client_get_list(req, res);
	}
};
var getPagingParams = function (req) {
	var pg_param = {};
	pg_param.sidx = "uid";
	pg_param.sord = "asc";
	pg_param.limit = 10;
	pg_param.offset = 0;
	pg_param.page = 1;
	if (req.query.rows) pg_param.limit = req.query.rows;
	if (req.query.page) pg_param.page = req.query.page;
	if (req.query.sidx) pg_param.sidx = req.query.sidx;
	if (req.query.sodr) pg_param.sord = req.query.sord;
	pg_param.offset = (pg_param.page - 1) * pg_param.limit;
	return pg_param;
};
// 得意先リストの取得
var client_get_list = function (req, res) {
	var index_no = Number(req.query.no);
	var index_str = ['','0-9','A-Z','ｱ','ｶ','ｻ','ﾀ','ﾅ','ﾊ','ﾏ','ﾔ','ﾗ','ﾜ'];
	var pg_params = getPagingParams(req);
//	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_list WHERE delete_check = $1 AND client_cd LIKE \'' + index_str[index_no] + '%\'';
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_list WHERE delete_check = $1 AND client_cd ~* \'^[' + index_str[index_no] + ']\'';
	var sql = 'SELECT ' 
		+ 'client_cd,' 
		+ 'name_1,' 
		+ 'name_2,' 
		+ "compellation," // 敬称
		+ "kana," // カナ
		+ "email," // メールアドレス 
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "prepared_name," // 担当者氏名
		+ "prepared_compellation," // 担当者敬称
		+ "prepared_division," // 担当部署
		+ "prepared_title," // 担当者役職名
		+ "prepared_cellular," // 担当者携帯電話番号
		+ "prepared_email," // 担当者メールアドレス
		+ "prepared_telno," // 担当者電話番号
		+ "prepared_faxno," // 担当者FAX番号
		+ "to_char(billing_limit,'YYYY/MM/DD') AS billing_limit," // 請求締日
		+ "to_char(payment_date,'YYYY/MM/DD') AS payment_date," // 支払日
		+ "memo," 
		+ 'delete_check,' 
		+ "to_char(created,'YYYY/MM/DD HH24:MI:SS') AS created," 
		+ 'created_id,' 
		+ "to_char(updated,'YYYY/MM/DD HH24:MI:SS') AS updated," 
		+ 'updated_id' 
//		+ ' FROM drc_sch.client_list WHERE delete_check = $1 AND client_cd LIKE \'' + index_str[index_no] + '%\' ORDER BY ' 
		+ ' FROM drc_sch.client_list WHERE delete_check = $1 AND client_cd ~* \'^[' + index_str[index_no] + ']\' ORDER BY ' 
		+ pg_params.sidx + ' ' + pg_params.sord 
		+ ' LIMIT ' + pg_params.limit + ' OFFSET ' + pg_params.offset;
	return client_get_list_for_grid(res, sql_count, sql, [req.query.delete_check], pg_params);
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
	var sql_count = 'SELECT COUNT(*) AS cnt FROM drc_sch.client_list WHERE delete_check = $1';
	var sql = 'SELECT ' 
		+ 'client_cd,' 
		+ 'name_1,' 
		+ 'name_2,' 
		+ "compellation," // 敬称
		+ "kana," // カナ
		+ "email," // メールアドレス 
		+ "zipcode," // 郵便番号
		+ "address_1," // 住所１
		+ "address_2," // 住所２
		+ "tel_no," // 電話番号
		+ "fax_no," // FAX番号
		+ "prepared_name," // 担当者氏名
		+ "prepared_compellation," // 担当者敬称
		+ "prepared_division," // 担当部署
		+ "prepared_title," // 担当者役職名
		+ "prepared_cellular," // 担当者携帯電話番号
		+ "prepared_email," // 担当者メールアドレス
		+ "prepared_telno," // 担当者電話番号
		+ "prepared_faxno," // 担当者FAX番号
		+ "to_char(billing_limit,'YYYY/MM/DD') AS billing_limit," // 請求締日
		+ "to_char(payment_date,'YYYY/MM/DD') AS payment_date," // 支払日
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
		connection.query(sql, [req.params.uid], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				var user = [];
				for (var i in results.rows) {
					user = results.rows[i];
				}
				connection.end();
				res.send(user);
			}
		});
	});
};
