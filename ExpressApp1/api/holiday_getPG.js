//
// 休日マスタの検索
//
var tools = require('../tools/tool');
var holiday = models['holiday'];

exports.holiday_get = function(req, res) {
  if (req.query.id) {
    holiday_master.find(req.query.id, res);
  } else {
    if (req.query.list == 'all') {
      // 全件取得
      holiday_master.list_all(req, res);
    } else {
      // ページング（グリッド）用リスト取得
      holiday_master.list_grid(req, res);
    }
  }
}
// 指定された日を含む休日データを検索する
exports.holiday_search = function(req, res) {
  holiday_master.holiday_search(req, res);
}

var holiday_master = holiday_master || {}


// 指定されたidのデータを取得する
holiday_master.find = function(id,res) {
  holiday.schema('drc_sch').findById(id).then(function(sight){
    res.send(sight);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
// 全件リスト取得
holiday_master.list_all = function(req, res) {
  var attr = {where:{delete_check:0}};
  holiday.schema('drc_sch').findAll(attr).then(function(hi){
    res.send(hi);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
// 指定された日を含む休日データを検索する
holiday_master.holiday_search = function(req, res) {
  var attr = {where:{start_date:{$lt:req.query.target_date},end_date:{$gt:req.query.target_date},delete_check:0}};
  holiday.schema('drc_sch').findAll(attr).then(function(hi){
    res.send(hi);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}

// グリッド用リスト取得
holiday_master.list_grid = function(req, res) {
  var result = { page: 1, total: 1, records: 0, rows: [] };
  var pg_params = tools.getPagingParams(req);
  var attr_count = {attributes:[sequelize.fn('count',sequelize.col('holiday_id'))],where:{delete_check:req.query.delete_check}};
  var attr = {attributes:['holiday_id',
  [sequelize.fn('to_char', sequelize.col('start_date'), 'YYYY/MM/DD'), 'start_date'],
  [sequelize.fn('to_char', sequelize.col('end_date'),   'YYYY/MM/DD'), 'end_date'],
  'holiday_name','holiday_memo','delete_check','create_id','update_id'],where:{delete_check:req.query.delete_check}};
  holiday.schema('drc_sch').findAll(attr_count).then(function(count) {
    // 取得した件数からページ数を計算する
    if (count) {
      result.total = Math.ceil(count / pg_params.limit);
    }
    result.page = pg_params.page;
    attr.order = pg_params.sidx + " " + pg_params.sord;
    attr.limit = pg_params.limit;
    attr.offset = pg_params.offset;
    holiday.schema('drc_sch').findAll(attr).then(function(hi){
      for(var i in hi) {
        var row = { id: '', cell: [] };
        row.id = hi[i].holiday_id;
        row.cell = hi[i];
        result.rows.push(row);
      }
      result.records = hi.length;
      res.send(result);
    }).catch(function(error){
      console.log(error);
      res.send("");
    });
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
