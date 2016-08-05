
exports.list = function(req, res){
    res.render('holiday_master_list', { title: '休日マスタ'  , userid: req.session.uid , name: req.session.name });
};
