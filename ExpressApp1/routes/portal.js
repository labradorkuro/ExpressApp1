//
// Portal
//
exports.portal = function(req, res){
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理', msg: msg });
	} else {
		res.render('portal', { title: 'DRC試験スケジュール管理' });
	}
};
