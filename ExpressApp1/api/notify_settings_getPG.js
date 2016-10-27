//
// メール通知設定の保存
//
var tools = require('../tools/tool');
var notify = models['notify_settings'];

exports.notify_settings_get = function(req, res) {
//  if (req.query.notify_id) {
    notifySettings.find(req,res);
//  }
}

var notifySettings = notifySettings || {}


// 指定されたidのデータを取得する
notifySettings.find = function(req,res) {
  var id = req.params.id;
  var attr = {where:{notify_id:id}};
  notify.schema('drc_sch').findAll(attr).then(function(setting){
    res.send(setting);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
