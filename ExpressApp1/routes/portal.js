//
// Portal
//
exports.portal = function(req, res){
	title = 'DRC試験スケジュール管理' + drc_version;
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: title, msg: msg });
	} else {
		res.render('portal', { title: title,userid:req.session.uid, name:req.session.name});
	}
};
