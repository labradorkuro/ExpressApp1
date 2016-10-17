// 案件リスト(画面)﻿
exports.list = function(req, res){
    res.render('entry_list', { title: 'DRC 案件リスト'  ,func_name: '顧客管理' ,target_name:'得意先', userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};

// 案件リスト(印刷）
exports.list_print = function(req, res){
    res.render('entry_list_print', { title: 'DRC 案件リスト'  ,func_name: '顧客管理' ,target_name:'得意先', userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
