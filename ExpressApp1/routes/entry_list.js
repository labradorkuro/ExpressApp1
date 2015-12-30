
exports.list = function(req, res){
    res.render('entry_list', { title: 'DRC 案件リスト'  , userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
