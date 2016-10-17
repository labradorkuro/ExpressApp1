//
// 支払サイト情報、支払日マスタの検索
//
var tools = require('../tools/tool');
var sight_date = models['sight_date'];
var sight_info = models['sight_info'];
//sight_date.belongsTo(sight_info,{foreignKey: 'id',targetKey:'sight_id'});
//sight_date.hasOne(sight_info,{foreignKey: 'sight_id'});

// 支払日マスタの検索
exports.sight_master = function(req, res) {
  if (req.query.id) {
    sightDate.find(req.query.id, res);
  } else {
    if (req.query.list == 'all') {
      // 全件取得
      sightDate.list_all(req, res);
    } else {
      // ページング（グリッド）用リスト取得
      sightDate.list_grid(req, res);
    }
  }
}
// 支払サイト情報の検索
exports.sight_info = function(req, res) {
  if (req.query.client_cd) {
    sightInfo.find(req.query.client_cd, res);
  }
}

var sightDate = sightDate || {}
var sightInfo = sightInfo || {}


// 指定されたidのデータを取得する
sightDate.find = function(id,res) {
  sight_date.schema('drc_sch').findById(id).then(function(sight){
    res.send(sight);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}

// グリッド用リスト取得
sightDate.list_grid = function(req, res) {
  var result = { page: 1, total: 1, records: 0, rows: [] };
  var pg_params = tools.getPagingParams(req);
  var attr = {attributes:['sight_id','disp_str','shiharaibi','shiharai_month','memo','delete_check','create_id','update_id'],where:{delete_check:req.query.delete_check}};
  sight_date.schema('drc_sch').count(attr).then(function(count) {
    // 取得した件数からページ数を計算する
    if (count) {
      result.total = Math.ceil(count / pg_params.limit);
    }
    result.page = pg_params.page;
    attr.order = pg_params.sidx + " " + pg_params.sord;
    attr.limit = pg_params.limit;
    attr.offset = pg_params.offset;
    sight_date.schema('drc_sch').findAll(attr).then(function(sight){
      for(var i in sight) {
        var row = { id: '', cell: [] };
        row.id = sight[i].sight_id;
        row.cell = sight[i];
        result.rows.push(row);
      }
      result.records = sight.length;
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
sightDate.list_all = function(req, res) {
  var attr = {where:{delete_check:0}};
  sight_date.schema('drc_sch').findAll(attr).then(function(sight){
    res.send(sight);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}

// 支払いサイト情報の検索
sightInfo.find = function(client_cd, res) {
  var attr = {where:{client_cd:client_cd,delete_check:0},include:[{model:models.sight_date}]};
  sight_info.schema('drc_sch').find(attr).then(function(sight){
    res.send(sight);
  }).catch(function(error){
    console.log(error);
    res.send("");
  });
}