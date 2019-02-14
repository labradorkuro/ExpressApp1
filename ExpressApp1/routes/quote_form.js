// 案件情報の登録・編集画面を表示する
// paramで取得するnoは案件No
exports.form = function (req, res) {
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
		res.render('quote_form', { title: '見積書' , entry_no: req.param('enrty_no'), quote_no: req.param('quote_no') });
		//res.send("respond with a resource");
	}
};
