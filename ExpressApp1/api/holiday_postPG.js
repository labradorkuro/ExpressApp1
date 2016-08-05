//
// 休日マスタの保存
//
var tools = require('../tools/tool');
var holiday = models['holiday'];

exports.holiday_post = function(req, res) {
  holiday_master.save(req, res);
}

var holiday_master = holiday_master || {}

// 休日マスタの保存処理（追加、更新）
holiday_master.save = function(req, res) {
  var attr = {where:{holiday_id:req.body.holiday_id}};
  // 検索
  holiday.schema('drc_sch').find(attr).then(function(data){
    if (data) {
      // 更新
      attr = {start_date:req.body.start_date,end_date:req.body.end_date,
        holiday_name:req.body.holiday_name,holiday_memo:req.body.holiday_memo,delete_check:req.body.delete_check};
      holiday.schema('drc_sch').update(attr,{where:{holiday_id:req.body.holiday_id}}).then(function(result) {
        res.send(attr);
      }).catch(function(error){
        console.log(error);
        res.send(attr);
      });

    } else {
      // 新規登録
      attr = {start_date:req.body.start_date,end_date:req.body.end_date,
        holiday_name:req.body.holiday_name,holiday_memo:req.body.holiday_memo,delete_check:req.body.delete_check};
      var si = holiday.schema('drc_sch').build(attr);
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
