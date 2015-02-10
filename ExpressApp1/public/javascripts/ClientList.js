//
// DRC殿試験案件スケジュール管理
// 得意先リスト画面の処理
//
$(function () {
	$("#tabs").tabs();
	// 得意先選択ダイアログ用のタブ生成
	clientList.createClientListTabs();
	// 得意先選択用グリッドの生成
	for (var i = 1; i <= 12; i++) {
		clientList.createClientListGrid(i);
	}
	// 編集用ダイアログの設定
	clientList.createClientDialog();
	// 案件追加ボタンイベント（登録・編集用画面の表示）
	$("#add_client").bind('click' , {}, clientList.openClientDialog);
	// 案件編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_client").bind('click' , {}, clientList.openClientDialog);
	// 削除分を表示のチェックイベント
	$("#client_delete_check_disp").bind('change', clientList.changeClientOption);

});
//
// 得意先入力、リスト表示に関する処理
//
var clientList = clientList || {};

clientList.currentClientListTabNo = 0;	// 得意先リストで選択中のタブ番号
clientList.currentClient = {};			// 選択中の得意先情報

// 得意先リストのタブ生成と選択イベントの設定
clientList.createClientListTabs = function () {
	$("#tabs-client").tabs({
		activate: function (event, ui) {
			clientList.currentClientListTabNo = ui.newTab.index();
		}
	});
};
// 得意先リストの生成
clientList.createClientListGrid = function (no) {
	var delchk = ($("#client_delete_check_disp").prop("checked")) ? 1:0;
	// 得意先リストのグリッド
	jQuery("#client_list_" + no).jqGrid({
		url: '/client_get?no=' + no + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['得意先コード', '得意先名１', '得意先名２', '住所１', '住所２', '担当者', '所属部署', '役職','', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', width: 80, align: "center" },
			{ name: 'name_1', index: 'name_1', width: 200, align: "left" },
			{ name: 'name_2', index: 'name_2', width: 80, align: "left" },
			{ name: 'address_1', index: 'address_1', width: 200 , align: "left" },
			{ name: 'address_2', index: 'address_2', width: 200, align: "left" },
			{ name: 'prepared_name', index: 'prepared_name', width: 100, align: "center" },
			{ name: 'prepared_division', index: 'prepared_division', width: 100, align: "center" },
			{ name: 'prepared_title', index: 'prepared_title', width: 100, align: "center" },
			{ name: 'kana', index: 'kana', hidden: true },
			{ name: 'compellation', index: 'compellation', hidden: true },
			{ name: 'zipcode', index: 'zipcode', hidden: true },
			{ name: 'email', index: 'email', hidden: true },
			{ name: 'tel_no', index: 'tel_no', hidden: true },
			{ name: 'fax_no', index: '', hidden: true },
			{ name: 'prepared_compellation', index: '', hidden: true },
			{ name: 'prepared_telno', index: '', hidden: true },
			{ name: 'prepared_faxno', index: '', hidden: true },
			{ name: 'prepared_email', index: '', hidden: true },
			{ name: 'memo', index: '', hidden: true },
			{ name: 'billing_limit', index: '', hidden: true },
			{ name: 'payment_date', index: '', hidden: true },
			{ name: 'delete_check', index: '', hidden: true },
		],
		height: "230px",
		width: "100%",
		rowNum: 10,
		rowList: [10],
		pager: '#client_list_pager_' + no,
		sortname: 'client_cd',
		viewrecords: true,
		sortorder: "desc",
		caption: "得意先リスト",
		onSelectRow: clientList.onSelectClientList
	});
	jQuery("#client_list_" + no).jqGrid('navGrid', '#client_list_pager_' + no, { edit: false, add: false, del: false });
};
// 得意先選択イベント
clientList.onSelectClientList = function (rowid) {
	var no;
	if (rowid != null) {
		var row = $("#client_list_" + (clientList.currentClientListTabNo + 1)).getRowData(rowid);
		clientList.currentClient = row;
	}
};
// 得意先情報入力用ダイアログの生成
clientList.createClientDialog = function () {
	$('#client_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 600,
		title: '得意先情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (clientList.saveClient()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (clientList.saveClient()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 編集用ダイアログの表示
clientList.openClientDialog = function (event) {
	// フォームをクリアする
	var client = clientList.clearClient();
	clientList.setClientForm(client);
	if ($(event.target).attr('id') == 'edit_client') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		clientList.setClientForm(clientList.currentClient);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}
	
	$("#client_dialog").dialog("open");
};
// formデータの取得
clientList.getFormData = function () {
	clientList.checkCheckbox();
	var form = new FormData(document.querySelector("#clientForm"));
	
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#delete_check").prop("checked")) {
		form.append('delete_check', '0');
	} 
	return form;
};
// checkboxのチェック状態確認と値設定
clientList.checkCheckbox = function () {
	if ($("#delete_check").prop("checked")) {
		$("#delete_check").val('1');
	}
};

// 得意先情報の保存
clientList.saveClient = function () {
	// formデータの取得
	var form = clientList.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/client_post', true);
	xhr.responseType = 'json';
	xhr.onload = clientList.onloadClientSave;
	xhr.send(form);
	return true;
};
clientList.onloadClientSave = function (event) {
	if (this.status == 200) {
		clientList.reloadGrid();
	}
};
// 削除分の表示チェックイベント
clientList.changeClientOption = function (event) {
	clientList.reloadGrid();
};
clientList.reloadGrid = function () {
	$("#client_list_" + (clientList.currentClientListTabNo + 1)).GridUnload();
	clientList.createClientListGrid(clientList.currentClientListTabNo + 1);
};

// 得意先情報のクリア
clientList.clearClient = function () {
	var client = {};
	client.client_cd = "";
	client.name_1 = "";
	client.name_2 = "";
	client.address_1 = "";
	client.address_2 = "";
	client.prepared_name = "";
	client.prepared_division = "";
	client.prepared_title = "";
	client.kana = "";
	client.compellation = "";
	client.zipcode = "";
	client.email = "";
	client.tel_no = "";
	client.fax_no = "";
	client.prepared_compellation = "";
	client.prepared_telno = "";
	client.prepared_faxno = "";
	client.prepared_email = "";
	client.memo = "";
	client.billing_limit = "";
	client.payment_date = "";
	client.delete_check = 0;
	return client;
};

// 得意先情報をフォームにセットする
clientList.setClientForm = function (client) {
	
	$("#client_cd").val(client.client_cd);
	$("#name_1").val(client.name_1);
	$("#name_2").val(client.name_2);
	$("#address_1").val(client.address_1);
	$("#address_2").val(client.address_2);
	$("#prepared_name").val(client.prepared_name);
	$("#prepared_division").val(client.prepared_division);
	$("#prepared_title").val(client.prepared_title);
	$("#kana").val(client.kana);
	$("#compellation").val(client.compellation);
	$("#zipcode").val(client.zipcode);
	$("#email").val(client.email);
	$("#tel_no").val(client.tel_no);
	$("#fax_no").val(client.fax_no);
	$("#prepared_compellation").val(client.prepared_compellation);
	$("#prepared_telno").val(client.prepared_telno);
	$("#prepared_faxno").val(client.prepared_faxno);
	$("#prepared_email").val(client.prepared_email);
	$("#memo").val(client.memo);
	$("#billing_limit").val(client.billing_limit);
	$("#payment_date").val(client.payment_date);
	$("#delete_check").val(client.delete_check);
};
