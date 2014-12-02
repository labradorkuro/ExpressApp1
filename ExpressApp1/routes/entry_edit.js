// 案件情報の登録・編集画面を表示する
// paramで取得するnoは案件No（案件Noがある時は編集、ない時は追加）
exports.list = function(req, res){
    res.render('entry_edit', { title: 'DRC 案件情報' ,no:req.param('no')});
    //res.send("respond with a resource");
};
