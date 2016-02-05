//
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
	for(var i = 1;i <= 10;i++) {
		var target = "#tabs-" + i;
		$(target).empty();
		// Tab毎に必要な要素を追加する
		if (toolbar)
			clientList.createToolbar(target, "client", i);
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
		}
	}
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

};
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
		activate: function (event, ui) {
			var no = ui.newTab.index() + 1;
			clientList.currentClientListTabNo = ui.newTab.index();
			clientList.createClientListGrid(no);
			clientList.createClientDivisionListGrid(no, '0');
			clientList.createClientPersonListGrid(no, '0', '0');
		}
	});
};
// 得意先リストの生成
clientList.createClientListGrid = function (no) {
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
	// 得意先リストのグリッド
	jQuery("#client_list_" + no).jqGrid({
		url: url + '?no=' + no + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: [fname + 'コード', fname + '名１', fname + '名２', 'カナ','郵便番号','住所１', '住所２','電話番号','FAX番号','メールアドレス','メモ','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', width: 80, align: "center" },
			{ name: 'name_1', index: 'name_1', width: 200, align: "left" },
			{ name: 'name_2', index: 'name_2', width: 100, align: "left" },
			{ name: 'kana', index: 'kana', width: 100 , align: "left" },
			{ name: 'zipcode', index: 'zipcode', width: 80 , align: "center" },
			{ name: 'address_1', index: 'address_1', width: 200 , align: "left" },
			{ name: 'address_2', index: 'address_2', width: 200, align: "left" },
			{ name: 'tel_no', index: 'tel_no', width: 80 , align: "center" },
			{ name: 'fax_no', index: '', width: 80 , align: "center"  },
			{ name: 'email', index: 'email', width: 80 , align: "center"  },
			{ name: 'memo', index: '', width: 100 , align: "center"  },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' , formatter: scheduleCommon.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', formatter: scheduleCommon.personFormatter  },
		],
		height: "230px",
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10],
		pager: '#client_list_pager_' + no,
		sortname: 'client_cd',
		viewrecords: true,
		sortorder: "desc",
		caption: fname + "リスト",
		onSelectRow: clientList.onSelectClientList
	});
	jQuery("#client_list_" + no).jqGrid('navGrid', '#client_list_pager_' + no, { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
	// ツールバーボタンの制御
	clientList.buttonEnabledForTop(no,0);
	clientList.buttonEnabledForMiddle(no,0);
	clientList.buttonEnabledForBottom(no,0);
};
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
		colNames: ['クライアントCD','部署コード','部署名', 'カナ','郵便番号','住所１', '住所２','電話番号','FAX番号','メールアドレス','請求締日','支払日','休日対応','メモ','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', hidden: true },
			{ name: 'division_cd', index: 'division_cd', width:80, align: 'left' },
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
		],
		height: "115px",
		shrinkToFit:false,
		rowNum: 5,
		rowList: [5],
		pager: '#client_division_list_pager_' + no,
		sortname: 'division_cd',
		viewrecords: true,
		sortorder: "desc",
		caption: "部署リスト",
		onSelectRow: clientList.onSelectClientDivisionList
	});
	jQuery("#client_division_list_" + no).jqGrid('navGrid', '#client_division_list_pager_' + no, { edit: false, add: false, del: false });
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
		colNames: ['','','担当者コード','担当者名', 'カナ','敬称','役職名','メールアドレス','メモ','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', hidden: true },
			{ name: 'division_cd', index: 'division_cd', hidden: true },
			{ name: 'person_id', index: 'person_id', width: 100 , align: "left" },
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
		],
		height: "115px",
		shrinkToFit:false,
		rowNum: 5,
		rowList: [5],
		pager: '#client_person_list_pager_' + no,
		sortname: 'person_id',
		viewrecords: true,
		sortorder: "desc",
		caption: "担当者リスト",
		onSelectRow: clientList.onSelectClientPersonList
	});
	jQuery("#client_person_list_" + no).jqGrid('navGrid', '#client_person_list_pager_' + no, { edit: false, add: false, del: false });
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
		height: 500,
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

		$("#client_person_dialog").dialog("open");
	}
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
	clientList.createClientListGrid(clientList.currentClientListTabNo + 1);
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
	division.division_cd = "";
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
	person.person_id = "";
	person.name = "";
	person.kana = "";
	person.compellation = "";
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
	$("#delete_check").val(client.delete_check);
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
	$("#division_delete_check").val(division.delete_check);
};
// 担当者情報をフォームにセットする
clientList.setClientPersonForm = function (person) {

	$("#person_client_cd").val(person.client_cd);
	$("#person_client_name").val(person.client_name);
	$("#person_division_cd").val(person.division_cd);
	$("#person_division_name").val(person.division_name);
	$("#person_id").val(person.person_id);
	$("#person_name").val(person.name);
	$("#person_kana").val(person.kana);
	$("#compellation").val(person.compellation);
	$("#title").val(person.title);
	$("#person_email").val(person.email);
	$("#person_memo").val(person.memo);
	$("#person_delete_check").val(person.delete_check);
};
// 一番上のツールバーのボタン制御
clientList.buttonEnabledForTop = function(tab_no, kind) {
	if (kind == 0) {
		$("#edit_client_" + tab_no).css("display","none");
	} else if (kind == 1) {
		$("#edit_client_" + tab_no).css("display","inline");
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
