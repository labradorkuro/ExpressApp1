//
// 支払日マスタ画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  sightMaster.init();
  // 権限チェック
  sightMaster.checkAuth();
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
});

// 処理用オブジェクト
var sightMaster = sightMaster || {}

// 初期化処理
sightMaster.init = function() {
  // グリッドのクリア
  $("#sight_list").GridUnload();
  sightMaster.createGrid();
}

// 権限チェック
sightMaster.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};
// マスタのリスト表示するグリッドの生成処理（全社）
sightMaster.createGrid = function() {
  var req_url = "/sight_master";
	jQuery("#sight_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['id','表示名','支払日','支払月','メモ','削除フラグ','作成者','作成日','更新者','更新日'],
		colModel: [
      { name: 'id', index: 'id', width: 200, align: "center" },
      { name: 'disp_str', index: 'disp_str', width: 200, align: "center" },
      { name: 'shiharaibi', index: 'shiharaibi', width: 200, align: "center"},
      { name: 'shiharai_month', index: 'shiharai_month', width: 200, align: "center"},
      { name: 'memo', index: 'memo', width: 200, align: "center"},
      { name: 'delete_check', index: 'delete_check', width: 200, align: "center"},
      { name: 'create_id', index: 'create_id', width: 200, align: "center"},
      { name: 'createdAt', index: 'createdAt', width: 200, align: "center"},
      { name: 'update_id', index: 'updated_id', width: 200, align: "center"},
      { name: 'updatedAt', index: 'updatedAt', width: 200, align: "center"}
		],
		height:240,
		width:960,
		shrinkToFit:true,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#sight_list_pager',
		sortname: 'id',
		viewrecords: true,
		sortorder: "asc",
		caption: "支払日マスタ",
		onSelectRow:sightMaster.onSelectRow,
    loadComplete:sightMaster.loadComplete
	});
	jQuery("#sight_list").jqGrid('navGrid', '#sight_list_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();

};

sightMaster.onSelectRow = function(rowid) {

}

sightMaster.loadComplete = function(event) {

}
