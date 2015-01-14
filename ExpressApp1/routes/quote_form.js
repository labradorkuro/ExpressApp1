// 案件情報の登録・編集画面を表示する
// paramで取得するnoは案件No
exports.form = function (req, res) {
	res.render('quote_form', { title: '見積書' , entry_no: req.param('enrty_no'), quote_no: req.param('quote_no') });
    //res.send("respond with a resource");
};
