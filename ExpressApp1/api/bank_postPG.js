//
// 振込口座マスタの保存
//
var tools = require('../tools/tool');
var bank_info = models['bank_info'];

// 振込口座マスタの保存
exports.bank_info_post = function(req, res) {
  bankInfo.save(req, res);
}

var bankInfo = bankInfo || {}

// 振込口座マスタの保存処理（追加、更新）
bankInfo.save = function(req, res) {
  var attr = {where:{id:req.body.id}};
  // 検索
  bank_info.schema('drc_sch').find(attr).then(function(bank){
    if (bank) {
      // 更新
      attr = {id:req.body.id,bank_name:req.body.bank_name,branch_name:req.body.branch_name, kouza_kind:req.body.kouza_kind,kouza_no:req.body.kouza_no,meigi_name:req.body.meigi_name,memo:req.body.memo,delete_check:req.body.delete_check};
      bank_info.schema('drc_sch').update(attr,{where:{id:req.body.id}}).then(function(result) {
        res.send(attr);
      }).catch(function(error){
        console.log(error);
        res.send(attr);
      });

    } else {
      // 新規登録
      attr = {bank_name:req.body.bank_name, branch_name:req.body.branch_name,kouza_kind:req.body.kouza_kind,kouza_no:req.body.kouza_no,meigi_name:req.body.meigi_name,memo:req.body.memo,delete_check:req.body.delete_check};
      var si = bank_info.schema('drc_sch').build(attr);
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
