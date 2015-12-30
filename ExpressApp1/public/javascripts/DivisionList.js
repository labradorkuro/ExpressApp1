//
// DRC殿試験案件スケジュール管理
// 事業部リスト画面の処理
//
$(function () {
	$("div.toolbar").css("display","none");
	divisionList.checkAuth();
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	$("#tabs").tabs();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	// 編集用ダイアログの設定
	divisionList.createDivisionDialog();
	divisionList.createMessageDialog();
	divisionList.createGrid();
	// 事業部追加ボタンイベント（登録・編集用画面の表示）
	$("#add_division").bind('click' , {}, divisionList.openDivisionDialog);
	// 事業部編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_division").bind('click' , {}, divisionList.openDivisionDialog);
	
});

// 事業部リスト処理
var divisionList = divisionList || {};
// 権限チェック
divisionList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f02") {
			if (auth.value == 2) {
				$("div.toolbar").css("display","block");
			} else {
				$("div.toolbar").css("display","none");
			}
		}
	}
};
// メッセージ表示用ダイアログの生成
divisionList.createMessageDialog = function () {
	$('#message_dialog').dialog({
		autoOpen: false,
		width: 400,
		height: 180,
		title: 'メッセージ',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// 事業部入力用ダイアログの生成
divisionList.createDivisionDialog = function () {
	$('#division_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 250,
		title: '事業部情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (divisionList.saveDivision()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (divisionList.saveDivision()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
divisionList.createGrid = function () {
	// 案件リストのグリッド
	jQuery("#division_list").jqGrid({
		url: '/division_get',
		altRows: true,
		datatype: "json",
		colNames: ['事業部ID','事業部名','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'division', index: 'division', width: 80, align: "center" },
			{ name: 'division_name', index: 'division_name', width: 200, align: "center" },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id' },
		],
		rowNum: 10,
		rowList: [10],
		pager: '#division_pager',
		sortname: 'division',
		viewrecords: true,
		sortorder: "asc",
		caption: "事業部リスト",
		onSelectRow: divisionList.onSelectuser
	});
	jQuery("#division_list").jqGrid('navGrid', '#division_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};

// 編集用ダイアログの表示
divisionList.openDivisionDialog = function (event) {
	
	var division = divisionList.clearDivision();
	divisionList.setDivisionForm(division);
	if ($(event.target).attr('id') == 'edit_division') {
		// 編集ボタンから呼ばれた時は選択中のデータを取得して表示する
		var no = divisionList.getSelectDivision();
		divisionList.requestDivisionData(no);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}
	$("#division_dialog").dialog("open");
};
// 社員情報データの読込み
divisionList.requestDivisionData = function (division) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/division_get/' + division, true);
	xhr.responseType = 'json';
	xhr.onload = divisionList.onloadDivisionReq;
	xhr.send();
};
//	社員情報データの保存
divisionList.saveDivision = function () {
	if (!divisionList.inputCheck()) {
		return false;
	}
	// checkboxのチェック状態確認と値設定
	divisionList.checkCheckbox();
	// formデータの取得
	var form = divisionList.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/division_post', true);
	xhr.responseType = 'json';
	xhr.onload = divisionList.onloadDivisionSave;
	xhr.send(form);
	return true;
};
divisionList.inputCheck = function () {
	var result = true;
	if ($("#division").val() == "") {
		// 事業部ID
		$("#message").text("事業部IDが未入力です。");
		result = false;
	}
	if ($("#division_name").val() == "") {
		// 事業部名
		$("#message").text("事業部名が未入力です。");
		result = false;
	}
	if (!result) {
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;

};
// checkboxのチェック状態確認と値設定
divisionList.checkCheckbox = function () {
	if ($("#delete_check:checked").val()) {
		$("#delete_check").val('1');
	}
};
// formデータの取得
divisionList.getFormData = function () {
	var form = new FormData(document.querySelector("#divisionForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#delete_check:checked").val()) {
		form.append('delete_check', '0');
	}
	return form;
};

// 保存後のコールバック
divisionList.onloadDivisionSave = function (e) {
	if (this.status == 200) {
		$("#division_list").GridUnload();
		divisionList.createGrid();
	}
};
// 取得リクエストのコールバック
divisionList.onloadDivisionReq = function (e) {
	if (this.status == 200) {
		var division = this.response;
		// formに取得したデータを埋め込む
		divisionList.setDivisionForm(division);
	}
};

// データをフォームにセットする
divisionList.setDivisionForm = function (division) {
	$("#division").val(division.division);				// 事業部ID
	$("#division_name").val(division.division_name);	// 事業部名
	$("#delete_check").val(division.delete_check);	// 削除フラグ
	$("#created").val(division.created);			// 作成日
	$("#created_id").val(division.created_id);	// 作成者ID
	$("#updated").val(division.updated);		// 更新日
	$("#updated_id").val(division.updated_id);	// 更新者ID
};
divisionList.clearDivision = function () {
	var division = {};
	division.division = '';		// 事業部ID
	division.division_name = '';// 事業部名
	division.delete_check = '';	// 削除フラグ
	division.created = "";		// 作成日
	division.created_id = "";   // 作成者ID
	division.updated = "";		// 更新日
	division.updated_id = "";	// 更新者ID
	return division;
};

// リストで選択中のIDを取得する
divisionList.getSelectDivision = function () {
	var division = "";
	var id = $("#division_list").getGridParam('selrow');
	if (id != null) {
		var row = $("#division_list").getRowData(id);
		division = row.division;
	}
	return division;
};

