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
  $("#delete_check_disp").bind('change',sightMaster.dispDelete);
});

// 処理用オブジェクト
var sightMaster = sightMaster || {}

// 初期化処理
sightMaster.init = function() {
  $("#edit_sight").css("display","none");
  // グリッドのクリア
  sightMaster.reloadGrid();
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

sightMaster.dispDelete = function(event) {
  sightMaster.reloadGrid();
}
sightMaster.reloadGrid = function() {
  $("#sight_list").GridUnload();
  sightMaster.createGrid();

}

// マスタのリスト表示するグリッドの生成処理（全社）
sightMaster.createGrid = function() {
  var req_url = "/sight_master";
  if ($("#delete_check_disp").prop("checked")) {
    req_url += "?delete_check=1";
  } else {
    req_url += "?delete_check=0";
  }
  jQuery("#sight_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['id','表示名','支払日','支払月','メモ','削除フラグ','作成者','作成日','更新者','更新日'],
		colModel: [
      { name: 'sight_id', index: 'sight_id', width: 200, align: "center" },
      { name: 'disp_str', index: 'disp_str', width: 200, align: "center" },
      { name: 'shiharaibi', index: 'shiharaibi', width: 200, align: "center"},
      { name: 'shiharai_month', index: 'shiharai_month', width: 200, align: "center"},
      { name: 'memo', index: 'memo', width: 200, align: "center"},
      { name: 'delete_check', index: 'delete_check', hidden:true},
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
		sortname: 'sight_id',
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
  var sight = sightMaster.clear();
  var row = $("#sight_list").getRowData(rowid);
  $("#edit_sight").css("display","inline");
  sight.sight_id = row.id;
  sight.disp_str = row.disp_str;
  sight.shiharaibi = row.shiharaibi;
  sight.shiharai_month = row.shiharai_month;
  sight.memo = row.memo;
  sightMaster.setForm(sight);
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
		$("#sight_shiharaibi").append("<option value=" + i + ">" + i + "</option>");
	}
};
// 支払いサイト情報ダイアログの表示
sightMaster.openSightMasterDialog = function (event) {
	$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
	$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
  if ($(event.target).attr('id') == 'add_sight') {
    sightMaster.setForm(sightMaster.clear());
  }
	$("#sight_master_dialog").dialog("open");
};

sightMaster.setForm = function(sight) {
  $("#sight_id").val(sight.sight_id);
  $("#sight_disp_str").val(sight.disp_str);
  $("#sight_shiharaibi").val(sight.shiharaibi);
  $("#sight_shiharai_month").val(sight.shiharai_month);
  $("#sight_memo").val(sight.memo);
}
sightMaster.clear = function() {
  var sight = {sight_id:0,disp_str:"",shiharaibi:15,shiharai_month:1,memo:""};
  return sight;
}
sightMaster.save = function() {
  var url = "/sight_master_post";
	// フォームからデータを取得
	var form = new FormData(document.querySelector("#sightMasterForm"));
  if (!$("#delete_check").prop("checked") ){
    form.append("delete_check", '0');
  }
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.responseType = 'json';
	xhr.onload = sightMaster.onSaveMaster;
	xhr.send(form);
  return true;
}

sightMaster.onSaveMaster = function(event) {
  if (this.status == 200) {
		// success
    sightMaster.reloadGrid();
	}
}
