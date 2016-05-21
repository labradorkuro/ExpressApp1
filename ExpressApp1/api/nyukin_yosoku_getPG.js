var tools = require('../tools/tool');

//
// 入金予測集計
//

var nyukin_yosoku = nyukin_yosoku || {};

// 集計検索処理エントリーポイント
exports.summary = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = tools.getPagingParams(req);
  // 検索集計処理
  nyukin_yosoku.getNyukinYosokuSummary(req, res, pg_params);
}
exports.list = function(req, res) {
  // グリッドのページング用パラメータの取得
  var pg_params = tools.getPagingParams(req);
  // 案件リスト検索処理
  nyukin_yosoku.getNyukinYosokuList(req, res, pg_params);
}

// 入金予測日を取得する
nyukin_yosoku.getNyukinYosokuDate = function(baseDate, sight_info) {
  // 基準日と請求先の支払いサイト情報から入金予測日を決める
};

// 入金予測集計処理
nyukin_yosoku.getNyukinYosokuSummary = function(req,res,pg_params) {
  var func = req.query.func;
  if (func == 1) {
    // 受注情報から予測する
  } else if (func == 2) {
    // 請求情報から予測する
  }
}
