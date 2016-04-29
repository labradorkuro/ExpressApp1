//
// 支払日マスタ画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  $("#tabs").tabs();
  sightMaster.init();
  // 権限チェック
  sightMaster.checkAuth();
	// 日付選択用設定
  $.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
});

// 処理用オブジェクト
var sightMaster = sightMaster || {}

// 初期化処理
sightMaster.init = function() {
  $("#edit_sight").css("display","none");
  // グリッドのクリア
  $("#sight_list").GridUnload();
  sightMaster.createGrid();
  sightMaster.createSightMasterDialog();
  $("#add_sight").bind('click',sightMaster.openSightMasterDialog);
  $("#edit_sight").bind('click',sightMaster.openSightMasterDialog);
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
      { name: 'create_id', index: 'create_id', hidden:true},
      { name: 'createdAt', index: 'createdAt', hidden:true},
      { name: 'update_id', index: 'updated_id', hidden:true},
      { name: 'updatedAt', index: 'updatedAt', hidden:true}
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
  var row = $("#sight_list").getRowData(rowid);
  $("#edit_sight").css("display","inline");
  $("#disp_str").val(row.disp_str);
  $("#shiharaibi").val(row.shiharaibi);
  $("#shiharai_month").val(row.shiharai_month);
}

sightMaster.loadComplete = function(event) {
}

sightMaster.createSightMasterDialog = function () {
	$('#sight_master_dialog').dialog({
		autoOpen: false,
		width: 350,
		height: 300,
		title: '支払い日マスタ',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (sightMaster.save()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (sightMaster.save()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
				scheduleCommon.changeFontSize();
			}
		}
	});
	// 締日リスト生成
	for(var i = 1;i <= 31;i++) {
		$("#shiharaibi").append("<option value=" + i + ">" + i + "</option>");
	}
};
// 支払いサイト情報ダイアログの表示
sightMaster.openSightMasterDialog = function (event) {
	$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
	$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	$("#sight_master_dialog").dialog("open");
};

sightMaster.save = function() {
  return true;
}
