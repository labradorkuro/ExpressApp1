//
// 休日マスタ画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  $("#tabs").tabs();
  holidayMaster.init();
  // 権限チェック
  holidayMaster.checkAuth();
	// 日付選択用設定
  $.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
  $("#delete_check_disp").bind('change',holidayMaster.dispDelete);
});

// 処理用オブジェクト
var holidayMaster = holidayMaster || {}

// 初期化処理
holidayMaster.init = function() {
  $("#edit_holiday").css("display","none");
  // グリッドのクリア
  holidayMaster.reloadGrid();
  holidayMaster.createHolidayMasterDialog();
  $("#add_holiday").bind('click',holidayMaster.openHolidayMasterDialog);
  $("#edit_holiday").bind('click',holidayMaster.openHolidayMasterDialog);
}

// 権限チェック
holidayMaster.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};

holidayMaster.dispDelete = function(event) {
  holidayMaster.reloadGrid();
}
holidayMaster.reloadGrid = function() {
  $("#holiday_list").GridUnload();
  holidayMaster.createGrid();

}

// マスタのリスト表示するグリッドの生成処理（全社）
holidayMaster.createGrid = function() {
  var req_url = "/holiday_get";
  if ($("#delete_check_disp").prop("checked")) {
    req_url += "?delete_check=1";
  } else {
    req_url += "?delete_check=0";
  }
  jQuery("#holiday_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['id','名称','開始日付','終了日付','メモ','削除フラグ','作成者','作成日','更新者','更新日'],
		colModel: [
      { name: 'holiday_id', index: 'holiday_id', width: 200, align: "center" },
      { name: 'holiday_name', index: 'holiday_name', width: 200, align: "center"},
      { name: 'start_date', index: 'start_date', width: 200, align: "center" },
      { name: 'end_date', index: 'end_date', width: 200, align: "center"},
      { name: 'holiday_memo', index: 'holiday_memo', width: 200, align: "center"},
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
		pager: '#holiday_list_pager',
		sortname: 'start_date',
		viewrecords: true,
		sortorder: "asc",
		caption: "休日マスタ",
		onSelectRow:holidayMaster.onSelectRow,
    loadComplete:holidayMaster.loadComplete
	});
	jQuery("#holiday_list").jqGrid('navGrid', '#holiday_list_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();

};

holidayMaster.onSelectRow = function(rowid) {
  var holiday = holidayMaster.clear();
  var row = $("#holiday_list").getRowData(rowid);
  $("#edit_holiday").css("display","inline");
  holiday.holiday_id = row.holiday_id;
  holiday.holiday_name = row.holiday_name;
  holiday.start_date = row.start_date;
  holiday.end_date = row.end_date;
  holiday.holiday_memo = row.holiday_memo;
  holidayMaster.setForm(holiday);
}

holidayMaster.loadComplete = function(event) {
}

holidayMaster.createHolidayMasterDialog = function () {
	$('#holiday_master_dialog').dialog({
		autoOpen: false,
		width: 600,
		height: 300,
		title: '休日マスタ',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (holidayMaster.save()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (holidayMaster.save()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
				scheduleCommon.changeFontSize();
			}
		}
	});
};
// ダイアログの表示
holidayMaster.openHolidayMasterDialog = function (event) {
	$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
	$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
  if ($(event.target).attr('id') == 'add_holiday') {
    holidayMaster.setForm(holidayMaster.clear());
  }
	$("#holiday_master_dialog").dialog("open");
};

holidayMaster.setForm = function(holiday) {
  $("#holiday_id").val(holiday.holiday_id);
  $("#holiday_name").val(holiday.holiday_name);
  $("#start_date").val(holiday.start_date);
  $("#end_date").val(holiday.end_date);
  $("#holiday_memo").val(holiday.holiday_memo);
}
holidayMaster.clear = function() {
  var holiday = {holiday_id:0,holiday_name:"",start_date:"",end_date:"",holiday_memo:""};
  return holiday;
}
holidayMaster.save = function() {
  var url = "/holiday_post";
	// フォームからデータを取得
	var form = new FormData(document.querySelector("#holidayMasterForm"));
  if (!$("#delete_check").prop("checked") ){
    form.append("delete_check", '0');
  }
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.responseType = 'json';
	xhr.onload = holidayMaster.onSaveMaster;
	xhr.send(form);
  return true;
}

holidayMaster.onSaveMaster = function(event) {
  if (this.status == 200) {
		// success
    holidayMaster.reloadGrid();
	}
}
