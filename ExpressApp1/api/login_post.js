//
// ユーザログイン
//
var tools = require('../tools/tool');

exports.login_post = function (req, res) {
	var auth = 'f01:0,f02:0,f03:2,f04:0,f05:0,f06:0,f07:0,f08:0,f09:0,f10:0,f11:1,f12:1,f13:2';	// 最低権限で初期化
	var uid = req.body.uid;
	var pass = req.body.passwd;
	
	if ((uid === "drc_admin") && (pass === "schedule")) {
		req.session.login = true;
		req.session.uid = uid;
		req.session.name = "管理者";
		auth = 'f01:2,f02:2,f03:2,f04:2,f05:2,f06:2,f07:2,f08:2,f09:2,f10:2,f11:2,f12:2,f13:2';	// 最低権限で初期化
		res.cookie('userid', uid,{maxAge:1000 * 3600 * 24});
		res.cookie('user_auth', auth,{maxAge:1000 * 3600 * 24});
		res.render('portal', { title: 'DRC試験スケジュール管理' , userid: uid , name: "管理者" });
		saveInfo(1,req.session.uid,req.session.name,JSON.stringify(req.headers['user-agent']));
		return;
	}
	var sql = "SELECT uid,name,auth_no FROM drc_sch.user_list WHERE uid = $1 AND password = $2 AND delete_check = 0";
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		connection.query(sql, [uid,pass], function (err, results) {
			if (err) {
				console.log(err);
				connection.end();
			} else {
				//connection.end();
				if (results.rows.length == 1) {
					req.session.login = true;
					req.session.uid = results.rows[0].uid;
					req.session.name = results.rows[0].name;
					// ユーザ権限
					sql = "SELECT code,auth_value FROM drc_sch.auth_settings WHERE auth_no = $1 ORDER BY code";
					// SQL実行
					connection.query(sql, [results.rows[0].auth_no], function (err, results) {
						if (err) {
						} else {
							auth = "";
							for(var i in results.rows) {
								if (i > 0) {
									auth += ",";
								}
								auth += results.rows[i].code + ":" + results.rows[i].auth_value;
							}
							connection.end();
							res.cookie('userid', uid,{maxAge:1000 * 3600 * 24});
							res.cookie('user_auth', auth,{maxAge:1000 * 3600 * 24});
							res.render('portal', { title: 'DRC試験スケジュール管理' , userid: req.session.uid ,name:req.session.name});
							saveInfo(1,req.session.uid,req.session.name,JSON.stringify(req.headers['user-agent']));
						}
					});
				} else {
					connection.end();
					req.session.login = false;
					var msg = 'ユーザ名またはパスワードが違います。';
					res.render('index', { title: 'DRC試験スケジュール管理', msg: msg });
				}
			}
		});
	});
};

exports.logout_post = function (req, res) {
	saveInfo(2,req.session.uid,req.session.name,JSON.stringify(req.headers['user-agent']));
	req.session.destroy();
	var msg = 'ログインしてください。';
	res.render('index', { title: 'DRC試験スケジュール管理', msg: msg });

};

// ログイン情報を保存する
var saveInfo = function(kind,uid,name,agent) {
	var created = tools.getTimestamp("{0}/{1}/{2} {3}:{4}:{5}");
	var sql = "INSERT INTO drc_sch.login_status(uid,name,kind,agent,created) values ($1,$2,$3,$4,$5);"
	pg.connect(connectionString, function (err, connection) {
		// SQL実行
		connection.query(sql, [uid,name,kind,agent,created], function (err, results) {
			if (err) {
				console.log(err);
			} else {
			}
			connection.end();
		});
	});
};
