
exports.list = function(req, res){
    res.render('nyukin_yosoku_list', { title: '入金予測'  , userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};

// 印刷
exports.list_print_all = function(req, res){
    res.render('nyukin_list_print_all', { title: '入金予測'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
exports.list_print_division = function(req, res){
    res.render('nyukin_list_print_division', { title: '入金予測'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
exports.list_print_client = function(req, res){
    res.render('nyukin_list_print_client', { title: '入金予測'  ,　userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
