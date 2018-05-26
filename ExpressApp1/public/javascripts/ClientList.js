﻿//
// 得意先入力、リスト表示に関する処理
//
var clientList = clientList || {};
clientList.func = 0;										// 0:顧客管理、1:委託先管理
clientList.currentClientListTabNo = 0;	// 得意先リストで選択中のタブ番号
clientList.currentClient = {};			// 選択中の得意先情報
clientList.currentClientDivision = {};	// 選択中の得意先部署情報
clientList.currentClientPerson = {};	// 選択中の得意先担当者情報
// 権限チェック
clientList.checkAuth = function() {
	$("#post_config").css('display','none');
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f01") {
			if (auth.value == 2) {
				clientList.init(true);
			} else {
				clientList.init(false);
			}
		}
	}
};
// メッセージ表示用ダイアログの生成
clientList.createMessageDialog = function () {
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

// リスト画面の生成（初期化）
clientList.init = function(toolbar) {
	for(var i = 1;i <= 11;i++) {
		var target = "#tabs-" + i;
		$(target).empty();
		// Tab毎に必要な要素を追加する
		if (toolbar) {
			var tb = clientList.createToolbar(target, "client", i);
			clientList.createSightInfoBtn(tb, i);
			clientList.createListPrintBtn(tb, i);
			clientList.createListCsvBtn(tb, i);
			if (i == 11) {
				// 検索用ツールバーを生成する
				clientList.createSearchToolbar(target);
			}
		}
		clientList.createListGridElements(target, "client", i);
		if (toolbar)
			clientList.createToolbar(target, "client_division", i);
		clientList.createListGridElements(target, "client_division", i);
			if (toolbar)
			clientList.createToolbar(target, "client_person", i);
		clientList.createListGridElements(target, "client_person", i);
		if (toolbar) {
			// クライアント情報追加ボタンイベント（登録・編集用画面の表示）
			$("#add_client_" + i).bind('click' , {}, clientList.openClientDialog);
			// クライアント編集ボタンイベント（登録・編集用画面の表示）
			$("#edit_client_" + i).bind('click' , {}, clientList.openClientDialog);
			// 削除分を表示のチェックイベント
			$("#client_delete_check_disp_" + i).bind('change', clientList.changeClientOption);

			// 部署情報追加ボタンイベント（登録・編集用画面の表示）
			$("#add_client_division_" + i).bind('click' , {}, clientList.openClientDivisionDialog);
			// 部署情報編集ボタンイベント（登録・編集用画面の表示）
			$("#edit_client_division_" + i).bind('click' , {}, clientList.openClientDivisionDialog);
			// 削除分を表示のチェックイベント
			$("#client_division_delete_check_disp_" + i).bind('change', clientList.changeClientDivisionOption);

			// 担当者情報追加ボタンイベント（登録・編集用画面の表示）
			$("#add_client_person_" + i).bind('click' , {}, clientList.openClientPersonDialog);
			// 担当者情報編集ボタンイベント（登録・編集用画面の表示）
			$("#edit_client_person_" + i).bind('click' , {}, clientList.openClientPersonDialog);
			// 削除分を表示のチェックイベント
			$("#client_person_delete_check_disp_" + i).bind('change', clientList.changeClientPersonOption);
			// 支払いサイト情報表示ボタンイベント
			$("#sight_" + i).bind('click' , {}, clientList.openSightInfoDialog);
			$("#list_print_" + i).bind('click' , {}, clientList.clientListPrint);
			$("#list_csv_" + i).bind('click' , {}, clientList.clientListCsv);

		}
	}
	// 入力したclient_cdが既存か確認する
	$("#client_cd").bind('blur' , {}, clientList.check_client_cd);
	// 支払サイト編集画面を開くボタン
	// 支払いサイト情報表示ボタンイベント
	$("#sight_info_btn").bind('click' , {}, clientList.openSightInfoDialog);
	// キーワード検索
	$("#search_client").bind('click',{},clientList.searchClient);
	$("#search_client_clear").bind('click',{},clientList.searchClientClear);
};

clientList.initSub = function(i,toolbar) {
	var target = "#tabs-" + i;
	clientList.createListGridElements(target, "client", i);
	clientList.createListGridElements(target, "client_division", i);
	clientList.createListGridElements(target, "client_person", i);
};

// 各リストのツールバーを生成する
clientList.createToolbar = function(target, kind, no) {
	var toolbar = $("<div class='toolbar'></table>");
	var add_btn = $("<a class='tool_button_a' id='add_" + kind + "_" + no + "'>追加</a>");
	var edit_btn = $("<a class='tool_button_a' id='edit_" + kind + "_" + no  + "'>編集</a>");
	var delete_label = $("<label class='search_option_check' value='1'></label>");
	var delete_check = $("<input type='checkbox' class='search_option_check' id='" + kind + "_delete_check_disp_" + no + "'>");
	$(delete_label).append(delete_check);
	$(delete_label).append("削除分を表示");
	$(toolbar).append(add_btn);
	$(toolbar).append(edit_btn);
	$(toolbar).append(delete_label);
	$(target).append(toolbar);
	return toolbar;
};
// キーワード検索用ツールバー
clientList.createSearchToolbar = function(target) {
	var toolbar = $("<div class='toolbar'></table>");
	var fieldset = $("<fieldset class='entry_search_set'/>");
	var keyword = $("<input class='entry_search_keyword' type='text' id='client_search_keyword' placeholder='キーワード'/>")
	var search_btn = $("<a class='tool_button_a' id='search_client'>検索</a>");
	var search_clear_btn = $("<a class='tool_button_a' id='search_client_clear'>クリア</a>");
	$(fieldset).append(keyword);
	$(toolbar).append(fieldset);
	$(toolbar).append(search_btn);
	$(toolbar).append(search_clear_btn);

	$(target).append(toolbar);
	return toolbar;
};
// 支払サイト情報ボタンの作成
clientList.createSightInfoBtn = function(toolbar,no) {
	var sight_btn = $("<a class='tool_button_a' id='sight_" + no  + "'>支払いサイト情報</a>");
	$(toolbar).append(sight_btn);

}
// 印刷ボタンの作成
clientList.createListPrintBtn = function(toolbar,no) {
	var print_btn = $("<a class='tool_button_a' id='list_print_" + no  + "'>印刷</a>");
	$(toolbar).append(print_btn);
}
// CSVボタンの作成
clientList.createListCsvBtn = function(toolbar,no) {
	var csv_btn = $("<a class='tool_button_a' id='list_csv_" + no  + "'>CSV出力</a>");
	$(toolbar).append(csv_btn);
}
// リスト画面のグリッド用テーブル要素を生成する
clientList.createListGridElements = function(target, kind, no) {
	var admin_div = $("<div class='admin_div'></div>");
	// グリッド用テーブル
	var table = $("<table class='client_list' id='" + kind + "_list_" + no + "'><table>");
	$(admin_div).append(table);
	// ページャ用
	var div = $("<div class='grid_pager' id='" + kind + "_list_pager_" + no + "'></div>");
	$(admin_div).append(div);
	$(target).append(admin_div);
	$(target).append($("<p></p>"));
};

// 得意先リストのタブ生成と選択イベントの設定
clientList.createClientListTabs = function () {
	$("#tabs-client").tabs({
		active:0,
		activate: function (event, ui) {
			var no = ui.newTab.index() + 1;
			clientList.currentClientListTabNo = ui.newTab.index();
			clientList.createClientListGrid(no,"");
			clientList.createClientDivisionListGrid(no, '0');
			clientList.createClientPersonListGrid(no, '0', '0');
		}
	});
};
// 得意先リストの生成
clientList.createClientListGrid = function (no, keyword) {
	var fname = "得意先";
	var url = '/client_get';
	if (clientList.func === 0) {
		fname = "得意先"
		url = '/client_get';
	} else if (clientList.func === 1) {
		fname = "委託先"
		url = '/itakusaki_get';
	}
	var delchk = ($("#client_delete_check_disp_" + no).prop("checked")) ? 1:0;
	url += '?no=' + no + '&delete_check=' + delchk;
	if (keyword != "") {
		// キーワード検索
		url += '&keyword=' + keyword;
	}
	// 得意先リストのグリッド
	jQuery("#client_list_" + no).jqGrid({
		url: url,
		altRows: true,
		datatype: "json",
		colNames: [fname + 'コード', fname + '名１', fname + '名２', 'カナ','郵便番号','住所１', '住所２','電話番号','FAX番号','メールアドレス','メモ','作成日','作成者','更新日','更新者','削除フラグ'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', width: 80, align: "center",searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']},hidden:true},
			{ name: 'name_1', index: 'name_1', width: 200, align: "left" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'name_2', index: 'name_2', width: 100, align: "left" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'kana', index: 'kana', width: 100 , align: "left" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'zipcode', index: 'zipcode', width: 80 , align: "center" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'address_1', index: 'address_1', width: 200 , align: "left" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'address_2', index: 'address_2', width: 200, align: "left" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'tel_no', index: 'tel_no', width: 80 , align: "center" ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'fax_no', index: '', width: 80 , align: "center"  ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'email', index: 'email', width: 80 , align: "center"  ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'memo', index: '', width: 100 , align: "center"  ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'created', index: 'created', width: 130, align: "center" ,searchoptions:{sopt:["eq","ne","ge","le"]},searchrules: {date: true}},
			{ name: 'created_id', index: 'created_id' , formatter: scheduleCommon.personFormatter ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
			{ name: 'updated', index: 'updated', width: 130, align: "center" ,searchoptions:{sopt:["eq","ne","ge","le"]},searchrules: {date: true}},
			{ name: 'updated_id', index: 'updated_id', formatter: scheduleCommon.personFormatter ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']} },
			{ name: 'delete_check',index: 'delete_check', hidden:true}
		],
		height: "260px",
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#client_list_pager_' + no,
		sortname: 'kana',
		viewrecords: true,
		sortorder: "asc",
		caption: fname + "リスト",
		onSelectRow: clientList.onSelectClientList,
		loadComplete:clientList.loadCompleteList,
		pagerpos:'left',
		recordpos: 'center'
	});
	if (no < 11) {
		jQuery("#client_list_" + no).jqGrid('navGrid', '#client_list_pager_' + no, { edit: false, add: false, del: false,search:false });
	} else {
		jQuery("#client_list_" + no).jqGrid('navGrid', '#client_list_pager_' + no, { edit: false, add: false, del: false,search:true },{},{},{},{overlay:false});
	}
	$('#client_list_pager_' + no +'_left table.ui-pg-table').css('float','left');
  $('#client_list_pager_' + no +'_left').css('width','30%');
	$('#client_list_pager_' + no + '_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
	// ツールバーボタンの制御
	clientList.buttonEnabledForTop(no,0);
	clientList.buttonEnabledForMiddle(no,0);
	clientList.buttonEnabledForBottom(no,0);
};
// loadCompleイベント処理（表示行数に合わせてグリッドの高さを変える）
clientList.loadCompleteList = function(data) {
  var h = data.rows.length * 26;
	var tab_no = $("#tabs-client").tabs("option","active") + 1;
  $("#client_list_" + tab_no).setGridHeight(h);
}
// 得意先選択イベント
clientList.onSelectClientList = function (rowid) {
	var no;
	if (rowid != null) {
		var row = $("#client_list_" + (clientList.currentClientListTabNo + 1)).getRowData(rowid);
		clientList.currentClient = row;
		clientList.currentClientDivision = {};
		clientList.currentClientPerson = {};
		// 部署リストの再検索と表示
		var tabNo = (clientList.currentClientListTabNo + 1);
		$("#client_division_list_" + tabNo).GridUnload();
		clientList.createClientDivisionListGrid(tabNo, row.client_cd);
		// 担当者リストのクリア
		clientList.reloadPersonGrid(tabNo,"0");
		// ツールバーボタンの制御
		clientList.buttonEnabledForTop(tabNo,1);
		clientList.getSightInfo(row.client_cd);
	}
};
// 得意先部署リストの生成
clientList.createClientDivisionListGrid = function (no, client_cd) {
	var delchk = ($("#client_division_delete_check_disp_" + no).prop("checked")) ? 1:0;
	// 得意先リストのグリッド
	var url = '/client_division_get';
	if (clientList.func === 0) {
		url = '/client_division_get';
	} else if (clientList.func === 1) {
		url = '/itakusaki_division_get';
	}
	jQuery("#client_division_list_" + no).jqGrid({
		url: url + '?client_cd=' + client_cd + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['クライアントCD','部署コード','部署名', 'カナ','郵便番号','住所１', '住所２','電話番号','FAX番号','メールアドレス','請求締日','支払日','休日対応','メモ','作成日','作成者','更新日','更新者','削除フラグ'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', hidden: true },
			{ name: 'division_cd', index: 'division_cd', width:80, align: 'left' ,hidden:true},
			{ name: 'name', index: 'name', width: 200 , align: "left" },
			{ name: 'kana', index: 'kana', width: 200 , align: "left" },
			{ name: 'zipcode', index: 'zipcode', width: 80 , align: "center" },
			{ name: 'address_1', index: 'address_1', width: 200 , align: "left" },
			{ name: 'address_2', index: 'address_2', width: 200, align: "left" },
			{ name: 'tel_no', index: 'tel_no', width: 80 , align: "center" },
			{ name: 'fax_no', index: '', width: 80 , align: "center"  },
			{ name: 'email', index: 'email', width: 80 , align: "center"  },
			{ name: 'billing_limit', index: 'billing_limit', width: 80 , align: "center"  },
			{ name: 'payment_date', index: 'payment_date', width: 80 , align: "center"  },
			{ name: 'holiday_support', index: 'holiday_support', width: 80 , align: "center"  },
			{ name: 'memo', index: '', width: 100 , align: "center"  },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' , formatter: scheduleCommon.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', formatter: scheduleCommon.personFormatter  },
			{ name: 'delete_check',index: 'delete_check', hidden:true}
		],
		height: "115px",
		shrinkToFit:false,
		rowNum: 5,
		rowList: [5],
		pager: '#client_division_list_pager_' + no,
		pagerpos: 'left',
		recordpos: 'center',
		sortname: 'kana',
		viewrecords: true,
		sortorder: "asc",
		caption: "部署リスト",
		onSelectRow: clientList.onSelectClientDivisionList
	});
	jQuery("#client_division_list_" + no).jqGrid('navGrid', '#client_division_list_pager_' + no, { edit: false, add: false, del: false,search:false });
	$('#client_division_list_pager_' + no +'_left table.ui-pg-table').css('float','left');
  $('#client_division_list_pager_' + no +'_left').css('width','30%');
	$('#client_division_list_pager_' + no + '_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
	// ツールバーボタンの制御
	clientList.buttonEnabledForMiddle(no,1);
};
// 部署リスト選択イベント処理
clientList.onSelectClientDivisionList = function (rowid) {
	var no;
	if (rowid != null) {
		var row = $("#client_division_list_" + (clientList.currentClientListTabNo + 1)).getRowData(rowid);
		clientList.currentClientDivision = row;
		clientList.currentClientPerson = {};
		// 担当者リストの再検索と表示
		var tabNo = (clientList.currentClientListTabNo + 1);
		$("#client_person_list_" + tabNo).GridUnload();
		clientList.createClientPersonListGrid(tabNo, clientList.currentClient.client_cd, row.division_cd);
		// ツールバーボタンの制御
		clientList.buttonEnabledForMiddle(tabNo,2);
	}
};
// 得意先担当者リストの生成
clientList.createClientPersonListGrid = function (no, client_cd, division_cd) {
	var delchk = ($("#client_person_delete_check_disp_" + no).prop("checked")) ? 1:0;
	// 得意先リストのグリッド
	var url = '/client_person_get';
	if (clientList.func === 0) {
		url = '/client_person_get';
	} else if (clientList.func === 1) {
		url = '/itakusaki_person_get';
	}
	jQuery("#client_person_list_" + no).jqGrid({
		url: url + '?client_cd=' + client_cd + '&division_cd=' + division_cd + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['','','担当者コード','担当者名', 'カナ','敬称','役職名','メールアドレス','メモ','作成日','作成者','更新日','更新者','削除フラグ'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', hidden: true },
			{ name: 'division_cd', index: 'division_cd', hidden: true },
			{ name: 'person_id', index: 'person_id', width: 100 , align: "left" ,hidden:true},
			{ name: 'name', index: 'name', width: 100 , align: "left" },
			{ name: 'kana', index: 'kana', width: 100 , align: "left" },
			{ name: 'compellation', index: 'compellation', width: 80 , align: "left" },
			{ name: 'title', index: 'title', width: 80 , align: "left" },
			{ name: 'email', index: 'email', width: 160 , align: "center"  },
			{ name: 'memo', index: 'memo', width: 100 , align: "center"  },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' , formatter: scheduleCommon.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', formatter: scheduleCommon.personFormatter  },
			{ name: 'delete_check',index: 'delete_check', hidden:true}
		],
		height: "115px",
		shrinkToFit:false,
		rowNum: 5,
		rowList: [5],
		pager: '#client_person_list_pager_' + no,
		pagerpos: 'left',
		recordpos: 'center',
		sortname: 'kana',
		viewrecords: true,
		sortorder: "asc",
		caption: "担当者リスト",
		onSelectRow: clientList.onSelectClientPersonList
	});
	jQuery("#client_person_list_" + no).jqGrid('navGrid', '#client_person_list_pager_' + no, { edit: false, add: false, del: false,search:false });
	$('#client_person_list_pager_' + no +'_left table.ui-pg-table').css('float','left');
  $('#client_person_list_pager_' + no +'_left').css('width','30%');
	$('#client_person_list_pager_' + no + '_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
	// ツールバーボタンの制御
	clientList.buttonEnabledForBottom(no,1);
};
// 担当者リストの選択イベント処理
clientList.onSelectClientPersonList = function (rowid) {
	var no = (clientList.currentClientListTabNo + 1);
	if (rowid != null) {
		var row = $("#client_person_list_" + no).getRowData(rowid);
		clientList.currentClientPerson = row;
		// ツールバーボタンの制御
		clientList.buttonEnabledForBottom(no,2);
	}
};
// 得意先情報入力用ダイアログの生成
clientList.createClientDialog = function (kind, title, saveFunc) {
	$('#' + kind + '_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 460,
		title: title,
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (saveFunc()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (saveFunc()) {
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
// 編集用ダイアログの表示
clientList.openClientDialog = function (event) {
	// フォームをクリアする
	var client = clientList.clearClient();
	clientList.setClientForm(client);
	if ($(event.target).attr('id').indexOf('edit_client') != -1) {
		// 編集ボタンから呼ばれた時は選択中のデータを取得して表示する
		clientList.setClientForm(clientList.currentClient);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		$("#client_cd").attr("disabled",true);
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		$("#client_cd").attr("disabled",false);
	}

	$("#client_dialog").dialog("open");
};
// 編集用ダイアログの表示
clientList.openClientDivisionDialog = function (event) {
	// クライアント情報リストが選択されている場合
	if (clientList.currentClient.client_cd != "") {
		// フォームをクリアする
		var division = clientList.clearDivision();
		if ($(event.target).attr('id').indexOf('edit_client_division') != -1) {
			// 編集ボタンから呼ばれた時は選択中のデータを取得して表示する
			division = clientList.currentClientDivision;
			$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
			$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		} else {
			$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
			$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		}
		division.client_cd = clientList.currentClient.client_cd;
		division.client_name = clientList.currentClient.name_1 + " " + clientList.currentClient.name_2;
		clientList.setClientDivisionForm(division);

		$("#client_division_dialog").dialog("open");
	}
};
// 編集用ダイアログの表示
clientList.openClientPersonDialog = function (event) {
	if (clientList.currentClientDivision.division_cd != "") {
		// フォームをクリアする
		var person = clientList.clearPerson();
		if ($(event.target).attr('id').indexOf('edit_client_person') != -1) {
			// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
			person = clientList.currentClientPerson;
			$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
			$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		} else {
			$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
			$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		}
		person.client_cd = clientList.currentClientDivision.client_cd;
		person.client_name = clientList.currentClient.name_1 + " " + clientList.currentClient.name_2;
		person.division_cd = clientList.currentClientDivision.division_cd;
		person.division_name = clientList.currentClientDivision.name;
		clientList.setClientPersonForm(person);
		// 部署リストの取得リクエスト
		clientList.getDivisionList(clientList.currentClientDivision.client_cd);
		//$("#client_person_dialog").dialog("open");
	}
};
// 部署コード、部署名リストの取得リクエスト
clientList.getDivisionList = function(client_cd) {
	var url = "";
	if (clientList.func === 0) {
		url = "/client_division_list";
	} else {
		url = "/itakusaki_division_list";
	}
	$.ajax(url + "?client_cd=" + client_cd + "&delete_check=0" , {
		type: 'GET',
		dataType: 'json',
		contentType : 'application/json',
		success: clientList.onGetDivisionList
		});
};
// 部署コード、部署名リストの取得リクエスト応答
clientList.onGetDivisionList = function(division_list) {
	$("#person_division_cd").empty();
	$.each(division_list,function() {
    // 選択リストに部署リストを追加する
		$("#person_division_cd").append($("<option value='" + this.division_cd + "'>" + this.name +  "</option>"));
	});
	var division_cd = $("#person_division_hidden").val();
	$("#person_division_cd").val(division_cd);
	$("#client_person_dialog").dialog("open");

};

// formデータの取得
clientList.getFormData = function (form_id, delete_check_id) {
	clientList.checkCheckbox(delete_check_id);
	var form = new FormData(document.querySelector("#" + form_id));

	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#" + delete_check_id).prop("checked")) {
		form.append(delete_check_id, '0');
	}
	return form;
};
// checkboxのチェック状態確認と値設定
clientList.checkCheckbox = function (delete_check_id) {
	if ($("#" + delete_check_id).prop("checked")) {
		$("#" + delete_check_id).val('1');
	}
};

// フォームの入力値チェック（得意先）
clientList.clientInputCheck = function () {
	var result = false;
	var err = "";
	if (! $("#clientForm")[0].checkValidity) {
		return true;
	}
	// HTML5のバリデーションチェック
	if ($("#clientForm")[0].checkValidity()) {
		result = true;
	} else {
		var ctrls = $("#clientForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (! ctl.validity.valid) {
				if (ctl.id == "client_cd") {
					err = "得意先コード(半角英数カナ)の入力値を確認して下さい";
					break;
				} else if (ctl.id == "name_1") {
					err = "得意先名１の入力値を確認して下さい";
					break;
				} else if (ctl.id == "kana") {
					err = "カナの入力値を確認して下さい";
					break;
				} else if (ctl.id == "zipcode") {
					err = "郵便番号の入力値を確認して下さい";
					break;
				} else if (ctl.id == "email") {
					err = "メールアドレスの入力値を確認して下さい";
					break;
				}
			}
		}
	}
	if (scheduleCommon.checkKana($("#kana").val()) == false) {
		err = "カナは全角カナで入力して下さい";
		result = false;
	}
	if (!result) {
		$("#message").text(err);
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// フォームの入力値チェック（部署）
clientList.clientDivisionInputCheck = function () {
	var result = false;
	var err = "";
	if (! $("#clientDivisionForm")[0].checkValidity) {
		return true;
	}
	// HTML5のバリデーションチェック
	if ($("#clientDivisionForm")[0].checkValidity()) {
		result = true;
	} else {
		var ctrls = $("#clientDivisionForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (! ctl.validity.valid) {
				if (ctl.id == "division_cd") {
					err = "部署コードの入力値を確認して下さい";
					break;
				} else if (ctl.id == "division_name") {
					err = "部署名の入力値を確認して下さい";
					break;
				} else if (ctl.id == "division_kana") {
					err = "カナの入力値を確認して下さい";
					break;
				} else if (ctl.id == "division_zipcode") {
					err = "郵便番号の入力値を確認して下さい";
					break;
				} else if (ctl.id == "division_email") {
					err = "メールアドレスの入力値を確認して下さい";
					break;
				}
			}
		}
	}
	if (scheduleCommon.checkKana($("#division_kana").val()) == false) {
		err = "カナは全角カナで入力して下さい";
		result = false;
	}

	if (!result) {
		$("#message").text(err);
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// フォームの入力値チェック（担当者）
clientList.clientPersonInputCheck = function () {
	var result = false;
	var err = "";
	if (! $("#clientPersonForm")[0].checkValidity) {
		return true;
	}
	// HTML5のバリデーションチェック
	if ($("#clientPersonForm")[0].checkValidity()) {
		result = true;
	} else {
		var ctrls = $("#clientPersonForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (! ctl.validity.valid) {
				if (ctl.id == "person_id") {
					err = "担当者コードの入力値を確認して下さい";
					break;
				} else if (ctl.id == "person_name") {
					err = "担当者名の入力値を確認して下さい";
					break;
				} else if (ctl.id == "person_kana") {
					err = "カナの入力値を確認して下さい";
					break;
				} else if (ctl.id == "person_email") {
					err = "メールアドレスの入力値を確認して下さい";
					break;
				}
			}
		}
	}
	if (scheduleCommon.checkKana($("#person_kana").val()) == false) {
		err = "カナは全角カナで入力して下さい";
		result = false;
	}
	if (!result) {
		$("#message").text(err);
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// 得意先情報の保存
clientList.saveClient = function () {
	$("#client_cd").attr("disabled",false);
	var url = '/client_post';
	if (clientList.func === 0) {
		url = '/client_post';
	} else if (clientList.func === 1) {
		url = '/itakusaki_post';
	}
	// 入力値チェック
	if (clientList.clientInputCheck()) {
		// formデータの取得
		var form = clientList.getFormData("clientForm","delete_check");
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.responseType = 'json';
		xhr.onload = clientList.onloadClientSave;
		xhr.send(form);
		return true;
	} else {
		return false;
	}
};
clientList.onloadClientSave = function (event) {
	if (this.status == 200) {
		clientList.reloadGrid();
	}
};
// 部署情報の保存
clientList.saveClientDivision = function () {
	var url = '/client_division_post';
	if (clientList.func === 0) {
		url = '/client_division_post';
	} else if (clientList.func === 1) {
		url = '/itakusaki_division_post';
	}
	// 入力値チェック
	if (clientList.clientDivisionInputCheck()) {
		// formデータの取得
		var form = clientList.getFormData("clientDivisionForm","division_delete_check");
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.responseType = 'json';
		xhr.onload = clientList.onloadClientDivisionSave;
		xhr.send(form);
		return true;
	} else {
		return false;
	}
};
clientList.onloadClientDivisionSave = function (event) {
	if (this.status == 200) {
		clientList.reloadDivisionGrid(clientList.currentClient.client_cd);
	}
};
// 担当者情報の保存
clientList.saveClientPerson = function () {
	var url = '/client_person_post';
	if (clientList.func === 0) {
		url = '/client_person_post';
	} else if (clientList.func === 1) {
		url = '/itakusaki_person_post';
	}
	// 入力値チェック
	if (clientList.clientPersonInputCheck()) {
		// formデータの取得
		var form = clientList.getFormData("clientPersonForm","person_delete_check");
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.responseType = 'json';
		xhr.onload = clientList.onloadClientPersonSave;
		xhr.send(form);
		return true;
	} else {
		return false;
	}
};
clientList.onloadClientPersonSave = function (event) {
	if (this.status == 200) {
		clientList.reloadPersonGrid(clientList.currentClient.client_cd, clientList.currentClientDivision.division_cd);
	}
};
// 得意先リスト削除分の表示チェックイベント
clientList.changeClientOption = function (event) {
	clientList.reloadGrid();
};
// 部署リスト削除分の表示チェックイベント
clientList.changeClientDivisionOption = function (event) {
	clientList.reloadDivisionGrid(clientList.currentClient.client_cd);
};
// 担当者リスト削除分の表示チェックイベント
clientList.changeClientPersonOption = function (event) {
	clientList.reloadPersonGrid(clientList.currentClient.client_cd, clientList.currentClientDivision.division_cd);
};
// 得意先リストグリッドの再ロード
clientList.reloadGrid = function () {
	$("#client_list_" + (clientList.currentClientListTabNo + 1)).GridUnload();
	clientList.createClientListGrid(clientList.currentClientListTabNo + 1,"");
};
// 部署リストグリッドの再ロード
clientList.reloadDivisionGrid = function (client_cd) {
	$("#client_division_list_" + (clientList.currentClientListTabNo + 1)).GridUnload();
	clientList.createClientDivisionListGrid(clientList.currentClientListTabNo + 1, client_cd);
};
// 担当者リストグリッドの再ロード
clientList.reloadPersonGrid = function (client_cd,division_cd) {
	$("#client_person_list_" + (clientList.currentClientListTabNo + 1)).GridUnload();
	clientList.createClientPersonListGrid(clientList.currentClientListTabNo + 1,client_cd,division_cd);
};

// 得意先情報のクリア
clientList.clearClient = function () {
	var client = {};
	client.client_cd = "";
	client.name_1 = "";
	client.name_2 = "";
	client.address_1 = "";
	client.address_2 = "";
	client.kana = "";
	client.zipcode = "";
	client.email = "";
	client.tel_no = "";
	client.fax_no = "";
	client.memo = "";
	client.delete_check = 0;
	return client;
};
// 部署情報のクリア
clientList.clearDivision = function () {
	var division = {};
	division.client_cd = "";
	division.division_cd = scheduleCommon.string_random();
	division.name = "";
	division.address_1 = "";
	division.address_2 = "";
	division.kana = "";
	division.zipcode = "";
	division.email = "";
	division.tel_no = "";
	division.fax_no = "";
	division.memo = "";
	division.billing_limit = "";
	division.payment_date = "";
	division.holiday_support = "";
	division.delete_check = 0;
	return division;
};
// 担当者情報のクリア
clientList.clearPerson = function () {
	var person = {};
	person.client_cd = "";
	person.division = "";
	person.person_id = scheduleCommon.string_random();
	person.name = "";
	person.kana = "";
	person.compellation = "様";
	person.title = "";
	person.email = "";
	person.memo = "";
	person.delete_check = 0;
	return person;
};


// 得意先情報をフォームにセットする
clientList.setClientForm = function (client) {

	$("#client_cd").val(client.client_cd);
	$("#name_1").val(client.name_1);
	$("#name_2").val(client.name_2);
	$("#address_1").val(client.address_1);
	$("#address_2").val(client.address_2);
	$("#kana").val(client.kana);
	$("#zipcode").val(client.zipcode);
	$("#email").val(client.email);
	$("#tel_no").val(client.tel_no);
	$("#fax_no").val(client.fax_no);
	$("#memo").val(client.memo);
	if (client.delete_check == 1) {
		$("#delete_check").prop("checked", true);				// 削除フラグ
	} else {
		$("#delete_check").prop("checked", false);				// 削除フラグ
	}

};
// 部署情報をフォームにセットする
clientList.setClientDivisionForm = function (division) {

	$("#division_client_cd").val(division.client_cd);
	$("#division_client_name").val(division.client_name);
	$("#division_cd").val(division.division_cd);
	$("#division_name").val(division.name);
	$("#division_address_1").val(division.address_1);
	$("#division_address_2").val(division.address_2);
	$("#division_kana").val(division.kana);
	$("#division_zipcode").val(division.zipcode);
	$("#division_email").val(division.email);
	$("#division_tel_no").val(division.tel_no);
	$("#division_fax_no").val(division.fax_no);
	$("#division_memo").val(division.memo);
	$("#billing_limit").val(division.billing_limit);
	$("#payment_date").val(division.payment_date);
	$("#holiday_support").val(division.holiday_support);
	if (division.delete_check == 1) {
		$("#division_delete_check").prop("checked", true);				// 削除フラグ
	} else {
		$("#division_delete_check").prop("checked", false);				// 削除フラグ
	}
};
// 担当者情報をフォームにセットする
clientList.setClientPersonForm = function (person) {

	$("#person_client_cd").val(person.client_cd);
	$("#person_client_name").val(person.client_name);
	$("#person_division_hidden").val(person.division_cd);
	//$("#person_division_name").val(person.division_name);
	$("#person_id").val(person.person_id);
	$("#person_name").val(person.name);
	$("#person_kana").val(person.kana);
	$("#compellation").val(person.compellation);
	$("#title").val(person.title);
	$("#person_email").val(person.email);
	$("#person_memo").val(person.memo);
	if (person.delete_check == 1) {
		$("#person_delete_check").prop("checked", true);				// 削除フラグ
	} else {
		$("#person_delete_check").prop("checked", false);				// 削除フラグ
	}
};
// 一番上のツールバーのボタン制御
clientList.buttonEnabledForTop = function(tab_no, kind) {
	if (kind == 0) {
		$("#edit_client_" + tab_no).css("display","none");
		$("#sight_" + tab_no).css("display","none");
	} else if (kind == 1) {
		$("#edit_client_" + tab_no).css("display","inline");
		$("#sight_" + tab_no).css("display","inline");
	}
};
// 真ん中のツールバーのボタン制御
clientList.buttonEnabledForMiddle = function(tab_no, kind ) {
	if (kind == 0) {
		// 全て非表示
		$("#add_client_division_" + tab_no).css("display","none");
		$("#edit_client_division_" + tab_no).css("display","none");
	} else if (kind == 1) {
		// 追加だけ表示
		$("#edit_client_division_" + tab_no).css("display","none");
		$("#add_client_division_" + tab_no).css("display","inline");
	} else if (kind == 2) {
		// 編集を表示
		$("#edit_client_division_" + tab_no).css("display","inline");
	}
};
clientList.buttonEnabledForBottom = function(tab_no, kind ) {
	if (kind == 0) {
		// 全て非表示
		$("#add_client_person_" + tab_no).css("display","none");
		$("#edit_client_person_" + tab_no).css("display","none");
	} else if (kind == 1) {
		// 追加だけ表示
		$("#edit_client_person_" + tab_no).css("display","none");
		$("#add_client_person_" + tab_no).css("display","inline");
	} else if (kind == 2) {
		// 編集を表示
		$("#edit_client_person_" + tab_no).css("display","inline");
	}
};

// 支払いサイト情報の表示
clientList.createSightInfoDialog = function () {
	$('#sight_info_dialog').dialog({
		autoOpen: false,
		width: 350,
		height: 250,
		title: '支払いサイト情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"登録": function () {
				if (clientList.saveSightInfo()) {
					$(this).dialog('close');
				}
			},
			"削除": function () {
				if (clientList.delSightInfo()) {
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
	$("#shimebi").append("<option value=0></option>");
	for(var i = 1;i <= 31;i++) {
		$("#shimebi").append("<option value=" + i + ">" + i + "</option>");
	}
	clientList.getSightMasterList();
};
// 支払いサイト情報ダイアログの表示
clientList.openSightInfoDialog = function (event) {
	$(".ui-dialog-buttonpane button:contains('登録')").button("enable");
	$(".ui-dialog-buttonpane button:contains('削除')").button("enable");
	$("#sight_info_dialog").dialog("open");
};
clientList.clearSightInfo = function() {
	var sight_info = {};
	sight_info.shimebi = 0;
	sight_info.sight_id = 0;
	sight_info.kyujitsu_setting = 0;
	return sight_info;
};
clientList.setSightInfoForm = function(sight_info) {
	$("#sight_client_cd").val(sight_info.client_cd);
	$("#shimebi").val(sight_info.shimebi);
	$("#sight_id").val(sight_info.sight_id);
	$("#kyujitsu_setting").val(sight_info.kyujitsu_setting);
}
// 支払日マスタからリストを取得する
clientList.getSightMasterList = function() {
	var url = "/sight_master?list=all";
	$.ajax(url , {
		type: 'GET',
		dataType: 'json',
		contentType : 'application/json',
		success: clientList.onGetSightMasterList
		});
};
// 支払日マスタの取得リクエスト応答
clientList.onGetSightMasterList = function(list) {
	$("#sight_id").empty();
	$("#sight_id").append($("<option value='0'></option>"));
	$.each(list,function() {
    // 選択リストに追加する
		$("#sight_id").append($("<option value='" + this.sight_id + "'>" + this.disp_str +  "</option>"));
	});

};
// 支払日サイト情報を取得する
clientList.getSightInfo = function(client_cd) {
	var url = "/sight_info?client_cd=" + client_cd + "";
	// フォームをクリアする
	var sight_info = clientList.clearSightInfo();
	sight_info.client_cd = client_cd;
	clientList.setSightInfoForm(sight_info);
	$.ajax(url , {
		type: 'GET',
		dataType: 'json',
		contentType : 'application/json',
		success: clientList.onGetSightInfo
		});
};
// 支払日サイト情報の取得リクエスト応答
clientList.onGetSightInfo = function(sight_info) {
		clientList.setSightInfoForm(sight_info);
};

// 支払いサイト情報の保存
clientList.saveSightInfo = function() {
	var url = "/sight_info_post";
	// フォームからデータを取得
	var form = new FormData(document.querySelector("#sightInfoForm"));
	form.append("delete_check", '0');
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.responseType = 'json';
	xhr.onload = clientList.onloadSaveSightInfo;
	xhr.send(form);
	return true;
}
clientList.onloadSaveSightInfo = function(event) {
	if (this.status == 200) {
		// success
	}
}

// 支払いサイト情報の削除（削除フラグセット）
clientList.delSightInfo = function() {

}

clientList.check_client_cd = function(ui,event) {
	$.ajax({type:'get',url:'/client_get?client_cd=' + $("#client_cd").val() }).then(function(client){
		if (client.client_cd == $("#client_cd").val()) {
			clientList.setClientForm(client);
			$("#message").text("入力したコードは既に登録されています。そのまま登録すると現在のデータに上書きされます。");
			$("#message_dialog").dialog("option", { title: "警告" });
			$("#message_dialog").dialog("open");
		}
	});
}
// リスト印刷
clientList.clientListPrint = function(ui) {
	var name = ui.currentTarget.id;
	var sp = name.split('_');
  window.open('/client_list_print?no=' + sp[sp.length - 1],'_blank','');
}

// CSV出力
clientList.clientListCsv = function(ui) {
	var name = ui.currentTarget.id;
	var sp = name.split('_');
	var today = scheduleCommon.getToday("{0}_{1}_{2}");
  var filename = "顧客リスト_" + today;
  var detail_text = "";
  var summary_text = "";
  var empty_line = "\r\n\r\n";
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = null;
	var text = clientList.getListText( sp[sp.length - 1]);
	blob = new Blob([bom,text], {type: "text/csv;charset=utf-8"});
	saveAs(blob,filename + ".csv");
}

// キーワード検索
clientList.searchClient = function() {
	$("#client_list_11").GridUnload();
	var keyword = $("#client_search_keyword").val();
	clientList.createClientListGrid(11, keyword);

}
// キーワード検索クリア
clientList.searchClientClear = function() {
	$("#client_list_11").GridUnload();
	$("#client_search_keyword").val("");
	clientList.createClientListGrid(11, "");

}

clientList.getListText = function(no) {
	var colnames = "得意先コード,得意先名１,得意先名２,カナ,郵便番号,住所１,住所２,電話番号,FAX番号,メールアドレス,メモ,作成日";
	var lines = [];
  lines.push(colnames);
  var grid = $("#client_list_" + no);
  // グリッドのデータを取得する
  var rows = grid.getRowData(); // 全件取得する
  $.each(rows,function(index,row) {
    var text = scheduleCommon.setQuotation(row.client_cd) + "," +
    scheduleCommon.setQuotation(row.name_1) + "," +
    scheduleCommon.setQuotation(row.name_2) + "," +
    scheduleCommon.setQuotation(row.kana) + "," +
    scheduleCommon.setQuotation(row.zipcode) + "," +
    scheduleCommon.setQuotation(row.address_1) + "," +
    scheduleCommon.setQuotation(row.address_2) + "," +
    scheduleCommon.setQuotation(row.tel_no) + "," +
    scheduleCommon.setQuotation(row.fax_no) + "," +
    scheduleCommon.setQuotation(row.email) + "," +
    scheduleCommon.setQuotation(row.memo) + "," +
    scheduleCommon.setQuotation(row.created)
		lines.push(text);
  });
	return lines.join("\r\n");

}
