
exports.list = function(req, res){
    res.render('uriage_list', { title: '売上集計'  , userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};

// 印刷
exports.list_print_all = function(req, res){
    res.render('uriage_list_print_all', { title: '売上集計'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
exports.list_print_division = function(req, res){
    res.render('uriage_list_print_division', { title: '売上集計'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
exports.list_print_client = function(req, res){
    res.render('uriage_list_print_client', { title: '売上集計'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
