
/*
 * 顧客マスタ管理画面
 */

exports.list = function (req, res) {
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理', msg: msg });
	} else {
		res.render('client_list', { title: 'DRC 試験スケジュール管理' ,func_name: '顧客管理' ,target_name:'得意先' , userid: req.session.uid , name: req.session.name });
	}
};

exports.list_print = function(req, res) {
	res.render('client_list_print', { title: 'DRC 試験スケジュール管理' ,func_name: '顧客管理' ,target_name:'得意先' , userid: req.session.uid , name: req.session.name,no:req.query.no });

}
