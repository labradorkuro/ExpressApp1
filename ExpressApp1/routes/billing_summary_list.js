
exports.billing_summary_list = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('billing_summary_list', { title: '請求情報集計'  , userid: req.session.uid , name: req.session.name });
        //res.send("respond with a resource");
    }
};

// 印刷
exports.billing_summary_list_print = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('billing_summary_list_print', { title: '請求情報集計'  ,　userid: req.session.uid , name: req.session.name });
        //res.send("respond with a resource");
    }
};
