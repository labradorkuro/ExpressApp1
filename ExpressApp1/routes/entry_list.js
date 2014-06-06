
exports.list = function(req, res){
    res.render('entry_list', { title: 'DRC 案件リスト' });
    //res.send("respond with a resource");
};
