//
// User Login
//
exports.login = function (req, res){
	title = 'DRC試験スケジュール管理' + drc_version;
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: title, msg: msg });
	} else {
		res.render('portal', { title: title });
	}
};