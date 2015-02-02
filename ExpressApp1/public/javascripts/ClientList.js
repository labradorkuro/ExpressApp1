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
	// 得意先リストのグリッド
	jQuery("#client_list_" + no).jqGrid({
		url: '/client_get?no=' + no,
		altRows: true,
		datatype: "json",
		colNames: ['得意先コード', '得意先名１', '得意先名２', '住所１', '住所２', '担当者', '所属部署', '役職'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', width: 80, align: "center" },
			{ name: 'name_1', index: 'name_1', width: 200, align: "left" },
			{ name: 'name_2', index: 'name_2', width: 80, align: "left" },
			{ name: 'address_1', index: 'address_1', width: 200 , align: "left" },
			{ name: 'address_2', index: 'address_2', width: 200, align: "left" },
			{ name: 'prepared_name', index: 'prepared_name', width: 100, align: "center" },
			{ name: 'prepared_division', index: 'prepared_division', width: 100, align: "center" },
			{ name: 'prepared_title', index: 'prepared_title', width: 100, align: "center" },
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
