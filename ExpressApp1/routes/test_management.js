


exports.list = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('test_management', { title: 'DRC 試験情報管理' });
        //res.send("respond with a resource");
    }
};
