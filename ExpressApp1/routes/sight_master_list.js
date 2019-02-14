
exports.list = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('sight_master_list', { title: '支払日マスタ'  , userid: req.session.uid , name: req.session.name });
    }
};
