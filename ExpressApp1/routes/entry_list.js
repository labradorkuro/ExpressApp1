// 案件リスト(画面)﻿
exports.list = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('entry_list', { title: 'DRC 案件リスト'  ,func_name: '顧客管理' ,target_name:'得意先', userid: req.session.uid , name: req.session.name });
	}
};

// 案件リスト(印刷）
exports.list_print = function(req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
        res.render('entry_list_print', { title: 'DRC 案件リスト'  ,func_name: '顧客管理' ,target_name:'得意先', userid: req.session.uid , name: req.session.name });
	}
};
