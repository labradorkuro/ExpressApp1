
exports.list = function(req, res){
    res.render('sight_master_list', { title: '支払日マスタ'  , userid: req.session.uid , name: req.session.name });
};
