
exports.list = function(req, res){
    res.render('uriage_list', { title: '売上集計'  , userid: req.session.uid , name: req.session.name });
    //res.send("respond with a resource");
};
