//
// DRC殿試験案件スケジュール管理
// 案件リスト画面の処理
//
$(function() {
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 案件リストのタブ生成
	$("#tabs").tabs();
	// 得意先選択ダイアログ用のタブ生成
	entryList.createClientListTabs();
	// 日付選択用設定
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
	// 検索用オプションの初期化	
	$("#entry_status_01").prop("checked", true);
	$("#entry_status_02").prop("checked", true);
	$("#entry_status_03").prop("checked", true);
	$("#entry_status_04").prop("checked", true);
	// グリッドの生成
	entryList.createGrid();
	entryList.createTestGrid(0);
	// 得意先選択用グリッドの生成
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
	
	// 削除分を表示のチェックイベント
	$("#entry_delete_check_disp").bind('change', entryList.changeEntryOption);
	$("#quote_delete_check_disp").bind('change', entryList.changeQuoteOption);
	
	$("#entry_status_01").bind('change', entryList.changeEntryOption);
	$("#entry_status_02").bind('change', entryList.changeEntryOption);
	$("#entry_status_03").bind('change', entryList.changeEntryOption);
	$("#entry_status_04").bind('change', entryList.changeEntryOption);

});

//
// 案件入力、リスト表示に関する処理
//
var entryList = entryList || {};
entryList.currentEntryNo = 0;	// 案件リストで選択中の案件の番号
entryList.currentClientListTabNo = 0;	// 得意先リストで選択中のタブ番号
entryList.currentClient = {};			// 選択中の得意先情報

// 得意先リストのタブ生成と選択イベントの設定
entryList.createClientListTabs = function () {
	$("#tabs-client").tabs({
		activate: function (event, ui) {
			entryList.currentClientListTabNo = ui.newTab.index();
		}
	});
};
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
		width: 910,
		height: 600,
		title: '見積書',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"印刷": function () {
				// 印刷用データを作成する
				var data = entryList.printDataSetup();
				// データを渡してPDFを生成する
				if (entryList.printQuote(data)) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// 見積書用データの生成
entryList.printDataSetup = function () {
	// 印刷用データ
	var data = {
		title: '御 見 積 書',
		quote_issue_date: $("#billing_date").val(),
		quote_no: $("#quote_no").val(),
		drc_address1: '〒530-0044 大阪市北区東天満2-10-31　第9田淵ビル3F',
		drc_tel: 'TEL：06-6882-8201',
		drc_fax: 'FAX：06-6882-8202',
		drc_name: 'DRC株式会社',
		drc_division_name: $("#drc_division_name").text(),
		drc_prepared: $("#drc_prepared").text(),
		client_name_1: $("#billing_company_name_1").val(),	// 請求先情報
		client_name_2: $("#billing_company_name_2").val(),	// 請求先情報
		prepared_division: $("#billing_division").val(),	// 請求先情報
		prepared_name: $("#prepared_name").val(),			// 請求先情報
		quote_title: $("#quote_title").val(),
		quote_title1: $("#quote_title1").val(),
		quote_title2: $("#quote_title2").val(),
		quote_title3: $("#quote_title3").val(),
		quote_expire: $("#quote_expire").val(),
		quote_total_price: $("#quote_total_price").val(),
		rows: [{ name: '試験明細データ', unit: '1式', quantity: '    20', unit_price: '     1,000', price: '  20,000', memo: '特になし' }]
	};
	// 明細データの生成
	// ここに処理をかく

	return data;
};

entryList.createGrid = function () {
	var delchk = ($("#entry_delete_check_disp").prop("checked")) ? 1:0;
	var sts01 = ($("#entry_status_01").prop("checked")) ? '01':'0';
	var sts02 = ($("#entry_status_02").prop("checked")) ? '02':'0';
	var sts03 = ($("#entry_status_03").prop("checked")) ? '03':'0';
	var sts04 = ($("#entry_status_04").prop("checked")) ? '04':'0';
	// 案件リストのグリッド
	jQuery("#entry_list").jqGrid({
		url: '/entry_get/?delete_check=' + delchk + '&entry_status_01=' + sts01 + '&entry_status_02=' + sts02 + '&entry_status_03=' + sts03 + '&entry_status_04=' + sts04,
		altRows: true,
		datatype: "json",
		colNames: ['案件No','得意先名1','得意先名2','案件名','問合せ日', '案件ステータス', '拠点CD','担当者','見積番号','見積発行日'
				,'受注日','仮受注チェック','受注区分','試験課','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'client_name_1', index: 'client_name_1', width: 200, align: "center" },
			{ name: 'client_name_2', index: 'client_name_2', width: 200, align: "center" },
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
		height:"230px",
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
	// checkboxの状態取得	
	var delchk = entryList.getQuoteDeleteCheckDispCheck();
	jQuery("#test_list").jqGrid({
		url: '/quote_get/' + no + '/?quote_delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','見積番号', '明細番号','試験項目CD', '試験項目名','試料名','到着日','計画書番号',
			'被験者数','検体数','報告書番号','報告書提出期限','報告書提出日',
			'速報提出期限１','速報提出日１','速報提出期限２','速報提出日２','期待値/設定値',
			'値説明','単位CD','単位','単価','数量','見積金額','備考','作成日','作成者','更新日','更新者','削除フラグ','削除理由'],
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
			{ name: 'quote_delete_check', index: 'quote_delete_check', hidden: true },			// 削除フラグ
			{ name: 'quote_delete_reason', index: 'quote_delete_reason', hidden: true },			// 削除理由
		],
		height: "230px",
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
		url: '/client_get?no=' + no + '&delete_check=' + 0,
		altRows: true,
		datatype: "json",
		colNames: ['得意先コード','得意先名１','得意先名２', '住所１', '住所２','担当者','所属部署','役職'],
		colModel: [
			{ name: 'client_cd', index: 'client_cd', width: 80, align: "center" },
			{ name: 'name_1', index: 'name_1', width: 200, align: "left" },
			{ name: 'name_2', index: 'name_2', width: 80, align: "left" },
			{ name: 'address_1', index: 'address_1', width: 100 ,align:"left" },
			{ name: 'address_2', index: 'address_2', width: 100, align: "left"},
			{ name: 'prepared_name', index: 'prepared_name', width: 100, align: "center" },
			{ name: 'prepared_division', index: 'prepared_division', width: 80, align: "center" },
			{ name: 'prepared_title', index: 'prepared_title', width: 80, align: "center" },
		],
		height: "230px",
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
// 得意先選択イベント
entryList.onSelectClientList = function (rowid) {
	var no;
	if (rowid != null) {
		var row = $("#client_list_" + (entryList.currentClientListTabNo + 1)).getRowData(rowid);
		entryList.currentClient = row;
	}
};

// 得意先選択ダイアログの選択ボタン押下イベント処理
entryList.selectClient = function () {
	$("#client_cd").val(entryList.currentClient.client_cd);
	$("#client_name_1").val(entryList.currentClient.name_1);
	$("#client_name_2").val(entryList.currentClient.name_2);
	$("#prepared_division").val(entryList.currentClient.prepared_division);
	$("#prepared_name").val(entryList.currentClient.prepared_name);
	return true;
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
	// フォームをクリアする
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
	$("#billing_company_name_1").val($("#client_name_1").val());
	$("#billing_company_name_2").val($("#client_name_2").val());
	$("#billing_division").val($("#prepared_division").val());
	$("#billing_prepared").val($("#prepared_name").val());
	$("#drc_division_name").text($("#division option:selected").text());
	$("#drc_prepared").text($("#person_id option:selected").text());
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
	if ($("#delete_check").prop("checked")) {
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
	if (!$("#delete_check").prop("checked")) {
		form.append('delete_check', '0');
	}
	if (!$("#input_check").prop("checked")) {
		form.append('input_check', '0');
	}
	if (!$("#confirm_check").prop("checked")) {
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
	$("#client_cd").val(entry.client_cd);				// 得意先コード
	var name_1 = entry.client_name_1;
	var name_2 = entry.client_name_2;
	// 敬称を付ける項目を判定する
	if ((!entry.prepared_name) || (entry.prepared_name == "")) {
		if ((entry.compellation) && (entry.compellation != "")) {
			if ((!entry.client_name_2) || (entry.client_name_2 == ""))
				name_1 = name_1 + " " + entry.compellation;
			else
				name_2 = name_2 + " " + entry.compellation;
		}
	}
	$("#client_name_1").val(name_1 );		// 得意先名1
	$("#client_name_2").val(name_2);		// 得意先名2
	$("#client_address_1").val(entry.client_address_1);	// 住所1
	$("#client_address_2").val(entry.client_address_2);	// 住所2
	$("#prepared_division").val(entry.prepared_division);		// 所属部署
	// 担当者名があるときは担当者名に敬称を付ける
	var pname = "";
	if ((entry.prepared_name) && (entry.prepared_name != "")) {
		pname = entry.prepared_name;
		if ((entry.prepared_compellation) && (entry.prepared_compellation != ""))
			pname = pname + " " + entry.prepared_compellation;
	}
	$("#prepared_name").val(pname);				// 担当者
	$("#order_accepted_date").val(entry.order_accepted_date);	// 受注日付
	$("#order_accept_check").val(entry.order_accept_check);		// 仮受注日チェック
	$("#acounting_period_no").val(entry.acounting_period_no);	// 会計期No
	$("#order_type").val(entry.order_type);						// 受託区分
	$("#contract_type").val(entry.contract_type);				// 契約区分
	$("#outsourcing_cd").val(entry.outsourcing_cd);				// 委託先CD
	$("#division").val(entry.division);							// 事業部ID
	$("#entry_amount_price").val(entry.entry_amount_price);		// 案件合計金額
	$("#entry_amount_billing").val(entry.entry_amount_price);	// 案件請求合計金額
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
	if (entry.delete_check == 1) {
		$("#delete_check").prop("checked", true); // 削除フラグ
	} else {
		$("#delete_check").prop("checked", false); // 削除フラグ
	}
	$("#delete_reason").val(entry.delete_reason); // 削除理由
	$("#input_check_date").val(entry.input_check_date); // 入力日
	if (entry.input_check == 1) {
		$("#input_check").prop("checked",true); // 入力完了チェック
	} else {
		$("#input_check").prop("checked", false); // 入力完了チェック
	}
	$("#input_operator_id").val(entry.input_operator_id); // 入力者ID
	$("#confirm_check_date").val(entry.confirm_check_date); // 確認日
	if (entry.confirm_check == 1) {
		$("#confirm_check").prop("checked",true); // 確認完了チェック
	} else {
		$("#confirm_check").prop("checked", false); // 確認完了チェック
	}
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
	entry.client_cd = "";		// 得意先コード
	entry.client_name_1 = "";	// 得意先名
	entry.client_name_2 = "";	// 得意先名
	entry.client_address_1 = "";	// 住所
	entry.client_address_2 = "";	// 住所
	entry.prepared_division = "";	// 担当者所属部署
	entry.prepared_name = "";		// 担当者
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
		$("#quote_delete_check_disp").css("display", "inline");
		$("#quote_delete_disp").css("display", "inline");
	} else {
		$("#add_quote").css("display", "none");
		$("#edit_quote").css("display", "none");
		$("#quote_delete_check_disp").css("display", "none");
		$("#quote_delete_disp").css("display", "none");
	}
};
// 試験（見積）情報の選択中データを取得する
entryList.getSelectQuote = function () {
	var grid = $("#test_list");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};
// 試験（見積）情報の入力フォームをクリアする
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
	$('#quote_delete_check').prop("checked",false);	// 削除フラグ
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
	if (quote.quote_delete_check == 1) {
		$('#quote_delete_check').prop("checked", true);		// 削除フラグ
	} else {
		$('#quote_delete_check').prop("checked", false);	// 削除フラグ
	}
	$('#quote_delete_reason').val(quote.quote_delete_reason);	// 削除理由
};
// 試験（見積）データの保存
entryList.saveQuote = function () {
	// 入力値チェック
	if (!entryList.quoteInputCheck()) {
		return false;
	}
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

// formデータの取得
entryList.getQuoteFormData = function () {
	var form = new FormData(document.querySelector("#quoteForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	var chk = $("#quote_delete_check").prop("checked");
	if (!chk) {
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

// 削除分の表示チェックイベント（案件）
entryList.changeEntryOption = function (event) {
	$("#entry_list").GridUnload();
	entryList.createGrid();
};
// 削除分の表示チェックイベント（明細）
entryList.changeQuoteOption = function (event) {
	var rowid = $("#entry_list").getGridParam("selrow");
	if (rowid != null) {
		var row = $("#entry_list").getRowData(rowid);
		$("#test_list").GridUnload();
		entryList.createTestGrid(row.entry_no);
	}
};
// 試験（見積）の削除分を表示のチェックボックス情報取得
entryList.getQuoteDeleteCheckDispCheck = function () {
	var dc = $("#quote_delete_check_disp").prop("checked");
	var delchk = (dc) ? 1:0;
	return delchk;
};

// 見積書の印刷（PDF生成）
entryList.printQuote = function (data) {
	var canvas = new fabric.Canvas('canvas', { backgroundColor : "#fff" });
	canvas.setHeight(1500);
	canvas.setWidth(900);
	var doc = new jsPDF();
	
	var top = 100;
	var font_size = 25;
	// タイトル	
	entryList.outputText(canvas, data.title, font_size, 80, 40);
	// 請求先情報	
	font_size = 16;
	var left = 60;
	top = 100;
	if (data.client_name_1 != null)
		entryList.outputText(canvas, data.client_name_1, font_size, left, top);
	top += font_size + 2;
	if (data.client_name_2 != null)
		entryList.outputText(canvas, data.client_name_2, font_size, left, top);
	top += font_size + 2;
	if (data.prepared_division != null)
		entryList.outputText(canvas, data.prepared_division, font_size, left, top);
	top += font_size + 2;
	if (data.prepared_name != null)
		entryList.outputText(canvas, data.prepared_name, font_size, left, top);
	// 見積内容	
	top += font_size + 10;
	entryList.outputText(canvas, "下記の通りお見積申し上げます。", font_size, left, top);
	top += font_size + 2;
	entryList.outputText(canvas, "件名：" + data.quote_title, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));

	entryList.outputText(canvas, data.quote_title1, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	
	entryList.outputText(canvas, data.quote_title2, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	
	entryList.outputText(canvas, data.quote_title3, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	top += 10;
	entryList.outputText(canvas, "有効期限：" + data.quote_expire, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	font_size = 18;
	entryList.outputText(canvas, "御見積合計金額　" + data.quote_total_price, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 250, height : 2 }));
	// 見積情報
	font_size = 16;
	left = 340;
	top = 100;
	if (data.quote_issue_date != null)
		entryList.outputText(canvas, "見積日：" + data.quote_issue_date, font_size, left, top);
	top += font_size + 2;
	if (data.quote_no != null)
		entryList.outputText(canvas, "見積番号：" + data.quote_no, font_size, left, top);
	// 自社情報
	top += font_size + 2;
	entryList.outputText(canvas, data.drc_address1, font_size, left, top);
	top += font_size + 2;
	entryList.outputText(canvas, data.drc_name, font_size, left, top);
	top += font_size + 2;
	entryList.outputText(canvas, data.drc_tel, font_size, left, top);
	top += font_size + 2;
	entryList.outputText(canvas, data.drc_fax, font_size, left, top);
	top += font_size + 20;
	entryList.outputText(canvas, data.drc_division_name, font_size, left, top);
	top += font_size + 2;
	entryList.outputText(canvas, data.drc_prepared, font_size, left, top);
	
	// 明細表
	left = 60;
	top = 400;
	var w = 680;
	var h = 20;
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h, fill: 'gray', stroke: 'black',opacity: 0.7 }));
	h = 620;
	
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h,fill:'none', stroke:'black', strokeWidth:2, opacity:0.7}));
	h = 1;	
	for (var i = 0; i < 31; i++) {
		top += 20;
		canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	}
	top = 400;
	h = 620;
	canvas.add(new fabric.Rect({ top : top, left : 280, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top, left : 340, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top, left : 440, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top, left : 540, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top, left : 640, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	
	top = 400;
	font_size = 16;
	entryList.outputText(canvas, "件　　名", font_size, 130, top);
	entryList.outputText(canvas, "単位"  , font_size, 290, top);
	entryList.outputText(canvas, "数  量", font_size, 365, top);
	entryList.outputText(canvas, "単  価", font_size, 465, top);
	entryList.outputText(canvas, "金  額", font_size, 570, top);
	entryList.outputText(canvas, "備  考", font_size, 665, top);
	// 印鑑枠	
	canvas.add(new fabric.Rect({ top : 300, left : 530, width : 210, height : 70, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : 300, left : 600, width : 70, height : 70, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	// 明細データの出力
	entryList.outputQuoteList(canvas, data, 420, 16);

	canvas.calcOffset();
	canvas.renderAll();
	// canvasからイメージを取得してPDFに追加する
	doc.addImage( $('canvas').get(0).toDataURL('image/jpeg'),'JPEG',0,0);
	var filename = "御見積書_" + data.quote_issue_date + "_" + data.quote_no + "_" + data.client_name_1 + ".pdf";
	doc.save(filename);
	canvas.setHeight(0);
	canvas.setWidth(0);
/*
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/print_pdf/' + entryList.currentEntryNo, true);
	xhr.responseType = 'application/pdf';
	xhr.onload = entryList.onloadPrintPDFReq;
	xhr.send();
 * **/
};

// canvasにテキストを出力
entryList.outputText = function (canvas, text,font_size,left, top) {
	canvas.add(new fabric.Text(text, { fontFamily: 'Meiryo UI', fill: 'black', left: left, top: top, fontSize: font_size }));
};

// 見積明細データの出力
entryList.outputQuoteList = function (canvas, data, top, font_size) {
	for (var i in data.rows) {
		var row = data.rows[i];
		entryList.outputText(canvas, row.name, font_size, 65, top);			// 件名
		entryList.outputText(canvas, row.unit, font_size, 295, top);		// 単位
		entryList.outputText(canvas, row.quantity, font_size, 370, top);	// 数量
		entryList.outputText(canvas, row.unit_price, font_size, 470, top);	// 単価
		entryList.outputText(canvas, row.price, font_size, 575, top);		// 金額
		entryList.outputText(canvas, row.memo, font_size, 670, top);		// 備考
		top += 20;
	}
};
entryList.onloadPrintPDFReq = function () {
};

