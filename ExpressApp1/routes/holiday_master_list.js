
exports.list = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('holiday_master_list', { title: '休日マスタ'  , userid: req.session.uid , name: req.session.name });
    }
};
