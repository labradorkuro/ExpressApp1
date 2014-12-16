﻿//
// DRC殿試験案件スケジュール管理
// 案件リスト画面の処理
//
$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$("#tabs").tabs();
	$("#tabs-client").tabs();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	entryList.createMessageDialog();
	// 必要な情報をDBから取得する
	scheduleCommon.getUserInfo();
	scheduleCommon.getDivisionInfo();
	// 編集用ダイアログの設定
	entryList.createEntryDialog();
	entryList.createQuoteDialog();
	entryList.createQuoteFormDialog();
	entryList.createClientListDialog();
	entryList.createGrid();
	entryList.createTestGrid(0);
	for (var i = 1; i <= 12; i++) {
		entryList.createClientListGrid(i);
	}
	scheduleCommon.changeFontSize('1.0em');
	// 案件追加ボタンイベント（登録・編集用画面の表示）
	$("#add_entry").bind('click' , {}, entryList.openEntryDialog);
	// 案件編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_entry").bind('click' , {}, entryList.openEntryDialog);
	// 明細追加ボタンイベント（登録・編集用画面の表示）
	$("#add_quote").bind('click' , {}, entryList.openQuoteDialog);
	// 明細編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_quote").bind('click' , {}, entryList.openQuoteDialog);
	// 見積書発行用フォームを表示する
	$("#print_quote").bind('click' , {}, entryList.openQuoteFormDialog);
	// クライアント選択を表示する
	$("#client_cd").bind('click' , {}, entryList.openClientListDialog);
	// オーバーレイ表示する（元の画面全体をグレー表示にする）	
//	$("body").append("<div id='graylayer'></div><div id='overlayer'></div>");

	entryList.enableQuoteButtons(false);
});
//
// 案件リスト処理
//
var entryList = entryList || {};
entryList.currentEntryNo = 0;

// メッセージ表示用ダイアログの生成
entryList.createMessageDialog = function () {
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
// 案件入力用ダイアログの生成
entryList.createEntryDialog = function () {
	$('#entry_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 600,
		title: '案件情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (entryList.saveEntry()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (entryList.saveEntry()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// 明細入力用ダイアログの生成
entryList.createQuoteDialog = function () {
	$('#quote_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 600,
		title: '試験（見積）明細',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (entryList.saveQuote()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (entryList.saveQuote()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// クライアント選択用ダイアログの生成
entryList.createClientListDialog = function () {
	$('#client_list_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 600,
		title: '受注先選択',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"選択": function () {
				if (entryList.selectClient()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 見積書用ダイアログの生成
entryList.createQuoteFormDialog = function () {
	$('#quoteForm_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 600,
		title: '見積書',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"印刷": function () {
				if (entryList.printQuote()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
entryList.createGrid = function () {
	// 案件リストのグリッド
	jQuery("#entry_list").jqGrid({
		url: '/entry_get',
		altRows: true,
		datatype: "json",
		colNames: ['案件No','案件名','問合せ日', '案件ステータス', '拠点CD','担当者','見積番号','見積発行日'
				,'受注日','仮受注チェック','受注区分','試験課','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'entry_title', index: 'entry_title', width: 200, align: "center" },
			{ name: 'inquiry_date', index: 'inquiry_date', width: 80, align: "center" },
			{ name: 'entry_status', index: 'entry_status', width: 100 ,formatter: entryList.statusFormatter},
			{ name: 'base_cd', index: 'base_cd', width: 100, align: "center" ,formatter: entryList.base_cdFormatter},
			{ name: 'person_id', index: 'person_id', width: 100, align: "center", formatter: entryList.personFormatter },
			{ name: 'quoto_no', index: 'quoto_no', width: 80, align: "center" },
			{ name: 'quoto_issue_date', index: 'quoto_issue_date', width: 80, align: "center" },
			{ name: 'order_accepted_date', index: 'order_accepted_date', width: 80, align: "center" },
			{ name: 'order_accept_check', index: 'order_accept_check', width: 80, align: "center" },
			{ name: 'order_type', index: 'order_type', width: 100, align: "center" },
			{ name: 'division_name', index: 'division_name', width: 100, align: "center" },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' , formatter: entryList.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', formatter: entryList.personFormatter  },
		],
		rowNum: 10,
		rowList: [10],
		pager: '#entry_pager',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "desc",
		caption: "案件リスト",
		onSelectRow:entryList.onSelectEntry
	});
	jQuery("#entry_list").jqGrid('navGrid', '#entry_pager', { edit: false, add: false, del: false });
};
entryList.createTestGrid = function (no) {
	jQuery("#test_list").jqGrid({
		url: '/quote_get/' + no,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','見積番号', '明細番号','試験項目CD', '試験項目名','試料名','到着日','計画書番号',
			'被験者数','検体数','報告書番号','報告書提出期限','報告書提出日',
			'速報提出期限１','速報提出日１','速報提出期限２','速報提出日２','期待値/設定値',
			'値説明','単位CD','単位','単価','数量','見積金額','備考','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no' , index: 'entry_no', width: 80, align: "center" }, // 案件番号
			{ name: 'quote_no' , index: 'quote_no', width: 80, align: "center" }, // 見積番号
			{ name: 'quote_detail_no', index: 'quote_detail_no', width: 80, align: "center" }, // 明細番号
			{ name: 'test_item_cd', index: 'test_item_cd', width: 120 }, // 試験項目CD
			{ name: 'test_item', index: 'test_item', width: 120 }, // 試験項目名
			{ name: 'sample_name', index: 'sample_name', width: 120 }, // 試料名
			{ name: 'arrive_date', index: 'arrive_date', width: 80, align: "center" }, // 到着日
			{ name: 'test_planning_no', index: 'test_planning_no', width: 120 }, // 試験計画書番号
			{ name: 'monitors_num', index: 'monitors_num', width: 60,align:"right" }, // 被験者数
			{ name: 'sample_volume', index: 'sample_volume', width: 60, align: "right" }, // 検体数
			{ name: 'final_report_no', index: 'final_report_no', width: 120 }, // 報告書番号
			{ name: 'final_report_limit', index: 'final_report_limit', width: 80, align: "center" }, // 報告書提出期限
			{ name: 'final_report_date', index: 'final_report_date', width: 80, align: "center" }, // 報告書提出日
			{ name: 'quick_report_limit1', index: 'quick_report_limit1', width: 80, align: "center" }, // 速報提出期限1
			{ name: 'quick_report_date1', index: 'quick_report_date1', width: 80, align: "center" }, // 速報提出日1
			{ name: 'quick_report_limit2', index: 'quick_report_limit2', width: 80, align: "center" }, // 速報提出期限2
			{ name: 'quick_report_date2', index: 'quick_report_date2', width: 80, align: "center" }, // 速報提出日2
			{ name: 'expect_value', index: 'expect_value', width: 80,align:"right"}, // 期待値・設定値
			{ name: 'descript_value', index: 'descript_value', width: 120 }, // 値説明
			{ name: 'unit_cd', index: 'unit', width: 60,align:"center" }, // 単位CD
			{ name: 'unit', index: 'unit', width: 60,align:"center" }, // 単位
			{ name: 'unit_price', index: 'unit_price', width: 60,align:"right" }, // 単価
			{ name: 'quantity', index: 'quantity', width: 60,align:"right" }, // 数量
			{ name: 'quote_price', index: 'quote_price', width: 60,align:"right" }, // 見積金額
			{ name: 'test_memo', index: 'test_memo', width: 120 }, // 備考
			{ name: 'created', index: 'created', width: 120 }, // 作成日
			{ name: 'created_id', index: 'created_id', width: 120 }, // 作成者ID
			{ name: 'updated', index: 'updated', width: 120 }, // 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },			// 更新者ID
		],
		rowNum: 10,
		rowList: [10],
		pager: '#test_list_pager',
		sortname: 'quote_detail_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "試験（見積）情報"
	});
	jQuery("#test_list").jqGrid('navGrid', '#test_list_pager', { edit: false, add: false, del: false });
};

// 得意先リストの生成
entryList.createClientListGrid = function (no) {
	// 得意先リストのグリッド
	jQuery("#client_list_" + no).jqGrid({
		url: '/client_get?no=' + no,
		altRows: true,
		datatype: "json",
		colNames: ['得意先コード','得意先名１','得意先名２', '住所１', '住所２','担当者','所属部署','役職'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', width: 80, align: "center" },
			{ name: 'name_1', index: 'name_1', width: 200, align: "center" },
			{ name: 'name_2', index: 'name_2', width: 80, align: "center" },
			{ name: 'address_1', index: 'address_1', width: 100 , formatter: entryList.statusFormatter },
			{ name: 'address_2', index: 'address_2', width: 100, align: "center" , formatter: entryList.base_cdFormatter },
			{ name: 'prepared_name', index: 'prepared_name', width: 100, align: "center", formatter: entryList.personFormatter },
			{ name: 'prepared_division', index: 'prepared_division', width: 80, align: "center" },
			{ name: 'prepared_title', index: 'prepared_title', width: 80, align: "center" },
		],
		height: "260px",
		width:"100%",
		rowNum: 10,
		rowList: [10],
		pager: '#client_list_pager_' + no,
		sortname: 'client_cd',
		viewrecords: true,
		sortorder: "desc",
		caption: "得意先リスト",
		onSelectRow: entryList.onSelectClientList
	});
	jQuery("#client_list_" + no).jqGrid('navGrid', '#client_list_pager_' + no, { edit: false, add: false, del: false });
};
entryList.personFormatter = function (cellval, options, rowObject) {
	var name = "";
	if (cellval === "drc_admin") {
		return "管理者";
	}
	for (var i in scheduleCommon.user_list) {
		if (cellval === scheduleCommon.user_list[i].uid) {
			name = scheduleCommon.user_list[i].name;
			break;
		}
	}
	return name;
};
// 拠点CD
entryList.base_cdFormatter = function (cellval, options, rowObject) {
	return scheduleCommon.getBase_cd(cellval);
};
// 案件ステータスのフォーマッター
entryList.statusFormatter = function (cellval, options, rowObject) {
	return scheduleCommon.getEntry_status(cellval);
};
// 編集用ダイアログの表示
entryList.openEntryDialog = function (event) {
	
	var entry = entryList.clearEntry();
	entryList.setEntryForm(entry);
	if ($(event.target).attr('id') == 'edit_entry') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		var no = entryList.getSelectEntry();
		entryList.requestEntryData(no);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}

	$("#entry_dialog").dialog("open");
};
// 編集用ダイアログの表示
entryList.openQuoteDialog = function (event) {
	var quote = {};
	quote.quote_no = '';
	entryList.clearQuoteFormData(quote);
	if ($(event.target).attr('id') == 'edit_quote') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		var quote = entryList.getSelectQuote();
		entryList.setQuoteFormData(quote);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}
	$("#quote_dialog").dialog("open");
};
// クライアント参照ダイアログ表示
entryList.openClientListDialog = function (event) {
	$("#client_list_dialog").dialog("open");
};
// 見積書ダイアログ表示
entryList.openQuoteFormDialog = function (event) {
	var quote = {};
	quote.quote_no = '';
	$("#quoteForm_dialog").dialog("open");
};
// 案件データの読込み
entryList.requestEntryData = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/entry_get/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = entryList.onloadEntryReq;
	xhr.send();
};
// 案件データの保存
entryList.saveEntry = function () {
	// 入力値チェック
	if (!entryList.entryInputCheck()) {
		return false;
	}
	// checkboxのチェック状態確認と値設定
	entryList.checkCheckbox();
	// formデータの取得
	var form = entryList.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/entry_post', true);
	xhr.responseType = 'json';
	xhr.onload = entryList.onloadEntrySave;
	xhr.send(form);
	return true;
};

// checkboxのチェック状態確認と値設定
entryList.checkCheckbox = function () {
	if ($("#delete_check:checked").val()) {
		$("#delete_check").val('1');
	}
	if ($("#input_check:checked").val()) {
		$("#input_check").val('1');
	}
	if ($("#confirm_check:checked").val()) {
		$("#confirm_check").val('1');
	}
};
entryList.entryInputCheck = function () {
	var result = true;
	if ($("#entry_title").val() == "") {
		// 案件名
		$("#message").text("案件名が未入力です。");
		result = false;
	}
	// 数値項目チェック	
	else if ($("#entry_amount_price").val() == ""){
		// 案件合計金額
		$("#message").text("案件合計金額が未入力です。");
		result = false;
	}
	else if ($("#entry_amount_billing").val() == "") {
		// 案件請求金額合計
		$("#message").text("案件請求金額合計が未入力です。");
		result = false;
	}
	else if ($("#entry_amount_deposit").val() == "") {
		// 案件入金金額合計
		$("#message").text("案件入金金額合計が未入力です。");
		result = false;
	}
	else if ($("#drc_substituted_amount").val() == "") {
		$("#message").text("DRC立替準備金額が未入力です。");
		result = false;
	}
	else if ($("#pay_amount_1").val() == "") {
		$("#message").text("分割支払合計金額1が未入力です。");
		result = false;
	}
	else if ($("#pay_amount_2").val() == "") {
		$("#message").text("分割支払合計金額2が未入力です。");
		result = false;
	}
	else if ($("#pay_amount_3").val() == "") {
		$("#message").text("分割支払合計金額3が未入力です。");
		result = false;
	}
	else if ($("#pay_amount_4").val() == "") {
		$("#message").text("分割支払合計金額4が未入力です。");
		result = false;
	}
	else if ($("#pay_amount_5").val() == "") {
		$("#message").text("分割支払合計金額5が未入力です。");
		result = false;
	}
	if (!result) {
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// formデータの取得
entryList.getFormData = function () {
	var form = new FormData(document.querySelector("#entryForm"));

	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#delete_check:checked").val()) {
		form.append('delete_check', '0');
	}
	if (!$("#input_check:checked").val()) {
		form.append('input_check', '0');
	}
	if (!$("#confirm_check:checked").val()) {
		form.append('confirm_check', '0');
	}
	return form;
};

// 案件データ保存後のコールバック
entryList.onloadEntrySave = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		$("#entry_list").GridUnload();
		entryList.createGrid();
	}
};
// 案件データ取得リクエストのコールバック
entryList.onloadEntryReq = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		// formに取得したデータを埋め込む
		entryList.setEntryForm(entry);				
	}
};

// 案件データをフォームにセットする
entryList.setEntryForm = function (entry) {
	$("#entry_no").val(entry.entry_no); // 案件No
	$("#base_cd").val(entry.base_cd); // 拠点CD
	$("#entry_title").val(entry.entry_title); // 案件名
	$("#inquiry_date").val(entry.inquiry_date); // 問合せ日
	$("#entry_status").val(entry.entry_status); // 案件ステータス
	$("#quote_no").val(entry.quote_no); // 見積番号
	$("#quote_issue_date").val(entry.quote_issue_date); // 見積書発行日
	$("#order_accepted_date").val(entry.order_accepted_date); // 受注日付
	$("#order_accept_check").val(entry.order_accept_check); // 仮受注日チェック
	$("#acounting_period_no").val(entry.acounting_period_no); // 会計期No
	$("#order_type").val(entry.order_type); // 受託区分
	$("#contract_type").val(entry.contract_type); // 契約区分
	$("#outsourcing_cd").val(entry.outsourcing_cd); // 委託先CD
	$("#division").val(entry.division); // 事業部ID
	$("#entry_amount_price").val(entry.entry_amount_price); // 案件合計金額
	$("#entry_amount_billing").val(entry.entry_amount_price); // 案件請求合計金額
	$("#entry_amount_deposit").val(entry.entry_amount_billing); // 案件入金合計金額
	$("#monitors_cost_prep_limit").val(entry.monitors_cost_prep_limit); // 被験者費用準備期日
	$("#monitors_cost_prep_comp").val(entry.monitors_cost_prep_comp); // 被験者費用準備完了日
	$("#drc_substituted_amount").val(entry.drc_substituted_amount); // DRC立替準備金額
	$("#prior_payment_limit").val(entry.prior_payment_limit); // 事前入金期日
	$("#prior_payment_accept").val(entry.prior_payment_accept); // 事前入金日
	$("#pay_planning_date_1").val(entry.pay_planning_date_1);	// 分割請求日1
	$("#pay_complete_date_1").val(entry.pay_complete_date_1);	// 分割入金日1
	$("#pay_amount_1").val(entry.pay_amount_1);					// 分割支払合計金額1
	$("#pay_result_1").val(entry.pay_result_1);					// 分割請求区分1
	$("#pay_planning_date_2").val(entry.pay_planning_date_2);	// 分割請求日2
	$("#pay_complete_date_2").val(entry.pay_complete_date_2);	// 分割入金日2
	$("#pay_amount_2").val(entry.pay_amount_2);					// 分割支払合計金額2
	$("#pay_result_2").val(entry.pay_result_2);					// 分割請求区分2
	$("#pay_planning_date_3").val(entry.pay_planning_date_3);	// 分割請求日3
	$("#pay_complete_date_3").val(entry.pay_complete_date_3);	// 分割入金日3
	$("#pay_amount_3").val(entry.pay_amount_3);					// 分割支払合計金額3
	$("#pay_result_3").val(entry.pay_result_3);					// 分割請求区分3
	$("#pay_planning_date_4").val(entry.pay_planning_date_4);	// 分割請求日4
	$("#pay_complete_date_4").val(entry.pay_complete_date_4);	// 分割入金日4
	$("#pay_amount_4").val(entry.pay_amount_4);					// 分割支払合計金額4
	$("#pay_result_4").val(entry.pay_result_4);					// 分割請求区分4
	$("#pay_planning_date_5").val(entry.pay_planning_date_5);	// 分割請求日5
	$("#pay_complete_date_5").val(entry.pay_complete_date_5);	// 分割入金日5
	$("#pay_amount_5").val(entry.pay_amount_5);					// 分割支払合計金額5
	$("#pay_result_5").val(entry.pay_result_5);					// 分割請求区分5
	$("#person_id").val(entry.person_id); // 担当者ID
	$("#delete_check").val(entry.delete_check); // 削除フラグ
	$("#delete_reason").val(entry.delete_reason); // 削除理由
	$("#input_check_date").val(entry.input_check_date); // 入力日
	$("#input_check").val(entry.input_check); // 入力完了チェック
	$("#input_operator_id").val(entry.input_operator_id); // 入力者ID
	$("#confirm_check_date").val(entry.confirm_check_date); // 確認日
	$("#confirm_check").val(entry.confirm_check); // 確認完了チェック
	$("#confirm_operator_id").val(entry.confirm_operator_id); // 確認者ID
	$("#created").val(entry.created);						// 作成日
	$("#created_id").val(entry.created_id); // 作成者ID
	$("#updated").val(entry.updated);						// 更新日
	$("#updated_id").val(entry.updated_id);						// 更新者ID
};
entryList.clearEntry = function () {
	var entry = {} ;
	entry.entry_no = ""; // 案件No
	entry.base_cd = "01"; // 拠点CD
	entry.entry_title = ""; // 案件名
	entry.inquiry_date = ""; // 問合せ日
	entry.entry_status = "01"; // 案件ステータス
	entry.quote_no = ""; // 見積番号
	entry.quote_issue_date = ""; // 見積書発行日
	entry.order_accepted_date = ""; // 受注日付
	entry.order_accept_check = 0; // 仮受注日チェック
	entry.acounting_period_no = 1; // 会計期No
	entry.order_type = 0; // 受託区分
	entry.contract_type = 1; // 契約区分
	entry.outsourcing_cd = ""; // 委託先CD
	entry.division  = "01"; // 事業部ID
	entry.entry_amount_price = 0; // 案件合計金額
	entry.entry_amount_price = 0; // 案件請求合計金額
	entry.entry_amount_billing = 0; // 案件入金合計金額
	entry.monitors_cost_prep_limit = ""; // 被験者費用準備期日
	entry.monitors_cost_prep_comp = ""; // 被験者費用準備完了日
	entry.drc_substituted_amount = 0; // DRC立替準備金額
	entry.prior_payment_limit = ""; // 事前入金期日
	entry.prior_payment_accept = ""; // 事前入金日
	entry.pay_planning_date_1 = "";	// 分割請求日1
	entry.pay_complete_date_1 = "";	// 分割入金日1
	entry.pay_amount_1 = 0;			// 分割支払合計金額1
	entry.pay_result_1 = 0;			// 分割請求区分1
	entry.pay_planning_date_2 = "";	// 分割請求日2
	entry.pay_complete_date_2 = "";	// 分割入金日2
	entry.pay_amount_2 = 0;			// 分割支払合計金額2
	entry.pay_result_2 = 0;			// 分割請求区分2
	entry.pay_planning_date_3 = "";	// 分割請求日3
	entry.pay_complete_date_3 = "";	// 分割入金日3
	entry.pay_amount_3 = 0;			// 分割支払合計金額3
	entry.pay_result_3 = 0;			// 分割請求区分3
	entry.pay_planning_date_4 = "";	// 分割請求日4
	entry.pay_complete_date_4 = "";	// 分割入金日4
	entry.pay_amount_4 = 0;			// 分割支払合計金額4
	entry.pay_result_4 = 0;			// 分割請求区分4
	entry.pay_planning_date_5 = "";	// 分割請求日5
	entry.pay_complete_date_5 = "";	// 分割入金日5
	entry.pay_amount_5 = 0;			// 分割支払合計金額5
	entry.pay_result_5 = 0;			// 分割請求区分5
	entry.person_id = ""; // 担当者ID
	entry.delete_check = 0; // 削除フラグ
	entry.delete_reason = ""; // 削除理由
	entry.input_check_date = ""; // 入力日
	entry.input_check = 0; // 入力完了チェック
	entry.input_operator_id = ""; // 入力者ID
	entry.confirm_check_date = ""; // 確認日
	entry.confirm_check = 0; // 確認完了チェック
	entry.confirm_operator_id = ""; // 確認者ID
	entry.created = "";						// 作成日
	entry.created_id = ""; // 作成者ID
	entry.updated = "";						// 更新日
	entry.updated_id = "";						// 更新者ID
	return entry;
};
// 編集用画面の表示
entryList.openEditWindow = function(sender) {
	$("#graylayer").show();
	var no = '';

	if ($(sender.target).attr('id') == 'edit_entry') {
		no = entryList.getSelectEntry();
	}
	var margin_top = $("#overlayer").height() / 2;
	var margin_left = $("#overlayer").width() / 2;
	// 表示する内容を読込む
	$("#overlayer").show().html("<iframe id='entry_modal' src='entry_edit/" + no + "'></iframe>").css({"margin-top":"-" + margin_top + "px","margin-left":"-" + margin_left + "px"});
	//$("#overlayer img.close").click(function(){
	//	$("#overlayer").hide();
	//	$("#graylayer").hide();
	//});
	return false;
};

// 案件リストで選択中の案件番号を取得する
entryList.getSelectEntry = function () {
	var no = "";
	var id = $("#entry_list").getGridParam('selrow');
	if (id != null) {
		var row = $("#entry_list").getRowData(id);
		no = row.entry_no;
	}
	return no;
};

// 案件リストの選択イベント処理
entryList.onSelectEntry = function (rowid) {
	var no;
	if (rowid != null) {
		var row = $("#entry_list").getRowData(rowid);
		no = row.entry_no;
		entryList.enableQuoteButtons(true);
	}
	// グリッドの再表示
	$("#test_list").GridUnload();
	entryList.createTestGrid(no);
	entryList.currentEntryNo = no;
};
// 明細追加、編集ボタンの表示・非表示
entryList.enableQuoteButtons = function(enable) {
	if (enable) {
		$("#add_quote").css("display", "inline");
		$("#edit_quote").css("display", "inline");
	} else {
		$("#add_quote").css("display", "none");
		$("#edit_quote").css("display", "none");
	}
};
entryList.getSelectQuote = function () {
	var grid = $("#test_list");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};
entryList.clearQuoteFormData = function (quote) {
	$('#quote_no_dlg').val(quote.quote_no); // 見積番号
	$('#quote_detail_no').val('');			// 明細番号
	$('#test_item_cd').val('');				// 試験項目CD
	$('#test_item').val('');				// 試験項目名
	$('#sample_name').val('');				// 試料名
	$('#arrive_date').val('');				// 到着日
	$('#test_planning_no').val('');			// 試験計画書番号
	$('#monitors_num').val('');				// 被験者数
	$('#sample_volume').val('');			// 検体数
	$('#final_report_no').val('');			// 報告書番号
	$('#final_report_limit').val('');		// 報告書提出期限
	$('#final_report_date').val('');		// 報告書提出日
	$('#quick_report_limit1').val('');		// 速報提出期限1
	$('#quick_report_date1').val('');		// 速報提出日1
	$('#quick_report_limit2').val('');		// 速報提出期限2
	$('#quick_report_date2').val('');		// 速報提出日2
	$('#expect_value').val('');				// 期待値・設定値
	$('#descript_value').val('');			// 値説明
	$('#unit_cd').val('01');				// 単位CD
	$('#unit').val('');						// 単位
	$('#unit_price').val('0');				// 単価
	$('#quantity').val('0');				// 数量
	$('#quote_price').val('0');				// 見積金額
	$('#test_memo').val('');				// 備考
	$('#quote_delete_check').val(0);		// 削除フラグ
	$('#quote_delete_reason').val('');		// 削除理由
};
entryList.setQuoteFormData = function (quote) {
	$('#quote_no_dlg').val(quote.quote_no);				// 見積番号
	$('#quote_detail_no').val(quote.quote_detail_no);	// 明細番号
	$('#test_item_cd').val(quote.test_item_cd);			// 試験項目CD
	$('#test_item').val(quote.test_item);				// 試験項目名
	$('#sample_name').val(quote.sample_name);			// 試料名
	$('#arrive_date').val(quote.arrive_date);			// 到着日
	$('#test_planning_no').val(quote.test_planning_no); // 試験計画書番号
	$('#monitors_num').val(quote.monitors_num);			// 被験者数
	$('#sample_volume').val(quote.sample_volume);		// 検体数
	$('#final_report_no').val(quote.final_report_no);	// 報告書番号
	$('#final_report_limit').val(quote.final_report_limit);		// 報告書提出期限
	$('#final_report_date').val(quote.final_report_date);		// 報告書提出日
	$('#quick_report_limit1').val(quote.quick_report_limit1);	// 速報提出期限1
	$('#quick_report_date1').val(quote.quick_report_date1);		// 速報提出日1
	$('#quick_report_limit2').val(quote.quick_report_limit2);	// 速報提出期限2
	$('#quick_report_date2').val(quote.quick_report_date2);		// 速報提出日2
	$('#expect_value').val(quote.expect_value);					// 期待値・設定値
	$('#descript_value').val(quote.descript_value);		// 値説明
	$('#unit_cd').val(quote.unit_cd);					// 単位
	$('#unit').val(quote.unit);							// 単位
	$('#unit_price').val(quote.unit_price);				// 単価
	$('#quantity').val(quote.quantity);					// 数量
	$('#quote_price').val(quote.quote_price);			// 見積金額
	$('#test_memo').val(quote.test_memo);				// 備考
	$('#quote_delete_check').val(quote.quote_delete_check);		// 削除フラグ
	$('#quote_delete_reason').val(quote.quote_delete_reason);	// 削除理由
};
// 試験（見積）データの保存
entryList.saveQuote = function () {
	// 入力値チェック
	if (!entryList.quoteInputCheck()) {
		return false;
	}
	// checkboxのチェック状態確認と値設定
	entryList.checkQuoteCheckbox();
	// formデータの取得
	var form = entryList.getQuoteFormData();
	// 案件番号をフォームデータに追加する
	form.append('entry_no', entryList.currentEntryNo);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/quote_post', true);
	xhr.responseType = 'json';
	xhr.onload = entryList.onloadQuoteReq;
	xhr.send(form);
	return true;
};
entryList.quoteInputCheck = function () {
	var result = true;
	if ($("#test_item").val() == "") {
		// 試験項目名名
		$("#message").text("試験項目名が未入力です。");
		result = false;
	}
	if (!result) {
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// checkboxのチェック状態確認と値設定
entryList.checkQuoteCheckbox = function () {
	if ($("#quote_delete_check:checked").val()) {
		$("#quote_delete_check").val('1');
	}
};
// formデータの取得
entryList.getQuoteFormData = function () {
	var form = new FormData(document.querySelector("#quoteForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#quote_delete_check:checked").val()) {
		form.append('quote_delete_check', '0');
	}
	return form;
};
entryList.onloadQuoteReq = function (e) {
	if (this.status == 200) {
		var quote = this.response;
		$('#quote_no_dlg').val(quote.quote_no);
		$('#quote_detail_no').val(quote.quote_detail_no);
		// グリッドの再表示
		$("#test_list").GridUnload();
		entryList.createTestGrid(entryList.currentEntryNo);

	}
};

// 見積書の印刷（PDF生成）
entryList.printQuote = function () {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/print_pdf/' + entryList.currentEntryNo, true);
	xhr.responseType = 'application/pdf';
	xhr.onload = entryList.onloadPrintPDFReq;
	xhr.send();
};
entryList.onloadPrintPDFReq = function () {
};

entryList.accordion = function () {
};