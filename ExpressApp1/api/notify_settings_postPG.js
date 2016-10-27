//
// メール通知設定の保存
//
var tools = require('../tools/tool');
var notify = models['notify_settings'];
// 保存
exports.notify_settings_post = function(req, res) {
  notifySettings.save(req, res);
}

var notifySettings = notifySettings || {}

notifySettings.save = function(req, res) {
  var notify_id = req.body.notify_id;
  if (notify_id === "")
    notify_id = 0;
  else
    notify_id = Number(notify_id);
  var attr = {where:{notify_id:notify_id}};
  // 検索
  notify.schema('drc_sch').find(attr).then(function(setting){
    if (setting) {
      // 更新
      attr = {event_name_1:req.body.event_name_1,send_address_1:req.body.send_address_1,mail_title_1:req.body.mail_title_1,mail_body_1:req.body.mail_body_1,
        event_name_2:req.body.event_name_2,send_address_2:req.body.send_address_2,mail_title_2:req.body.mail_title_2,mail_body_2:req.body.mail_body_2,
        smtp_server:req.body.smtp_server,smtp_port:req.body.smtp_port,userid:req.body.userid,password:req.body.password};
      notify.schema('drc_sch').update(attr,{where:{notify_id:notify_id}}).then(function(result) {
        res.send(attr);
      }).catch(function(error){
        console.log(error);
        res.send(attr);
      });

    } else {
      // 新規登録
      attr = {event_name_1:req.body.event_name_1,send_address_1:req.body.send_address_1,mail_title_1:req.body.mail_title_1,mail_body_1:req.body.mail_body_1,
        event_name_2:req.body.event_name_2,send_address_2:req.body.send_address_2,mail_title_2:req.body.mail_title_2,mail_body_2:req.body.mail_body_2,
        smtp_server:req.body.smtp_server,smtp_port:req.body.smtp_port,userid:req.body.userid,password:req.body.password};
      var si = notify.schema('drc_sch').build(attr);
      si.save().then(function(result) {
        res.send(attr);
      }).catch(function(error){
        console.log(error);
        res.send(attr);
      });
    }
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
