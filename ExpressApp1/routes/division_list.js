
/*
 * GET users listing.
 */

exports.list = function (req, res) {
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理', msg: msg });
	} else {
		res.render('division_list', { title: 'DRC 試験スケジュール管理'   , userid: req.session.uid , name: req.session.name });
	}
};