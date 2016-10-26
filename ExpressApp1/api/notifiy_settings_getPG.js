//
// メール通知設定の保存
//
var tools = require('../tools/tool');
var notifiy = models['notifiy_settings'];

exports.notifiy_settings_get = function(req, res) {
//  if (req.query.notifiy_id) {
    notifiySettings.findAll(req,res);
//  }
}

var notifiySettings = notifiySettings || {}


// 指定されたidのデータを取得する
notifiySettings.findAll = function(req,res) {
  var id = req.params.id;
  var attr = {where:{notifiy_id:id}};
  notifiy.schema('drc_sch').findAll(attr).then(function(setting){
    res.send(setting);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
