//
// 振り込み口座マスタ画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  $("#tabs").tabs();
  bankMaster.init();
  // 権限チェック
  bankMaster.checkAuth();
	// 日付選択用設定
  $.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
  $("#delete_check_disp").bind('change',bankMaster.dispDelete);
});

// 処理用オブジェクト
var bankMaster = bankMaster || {}

// 初期化処理
bankMaster.init = function() {
  $("#edit_bank").css("display","none");
  // グリッドのクリア
  bankMaster.reloadGrid();
  bankMaster.createBankMasterDialog();
  $("#add_bank").bind('click',bankMaster.openBankMasterDialog);
  $("#edit_bank").bind('click',bankMaster.openBankMasterDialog);
}

// 権限チェック
bankMaster.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};

bankMaster.dispDelete = function(event) {
  bankMaster.reloadGrid();
}
bankMaster.reloadGrid = function() {
  $("#bank_list").GridUnload();
  bankMaster.createGrid();

}

// マスタのリスト表示するグリッドの生成処理
bankMaster.createGrid = function() {
  var req_url = "/bank_info";
  if ($("#delete_check_disp").prop("checked")) {
    req_url += "?delete_check=1";
  } else {
    req_url += "?delete_check=0";
  }
  jQuery("#bank_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['id','金融機関名','支店名','口座種別','口座番号','名義人名','メモ','削除フラグ','作成者','作成日','更新者','更新日'],
		colModel: [
      { name: 'id', index: 'id', hidden:true },
      { name: 'bank_name', index: 'bank_name', width: 200, align: "center" },
      { name: 'branch_name', index: 'branch_name', width: 200, align: "center"},
      { name: 'kouza_kind', index: 'kouza_kind', width: 200, align: "center",formatter:bankMaster.kouza_kindFormatter},
      { name: 'kouza_no', index: 'kouza_no', width: 200, align: "center"},
      { name: 'meigi_name', index: 'meigi_name', width: 200, align: "center"},
      { name: 'memo', index: 'memo', width: 200, align: "center"},
      { name: 'delete_check', index: 'delete_check', hidden:true},
      { name: 'created_id', index: 'created_id', hidden:true},
      { name: 'createdAt', index: 'createdAt', hidden:true},
      { name: 'updated_id', index: 'updated_id', hidden:true},
      { name: 'updatedAt', index: 'updatedAt', hidden:true}
		],
		height:240,
		width:960,
		shrinkToFit:true,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#bank_list_pager',
		sortname: 'id',
		viewrecords: true,
		sortorder: "asc",
		caption: "振込口座マスタ",
		onSelectRow:bankMaster.onSelectRow,
    loadComplete:bankMaster.loadComplete
	});
	jQuery("#bank_list").jqGrid('navGrid', '#bank_list_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();

};
bankMaster.kouza_kindFormatter = function (cellval, options, rowObject) {
	var result = "";
	if (cellval != null) {
		switch(cellval) {
			case 0:result = "普通";
			break;
			case 1:result = "当座";
			break;
		}
	}
	return result;
};


bankMaster.onSelectRow = function(rowid) {
  var bank = bankMaster.clear();
  var row = $("#bank_list").getRowData(rowid);
  $("#edit_bank").css("display","inline");
  bank.id = row.id;
  bank.bank_name = row.bank_name;
  bank.branch_name = row.branch_name;
  bank.kouza_kind = row.kouza_kind;
  bank.kouza_no = row.kouza_no;
  bank.meigi_name = row.meigi_name;
  bank.memo = row.memo;
  bankMaster.setForm(bank);
}

bankMaster.loadComplete = function(event) {
}

bankMaster.createBankMasterDialog = function () {
	$('#bank_master_dialog').dialog({
		autoOpen: false,
		width: 350,
		height: 400,
		title: '振込口座マスタ',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (bankMaster.save()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (bankMaster.save()) {
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
// 支払いサイト情報ダイアログの表示
bankMaster.openBankMasterDialog = function (event) {
	$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
	$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
  if ($(event.target).attr('id') == 'add_bank') {
    bankMaster.setForm(bankMaster.clear());
  }
	$("#bank_master_dialog").dialog("open");
};

bankMaster.setForm = function(bank) {
  $("#id").val(bank.id);
  $("#bank_name").val(bank.bank_name);
  $("#branch_name").val(bank.branch_name);
  if (bank.kouza_kind == '普通')
    $("#kouza_kind_1").prop('checked',true);
  else
  $("#kouza_kind_2").prop('checked',true);
  $("#kouza_no").val(bank.kouza_no);
  $("#meigi_name").val(bank.meigi_name);
  $("#memo").val(bank.memo);
}
bankMaster.clear = function() {
  var bank = {id:-1,bank_name:"",branch_name:"",kouza_kind:"普通",kouza_no:"",meigi_name:"",memo:""};
  return bank;
}
bankMaster.save = function() {
  var url = "/bank_info_post";
	// フォームからデータを取得
	var form = new FormData(document.querySelector("#bankMasterForm"));
  if (!$("#delete_check").prop("checked") ){
    form.append("delete_check", '0');
  }
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.responseType = 'json';
	xhr.onload = bankMaster.onSaveMaster;
	xhr.send(form);
  return true;
}

bankMaster.onSaveMaster = function(event) {
  if (this.status == 200) {
		// success
    bankMaster.reloadGrid();
	}
}
