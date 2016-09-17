
exports.list = function(req, res){
    res.render('uriage_list', { title: '売上集計'  , userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};

// 印刷
exports.list_print = function(req, res){
    res.render('uriage_list_print_all', { title: '売上集計'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
