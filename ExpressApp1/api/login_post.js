//
// ユーザログイン
//
exports.login_post = function (req, res) {
	var uid = req.body.uid;
	var pass = req.body.passwd;
	
	if ((uid === "drc_admin") && (pass === "schedule")) {
		req.session.login = true;
		req.session.uid = uid;
		req.session.name = "管理者";
		res.render('portal', { title: 'DRC試験スケジュール管理' , userid: uid , name: "管理者" });
		return;
	}
	var sql = "SELECT uid,name FROM drc_sch.user_list WHERE uid = $1 AND password = $2";
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		connection.query(sql, [uid,pass], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				connection.end();
				if (results.rows.length == 1) {
					req.session.login = true;
					req.session.uid = results.rows[0].uid;
					req.session.name = results.rows[0].name;
					res.render('portal', { title: 'DRC試験スケジュール管理' , userid: results.rows[0].uid ,name:results.rows[0].name});
				} else {
					req.session.login = false;
					res.render('index', { title: 'DRC試験スケジュール管理' });
				}
			}
		});
	});
};

