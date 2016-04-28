//
// 支払サイト情報、支払日マスタの保存
//
var tools = require('../tools/tool');
var sight_date = models['sight_date'];
var sight_info = models['sight_info'];
// 支払日マスタの保存
exports.sight_master_post = function(req, res) {
}
// 支払サイト情報の保存
exports.sight_info_post = function(req, res) {
  sightInfo.save(req, res);
}

var sightDate = sightDate || {}
var sightInfo = sightInfo || {}

// 支払いサイト情報の保存処理（追加、更新）
sightInfo.save = function(req, res) {
  var attr = {where:{client_cd:req.body.sight_client_cd,delete_check:0}};
  // 検索
  sight_info.schema('drc_sch').find(attr).then(function(sight){
    if (sight) {
      // 更新
      attr = {client_cd:req.body.sight_client_cd,shimebi:req.body.shimebi, sight_id:req.body.sight_id,delete_check:0};
      sight_info.schema('drc_sch').update(attr,{where:{client_cd:req.body.sight_client_cd}}).then(function(result) {
        res.send(attr);
      }).catch(function(error){
        console.log(error);
        res.send(attr);
      });

    } else {
      // 新規登録
      attr = {client_cd:req.body.sight_client_cd,shimebi:req.body.shimebi, sight_id:req.body.sight_id,delete_check:0};
      var si = sight_info.schema('drc_sch').build(attr);
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
