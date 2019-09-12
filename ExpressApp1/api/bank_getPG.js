//
// 振込口座マスタの検索
//
var tools = require('../tools/tool');
var bank_info = models['bank_info'];

// 振込口座マスタの検索
exports.bank_info = function(req, res) {
  if (req.query.list == 'all') {
    // 全件取得
    bankInfo.list_all(req, res);
  } else {
    // ページング（グリッド）用リスト取得
    bankInfo.list_grid(req, res);
  }
}
exports.bank_find = function(req,res) {
  bankInfo.find(req.query.bank_id,res);
}
// デフォルト設定の取得
exports.defalut_get = function(req,res) {
  bankInfo.defalut_get(req,res);
}
var bankInfo = bankInfo || {}


// 指定されたidのデータを取得する
bankInfo.find = function(id,res) {
  bank_info.schema('drc_sch').findById(id).then(function(bank){
    res.send(bank);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}


// defultのデータを取得する
bankInfo.defalut_get = function(req,res) {
  var attr = {where:{memo:'既定',delete_check:0}};
  bank_info.schema('drc_sch').find(attr).then(function(bank){
    res.send(bank);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}

// グリッド用リスト取得
bankInfo.list_grid = function(req, res) {
  var result = { page: 1, total: 1, records: 0, rows: [] };
  var pg_params = tools.getPagingParams(req);
  var attr_count = {attributes:[sequelize.fn('count',sequelize.col('id'))],where:{delete_check:req.query.delete_check}};
  var attr = {attributes:['id','bank_name','branch_name','kouza_kind','kouza_no','meigi_name','memo','delete_check','created_id','updated_id'],where:{delete_check:req.query.delete_check}};
  bank_info.schema('drc_sch').count(attr_count).then(function(count) {
    // 取得した件数からページ数を計算する
    if (count) {
      result.total = Math.ceil(count / pg_params.limit);
    }
    result.page = pg_params.page;
    attr.order = pg_params.sidx + " " + pg_params.sord;
    attr.limit = pg_params.limit;
    attr.offset = pg_params.offset;
    bank_info.schema('drc_sch').findAll(attr).then(function(bank){
      for(var i in bank) {
        var row = { id: '', cell: [] };
        row.id = bank[i].id;
        row.cell = bank[i];
        result.rows.push(row);
      }
      result.records = bank.length;
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

// 全件リスト取得
bankInfo.list_all = function(req, res) {
  var attr = {where:{delete_check:0}};
  sight_date.schema('drc_sch').findAll(attr).then(function(bank){
    res.send(bank);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}
