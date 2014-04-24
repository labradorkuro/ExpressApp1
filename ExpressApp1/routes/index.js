
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'DRC試験スケジュール管理' });
};