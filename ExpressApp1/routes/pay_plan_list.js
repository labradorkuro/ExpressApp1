
exports.list = function(req, res){
    res.render('nyukin_yosoku_list', { title: '入金予測'  , userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
