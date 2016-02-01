
/*
 * 委託先マスタ管理画面（顧客マスタと共用）
 */

exports.list = function (req, res) {
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理', msg: msg });
	} else {
		res.render('client_list', { title: 'DRC 試験スケジュール管理' ,func_name: '委託先管理' ,target_name:'委託先' , userid: req.session.uid , name: req.session.name });
	}
};
