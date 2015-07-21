//
// DRC殿試験案件スケジュール管理
// 見積情報の処理
//

//
// 見積入力、リスト表示に関する処理
//
var quoteInfo = quoteInfo || {};
quoteInfo.currentEntry = {};			// 案件リストで選択中の案件情報
quoteInfo.currentQuoteRowId = 0;		// 選択中の見積リスト行ID
quoteInfo.currentConsumption_tax = 8;	// 現在の見積に適用される消費税率
quoteInfo.drc_info = {
	address1:"",
	address2:"",
	telno:"",
	faxno:"",
	name:"DRC株式会社",
	consumption_tax:8
};
quoteInfo.getMyInfo = function() {
	var config = $.get('/config_get/1', {});
	$.when(config)
	.done(function (config_response) {
//		configuration = config_response;
		quoteInfo.drc_info.name = config_response.drc_name;
		quoteInfo.drc_info.zipcode = '〒'+ config_response.drc_zipcode;
		quoteInfo.drc_info.address1 = config_response.drc_address1;
		quoteInfo.drc_info.address2 = config_response.drc_address2;
		quoteInfo.drc_info.telno = "TEL:" + config_response.drc_telno;
		quoteInfo.drc_info.faxno = "FAX:" + config_response.drc_faxno;
		quoteInfo.drc_info.consumption_tax = config_response.consumption_tax;
		quoteInfo.drc_info.quote_form_memo_1 = config_response.quote_form_memo_define_1;
		quoteInfo.drc_info.quote_form_memo_2 = config_response.quote_form_memo_define_2;
		quoteInfo.drc_info.quote_form_memo_3 = config_response.quote_form_memo_define_3;
		// 見積書の最下の備考の選択肢設定
		$("#quote_form_memo_select").append($("<option value=''></option>")); 
		$("#quote_form_memo_select").append($("<option value='" + quoteInfo.drc_info.quote_form_memo_1 + "'>" + quoteInfo.drc_info.quote_form_memo_1 + "</option>")); 
		$("#quote_form_memo_select").append($("<option value='" + quoteInfo.drc_info.quote_form_memo_2 + "'>" + quoteInfo.drc_info.quote_form_memo_2 + "</option>")); 
		$("#quote_form_memo_select").append($("<option value='" + quoteInfo.drc_info.quote_form_memo_3 + "'>" + quoteInfo.drc_info.quote_form_memo_3 + "</option>")); 
		quoteInfo.currentConsumption_tax = config_response.consumption_tax;
	});
};
// イベント処理のバインド
quoteInfo.eventBind = function(kind) {
	if (kind == "add_row_btn") {
		$(".add_row_btn").bind("click", quoteInfo.addQuoteRow);
	}
	$(".del_row_btn").bind("click", quoteInfo.delQuoteRow);
	// 試験中分類選択ダイアログを表示するイベント処理を登録する
	$(".test_middle_class").bind('click',{}, quoteInfo.openTestItemSelectDialog);
	// 合計計算用
	$(".summary_target").bind('input',{}, quoteInfo.calcSummary);
	$(".calc_price").bind('input',{}, quoteInfo.calcPrice);
	$("#estimateForm #consumption_tax").bind('input',{}, quoteInfo.calcSummary);
	// 備考選択イベント処理登録
	$("#quote_form_memo_select").unbind("change",quoteInfo.selectMemoList);
	$("#quote_form_memo_select").bind("change",{},quoteInfo.selectMemoList);
};

// 見積書用ダイアログの生成
quoteInfo.createQuoteFormDialog = function () {
	$('#quoteForm_dialog').dialog({
		autoOpen: false,
		width: 910,
		height: 600,
		title: '見積書',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"PDF出力後に登録": function () {
				// データの保存
				if (quoteInfo.saveQuote("print")) {
					$(this).dialog('close');
				}
			},
			"登録": function () {
				// データの保存
				if (quoteInfo.saveQuote("")) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 見積情報リストグリッドの生成(noは案件番号）
quoteInfo.createQuoteInfoGrid = function (no) {
	
	// checkboxの状態取得	
	var delchk = quoteInfo.getQuoteDeleteCheckDispCheck();
	jQuery("#quote_list").jqGrid({
		url: '/quote_get/' + no + '/?quote_delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','見積番号', '見積日','有効期限','合計金額','被験者数','消費税率','PDF発行','受注ステータス','備考','','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no' , index: 'entry_no', width: 80, align: "center" },				// 案件番号
			{ name: 'quote_no' , index: 'quote_no', width: 80, align: "center" },				// 見積番号
			{ name: 'quote_date' , index: 'quote_date', width: 120, align: "center" },			// 見積日
			{ name: 'expire_date' , index: 'expire_date', width: 120, align: "center" ,hidden:true},		// 有効期限
			{ name: 'total_price' , index: 'total_price', width: 120, align: "right",formatter:quoteInfo.numFormatterC },			// 合計金額
			{ name: 'monitors_num', index: 'monitors_num', width: 80,align:"right" },			// 被験者数
			{ name: 'consumption_tax', index: 'consumption_tax', width: 80,align:"right" },		// 消費税率
			{ name: 'quote_submit_check', index: 'quote_submit_check', width: 120,align:"center",formatter:quoteInfo.submitCheckFormatter },			// 受注ステータス
			{ name: 'order_status', index: 'order_status', width: 120,align:"center",formatter:quoteInfo.orderCheckFormatter },			// 受注ステータス
			{ name: 'quote_form_memo' , index: 'quote_form_memo', width: 120, align: "left" },	// 見積備考
			{ name: 'quote_delete_check', hidden:true},											// 削除フラグ
			{ name: 'created', index: 'created', width: 120, align: "center" },					// 作成日
			{ name: 'created_id', index: 'created_id', width: 120 , align: "center",formatter: scheduleCommon.personFormatter},							// 作成者ID
			{ name: 'updated', index: 'updated', width: 120, align: "center" },					// 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 , align: "center",formatter: scheduleCommon.personFormatter}								// 更新者ID
		],
		height: "115px",
		shrinkToFit:false,
		rowNum: 5,
		rowList: [5],
		pager: '#quote_list_pager',
		sortname: 'quote_no',
		viewrecords: true,
		sortorder: "asc",
		onSelectRow:quoteInfo.onSelectQuote,
		caption: "見積情報"
	});
	jQuery("#quote_list").jqGrid('navGrid', '#quote_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
// グリッド表示用（見積書提出フラグ）
quoteInfo.submitCheckFormatter = function(no) {
	if (no == 1) {
		return "未";
	} else {
		return "済";
	}
};
// グリッド表示用（受注ステータス）
quoteInfo.orderCheckFormatter = function(no) {
	if (no == 1) {
		return "商談中";
	} else {
		return "受注確定";
	}
};
// グリッド表示用（集計対象フラグ）
quoteInfo.summaryCheckFormatter = function(no) {
	if (no == 0) {
		return "しない";
	} else {
		return "する";
	}
};
// 小数点以下を四捨五入して表示
quoteInfo.numFormatter = function(num) {
	return Math.round(num);
};
quoteInfo.numFormatterC = function(num) {
	return scheduleCommon.numFormatter( Math.round(num), 10);
};
// 見積明細リストグリッドの生成
quoteInfo.createQuoteSpecificGrid = function (entry_no, quote_no,large_item_cd) {
	// checkboxの状態取得	
	var delchk = quoteInfo.getQuoteSpecificDeleteCheckDispCheck();
	jQuery("#quote_specific_list").jqGrid({
		url: '/quote_specific_get_grid/' + entry_no + '/' + quote_no + '/?specific_delete_check=' + delchk + '&large_item_cd=' + large_item_cd,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','見積番号', '明細番号','','試験中分類名','数量','単位','単価','見積金額','集計','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no' , index: 'entry_no', width: 80, align: "center" },				// 案件番号
			{ name: 'quote_no' , index: 'quote_no', width: 80, align: "center" },				// 見積番号
			{ name: 'quote_detail_no', index: 'quote_detail_no', width: 80, align: "center" },	// 明細番号
			{ name: 'test_middle_class_cd', index: 'test_middle_class_cd', hidden:true },		// 試験中分類CD
			{ name: 'test_middle_class_name', index: 'test_middle_class_name', width: 200 },	// 試験中分類名
			{ name: 'quantity', index: 'quantity', width: 60,align:"right" },					// 数量
			{ name: 'unit', index: 'unit', width: 60,align:"center" },							// 単位
			{ name: 'unit_price', index: 'unit_price', width: 120,align:"right",formatter:quoteInfo.numFormatterC },				// 単価
			{ name: 'price', index: 'price', width: 120,align:"right" ,formatter:quoteInfo.numFormatterC},							// 見積金額
			{ name: 'summary_check', index: 'summary_check', width: 120 ,align:"center", formatter:quoteInfo.summaryCheckFormatter },						// 集計対象チェック
			{ name: 'created', index: 'created', width: 120 },									// 作成日
			{ name: 'created_id', index: 'created_id', width: 120, align: "center",formatter: scheduleCommon.personFormatter },							// 作成者ID
			{ name: 'updated', index: 'updated', width: 120 },									// 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120, align: "center",formatter: scheduleCommon.personFormatter }								// 更新者ID
		],
		height: "130px",
		//width:960,
		shrinkToFit:false,
		rowNum: 6,
		rowList: [6],
		pager: '#quote_specific_list_pager',
		sortname: 'quote_detail_no',
		multiSort:false,
		viewrecords: true,
		sortorder: "asc",
		caption: "試験（見積）情報"
	});
	jQuery("#quote_specific_list").jqGrid('navGrid', '#quote_specific_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};

// 見積書ダイアログ表示
quoteInfo.openQuoteFormDialog = function (event) {
	// 自社情報のセット
	$("#drc_zipcode").text(quoteInfo.drc_info.zipcode);
	$("#drc_address1").text(quoteInfo.drc_info.address1);
	$("#drc_address2").text(quoteInfo.drc_info.address2);
	$("#drc_tel_fax").text(quoteInfo.drc_info.telno + " " + quoteInfo.drc_info.faxno);
	$("#drc_name").text(quoteInfo.drc_info.name);
	// テーブルのクリア
	quoteInfo.specificTableClear();
	// 選択中の案件情報を取得する
	var entry = event.data.entryList.currentEntry;
	quoteInfo.currentEntry = entry;
	quoteInfo.currentConsumption_tax = quoteInfo.drc_info.consumption_tax;
	var quote = quoteInfo.clearQuote();
	if ($(event.target).attr("id") == "edit_quote") {
		// 見積の編集ボタン押下時は選択中の見積情報を取得する
		quote = $("#quote_list").getRowData(quoteInfo.currentQuoteRowId);
		quoteInfo.setQuoteFormData(quote);
		// 見積明細データの取得とセット
		quoteInfo.searchSpecificInfo(entry.entry_no,quote.quote_no, entry.test_large_class_cd);
	} else {
		quoteInfo.setQuoteFormData(quote);
		// イベント設定
		quoteInfo.eventBind("");
		quoteInfo.calcSummary();
	}
	$("#billing_company_name_1").val(entry.client_name_1);
	$("#billing_company_name_2").val(entry.client_name_2);
	$("#billing_division").val(entry.client_division_name);
	$("#billing_person").val(entry.client_person_name + " " + entry.client_person_compellation);
	$("#drc_division_name").text("  試験課 " + entry.test_large_class_name);
	$("#drc_test_person").text("  担当者 " + entry.sales_person_id);
	$("#quote_title").val(entry.entry_title);
	// 権限チェック
	if (entryList.auth_quote_edit == 2) {
		$(".ui-dialog-buttonpane button:contains('PDF出力後に登録')").button("enable");
		$(".ui-dialog-buttonpane button:contains('登録')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('PDF出力後に登録')").button("disable");
		$(".ui-dialog-buttonpane button:contains('登録')").button("disable");
	}
	// 受注確定になっている見積があるかチェックする
	var order_index = quoteInfo.checkOrderStatus();
	if (order_index >= 0) {
		if ((order_index == "") || (order_index == quoteInfo.currentQuoteRowId)) {
			$("#order_status_2").css("display","inline");
		} else if (order_index != ""){
			// 受注確定になっている見積がある場合で、選択中のものでない場合、受注確定のラジオボタンを無効化する
			$("#order_status_2").css("display","none");
		} 
	}
	$("#quoteForm_dialog").dialog("open");
};

// 見積の中で受注確定になっているものがあるかチェックする
quoteInfo.checkOrderStatus = function() {
	// データIDを取得する
	var IDs = $("#quote_list").getDataIDs();
	var result = "";
	// 取得したIDで行データを取得する
	for(var i in IDs){
		var rowid = IDs[i];
		var quote = $("#quote_list").getRowData(rowid);
		if (quote.order_status) {
			if (quote.order_status === "受注確定") {
				result = rowid;
				break;
			}
		} else {
			break;
		}
	}
	return result;
};
// 見積明細の検索とテーブル設定
quoteInfo.searchSpecificInfo = function(entry_no,quote_no,large_item_cd) {
	$.ajax({
		url: '/quote_specific_get_list/' + entry_no + '/' + quote_no + '?large_item_cd=' + large_item_cd, 
		cache: false,
		dataType: 'json',
		success: function (specific_list) {
			quoteInfo.addSpecificInfoToTable(specific_list);
		}
	});
};
// 明細テーブルへ明細データをセットする
quoteInfo.addSpecificInfoToTable = function(specific_list) {
	if (specific_list != null) {
		var rows = specific_list.rows;
		for (var i in rows) {
			var no = Number(i) + 1;
			if (no > 1) {
				// 行追加
				$("#meisai_table tbody").append(quoteInfo.addRowCreate(no));
			}
			$("#test_middle_class_cd_" + no).val(rows[i].test_middle_class_cd);
			$("#test_middle_class_name_" + no).val(rows[i].test_middle_class_name);
			$("#unit_" + no).val(rows[i].unit);
			$("#unit_price_" + no).val(quoteInfo.numFormatter(Number(rows[i].unit_price)));
			$("#quantity_" + no).val(rows[i].quantity);
			$("#price_" + no).val(quoteInfo.numFormatter(Number(rows[i].price)));
			$("#summary_check_" + no).prop("checked",(rows[i].summary_check == 1));
			$("#specific_memo_" + no).val(rows[i].specific_memo);
		}
		// イベント設定
		quoteInfo.eventBind("");
		quoteInfo.calcSummary();
	}
};
// 見積の選択イベント処理
quoteInfo.onSelectQuote = function(rowid) {
	// 編集ボタンを表示
	quoteInfo.enableQuoteButtons(true, 2);
	quoteInfo.currentQuoteRowId = rowid;	
	// 明細グリッドの再表示
	var entry = quoteInfo.getSelectEntry();
	var quote = quoteInfo.getSelectQuote();
	// 消費税率を取得してカレントに設定する
	quoteInfo.currentConsumption_tax = quote.consumption_tax;
	$("#quote_specific_list").GridUnload();
	quoteInfo.createQuoteSpecificGrid(entry.entry_no, quote.quote_no, entry.test_large_class_cd);
	
};

// 明細追加、編集ボタンの表示・非表示
quoteInfo.enableQuoteButtons = function(enable, kind) {
	if (enable) {
		if (kind == 1) {
			// 権限チェック
			if (entryList.auth_quote_add == 2) {
				$("#add_quote").css("display", "inline");
			}
			// 権限チェック
			if (entryList.auth_quote_edit >= 1) {
				$("#edit_quote").css("display", "none");
			}
			$("#quote_delete_check_disp").css("display", "inline");
			$("#quote_delete_disp").css("display", "inline");
		} else if (kind == 2) {
			// 権限チェック
			if (entryList.auth_quote_edit >= 1) {
				$("#edit_quote").css("display", "inline");
			}
		}
	} else {
		$("#add_quote").css("display", "none");
		$("#edit_quote").css("display", "none");
		$("#quote_delete_check_disp").css("display", "none");
		$("#quote_delete_disp").css("display", "none");
	}
};
// 見積情報の選択中データを取得する
quoteInfo.getSelectQuote = function () {
	var grid = $("#quote_list");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};
// 選択中の案件データを取得する
quoteInfo.getSelectEntry = function () {
	var grid = $("#entry_list");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};
// 見積情報をクリアする
quoteInfo.clearQuote = function () {
	var quote = {};
	quote.quote_no = "";
	quote.monitors_num = "";
	quote.quote_date = "";
	quote.expire_date = "見積もり発効から60日";
	quote.quote_submit_check = "未";
	quote.order_status = "商談中";
	quote.quote_total_price = "";
	quote.quote_form_memo = "";
	quote.quote_delete_check = "0";
	quote.consumption_tax = quoteInfo.currentConsumption_tax;	// 消費税率のデフォルトセット
	return quote;
};

// 見積書フォームにデータをセットする
quoteInfo.setQuoteFormData = function (quote) {
	$('#estimate_quote_no').val(quote.quote_no);		// 見積番号
	$('#estimate_monitors_num').val(quote.monitors_num);// 被験者数
	$('#quote_date').val(quote.quote_date);				// 見積日
	$('#expire_date').val(quote.expire_date);			// 有効期限
	$('#quote_total_price').val(quote.quote_total_price);	// 見積金額合計

	if (quote.quote_submit_check == "未") {
		$('#quote_submit_check_no').prop("checked",true);	// 見積書提出済フラグ
	} else if (quote.quote_submit_check == "済"){
		$('#quote_submit_check_yes').prop("checked",true);
	}
	if (quote.order_status == "商談中") {
		$('#order_status_no').prop("checked",true);			// 受注ステータス
	} else if (quote.order_status == "受注確定") {
		$('#order_status_yes').prop("checked",true);
	}
	$("#quote_form_memo").val(quote.quote_form_memo);	// 見積書備考
	if (quote.quote_delete_check == "0") {
		$("#estimate_delete_check").prop("checked", false);
	} else {
		$("#estimate_delete_check").prop("checked", true);
	}
	$("#estimateForm #consumption_tax").val(quote.consumption_tax);	// 消費税率
};
// 見積データの保存
quoteInfo.saveQuote = function (kind) {
	// 入力値チェック
	if (!quoteInfo.quoteInputCheck(kind)) {
		return false;
	}
	// formデータの取得
	var form = quoteInfo.getQuoteFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/quote_post', true);
	xhr.responseType = 'json';
	if (kind == "print") {
		document.body.style.cursor = "wait";
		xhr.onload = quoteInfo.onloadQuoteReqAfterPrint;
	} else {
		xhr.onload = quoteInfo.onloadQuoteReq;
	}
	xhr.send(form);
	return true;
};
// 入力値チェック
quoteInfo.quoteInputCheck = function (kind) {
	var result = false;
	var err = "";
	if (! $("#estimateForm")[0].checkValidity) {
		return true;
	}
	// HTML5のバリデーションチェック
	if ($("#estimateForm")[0].checkValidity()) {
		if (kind == "print") {
			// PDF発行済フラグを発行済にする
			$("#quote_submit_check_yes").prop("checked",true);
		}
		result = true;
	} else {
		var ctrls = $("#estimateForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (! ctl.validity.valid) {
				if (ctl.id.indexOf("test_middle_class_name_") == 0) {
					if (! quoteInfo.checkDeleteRow(ctl.id)) {
						err = "試験中分類名の入力値を確認して下さい";
						result = false;
						break;
					} else {
						result = true;
						continue;
					}
				} else if (ctl.id == "estimate_monitors_num") {
					err = "被験者数の入力値を確認して下さい";
					result = false;
					break;
				} else if (ctl.id == "consumption_tax") {
					err = "消費税率の入力値を確認して下さい";
					result = false;
					break;
				}
			}
		}
	}
	if (!result) {
		$("#message").text(err);
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// formデータの取得
quoteInfo.getQuoteFormData = function () {
	var form = new FormData(document.querySelector("#estimateForm"));
	form.append("entry_no",quoteInfo.currentEntry.entry_no);
	if (! $("#estimate_delete_check").prop("checked")) {
		form.append("estimate_delete_check","0");
	}
	return form;
};
quoteInfo.onloadQuoteReq = function (e) {
	if (this.status == 200) {
		var quote = this.response;
		$('#estimate_quote_no').val(quote.estimate_quote_no);
		// グリッドの再表示
		$("#quote_list").GridUnload();
		quoteInfo.createQuoteInfoGrid(quoteInfo.currentEntry.entry_no);
		$("#quote_specific_list").GridUnload();
		quoteInfo.createQuoteSpecificGrid(quoteInfo.currentEntry.entry_no,quote.estimate_quote_no, quoteInfo.currentEntry.test_large_class_cd);
		quoteInfo.enableQuoteButtons(true, 1);

	}
};
quoteInfo.onloadQuoteReqAfterPrint = function (e) {
	if (this.status == 200) {
		var quote = this.response;
		var entry = quoteInfo.getSelectEntry();
		$('#estimate_quote_no').val(quote.estimate_quote_no);
		// グリッドの再表示
		$("#quote_list").GridUnload();
		quoteInfo.createQuoteInfoGrid(quoteInfo.currentEntry.entry_no);
		$("#quote_specific_list").GridUnload();
		quoteInfo.createQuoteSpecificGrid(quoteInfo.currentEntry.entry_no,quote.estimate_quote_no, quoteInfo.currentEntry.test_large_class_cd);
		// 印刷用PDFの生成
		var data = quoteInfo.printDataSetup(entry,quote);
		quoteInfo.printQuote(data);
		quoteInfo.enableQuoteButtons(true, 1);
	}
};

// 削除分の表示チェックイベント
quoteInfo.changeQuoteOption = function (event) {
	var entry = quoteInfo.getSelectEntry();
	$("#quote_list").GridUnload();
	quoteInfo.createQuoteInfoGrid(entry.entry_no);
};
// 見積の削除分を表示のチェックボックス情報取得
quoteInfo.getQuoteDeleteCheckDispCheck = function () {
	var dc = $("#quote_delete_check_disp").prop("checked");
	var delchk = (dc) ? 1:0;
	return delchk;
};
// 見積明細の削除分を表示のチェックボックス情報取得
quoteInfo.getQuoteSpecificDeleteCheckDispCheck = function () {
	var dc = $("#quote_specific_delete_check_disp").prop("checked");
	var delchk = (dc) ? 1:0;
	return delchk;
};

// 行追加ボタン押下イベント処理
quoteInfo.addQuoteRow = function(event) {
	// 現在の行数を取得する（見出し行を含む）
	var rows = $("#meisai_table tbody").children().length;
	// 行に必要な要素を生成
	var row = quoteInfo.addRowCreate(rows);
	var id = $(event.target).attr("id");
	if (id != "") {
		var s = id.split("_");
		if (s.length == 3) {
			var no = s[2];
			var parent_tr = event.target.parentElement.parentElement;
			$("#meisai_table tbody").append(row);
			// イベント設定
			quoteInfo.eventBind("");
		}
	}
}
// 合計金額計算
quoteInfo.calcSummary = function(event) {
	// 消費税率の入力値を取得する
	quoteInfo.currentConsumption_tax = Number($("#estimateForm #consumption_tax").val());
	// 現在の行数を取得する（見出し行を含む）
	var rows = $("#meisai_table tbody").children().length;
	var total = 0;
	for(var i = 1;i <= rows - 1;i++) {
		var price = 0;
		if ($("#specific_delete_check_" + i).val() == "0") {
			var p = $("#price_" + i).val().replace(',','');
			// 数値チェックしてから変換して合計する
			if (scheduleCommon.isNumber( p )) {
				price = Number(p);
			}
			total += price;
		}
	}
	var tax = Math.round(total * (quoteInfo.currentConsumption_tax / 100));
	$("#sum").val(scheduleCommon.numFormatter( total, 10))
	$("#consumption").val(scheduleCommon.numFormatter( tax, 10))
	$("#quote_total_price").val(scheduleCommon.numFormatter( total + tax, 10));
};

// 単価＊数量＝金額の計算
quoteInfo.calcPrice = function(event) {
	var unit_price = 0;
	var quantity = 0;
	var no = "1";
	if (event.target.id.indexOf("unit_price_") == 0) {
		no = event.target.id.split("_")[2];
		unit_price = event.target.value;
		quantity = $("#quantity_" + no).val();
	} else if (event.target.id.indexOf("quantity_") == 0) {
		no = event.target.id.split("_")[1];
		quantity = event.target.value;
		unit_price = $("#unit_price_" + no).val();
	}
	var price = unit_price * quantity;
	$("#price_" + no).val(price);
	quoteInfo.calcSummary();
};

// 明細テーブルのクリア（再生成）
quoteInfo.specificTableClear = function() {
	$("#meisai_table tbody").empty();
	$("#meisai_table tbody").append(quoteInfo.addHeader());
	$("#meisai_table tbody").append(quoteInfo.addRowCreate(1));
	$(".add_row_btn").bind("click",quoteInfo.addQuoteRow);
	$(".del_row_btn").bind("click",quoteInfo.delQuoteRow);
};

// 明細ヘッダの生成
quoteInfo.addHeader = function() {
	var row = $("<tr></tr>");
	$(row).append("<th>名称</th>");
	$(row).append("<th>数量</th>");
	$(row).append("<th>単位</th>");
	$(row).append("<th>単価</th>");
	$(row).append("<th>金額</th>");
	$(row).append("<th>集計</th>");
	$(row).append("<th>備考</th>");
	$(row).append("<th><input class='add_row_btn' id='add_row_0' type='button' name='add_row_0' value='行追加')</th>");
	return row;
};
// 明細行の生成
quoteInfo.addRowCreate = function(no) {
	var id = "row_" + no;
	var row = $("<tr id='" + id + "'></tr>");
	// 行に追加する要素
	var td = $("<td></td>");
	var id = "test_middle_class_cd_" + no;
	var name_1 = $("<input type='hidden' id='quote_detail_no_" + no + "' name='quote_detail_no_" + no + "' value='" + no + "' +/>");
	var name_2 = $("<input type='hidden' id='" + id + "' name='" + id + "'/>");
	var name_3 = $("<input type='text' class='test_middle_class' id='test_middle_class_name_" + no + "' name='test_middle_class_name_" + no + "' size='20' placeholder='試験中分類'required='true'/>");
	$(td).append(name_1);
	$(td).append(name_2);
	$(td).append(name_3);
	$(row).append(td);

	id = "quantity_" + no;
	var qty = $("<td><input type='number'  min='0' max='9999' class='num_type calc_price' id='" + id + "' name='" + id + "' size='4' placeholder='数量'  pattern='[0-9]{1,4}'/></td>");

	id = "unit_" + no;
	var unit = $("<td><input type='text' id='" + id + "' name='" + id + "' size='4' placeholder='単位'/></td>");

	id = "unit_price_" + no;
	var unit_price = $("<td><input type='number' min='0' max='99999999' class='num_type calc_price' id='" + id + "' name='" + id + "' size='9' placeholder='単価' pattern='[0-9]{1,8}'/></td>");
	
	id = "price_" + no;
	var price = $("<td><input type='number'  min='-99999999' max='99999999' class='num_type summary_target' id='" + id + "' name='" + id + "' size='12' placeholder='金額' pattern='[0-9]{1,8}'/></td>");

	id = "summary_check_" + no;
	var summary = $("<td><label><input type='checkbox' id='" + id + "' name='" + id + "' checked='true'/>集計する</label></td>");
	
	id = "specific_memo_" + no;
	var memo = $("<td><input type='text' id='" + id + "' name='" + id + "' size='12' placeholder='備考'/></td>");
	
	id = "del_row_btn_" + no;
	var button = $("<td><input type='button' id='" + id + "' class='del_row_btn' name='" + id + "' value='行削除'/><input type='hidden' id='specific_delete_check_" + no + "' name='specific_delete_check_" + no + "' value='0'/></td>");

	$(row).append(qty);
	$(row).append(unit);
	$(row).append(unit_price);
	$(row).append(price);
	$(row).append(summary);
	$(row).append(memo);
	$(row).append(button);
	return row;
};
// 行削除ボタン押下イベント処理
quoteInfo.delQuoteRow = function(event) {
	var no = quoteInfo.getMeisaiNo( $(event.target).attr("id"));
	var parent_tr = event.target.parentElement.parentElement;
	// その行を非表示にする
	$(parent_tr).css("display","none");
	$("#specific_delete_check_" + no).val("1");
	// 合計金額再計算
	quoteInfo.calcSummary(null);
};
// 削除フラグが１の行か調べる
quoteInfo.checkDeleteRow = function(id) {
	var no = quoteInfo.getMeisaiNo(id);
	var del_check = $("#specific_delete_check_" + no).val();
	if (del_check == "1") {
		return true;
	} else {
		return false;
	}
};

// テーブル行のデータ取得
quoteInfo.getRowsData = function() {
	$.each($("#meisai_table tbody").children(),function() {
	});
}

// 試験分類参照ダイアログ表示
quoteInfo.openTestItemSelectDialog = function (event) {
	$("#test_item_list_large").GridUnload();
	test_itemList.createTestLargeGrid();
	$("#test_item_list_middle").GridUnload();
	test_itemList.createTestMiddleGrid(0);

	$("#test_item_list_dialog").dialog({
		buttons: {
			"選択": function () {
				var id = $(event.target).attr("id");
				if (quoteInfo.selectMiddleClass(quoteInfo.getMeisaiNo(id))) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
	$("#test_item_list_dialog").dialog("open");
};

// 明細項目のidから明細行番号を取得する
quoteInfo.getMeisaiNo = function(id) {
	var no = "";
	if (id != "") { 
		var s = id.split("_");
		if (s.length > 0) {
			no = s[s.length - 1];
		}
	}
	return no;
};
// 試験中分類の選択データをフォームにセットする
quoteInfo.selectMiddleClass = function(no) {
	$("#test_middle_class_cd_" + no).val(test_itemList.currentTestItemMiddle.item_cd);
	$("#test_middle_class_name_" + no).val(test_itemList.currentTestItemMiddle.item_name);
	return true;
};


// 見積書用データの生成
quoteInfo.printDataSetup = function (entry,quote) {
	// 印刷用データ
	var data = {
		title: '御 見 積 書',
		quote_issue_date: quote.quote_date,
		quote_no: entry.entry_no + "-" + quote.estimate_quote_no,
		drc_zipcode: quoteInfo.drc_info.zipcode,
		drc_address1: quoteInfo.drc_info.address1,
		drc_address2: quoteInfo.drc_info.address2,
		drc_tel: quoteInfo.drc_info.telno,
		drc_fax: quoteInfo.drc_info.faxno,
		drc_name:quoteInfo.drc_info.name,
		drc_division_name: $("#drc_division_name").text(),
		drc_prepared: $("#drc_test_person").text(),
		client_name_1: $("#billing_company_name_1").val(),	// 請求先情報
		client_name_2: $("#billing_company_name_2").val(),	// 請求先情報
		prepared_division: $("#billing_division").val(),	// 請求先情報
		prepared_name: $("#billing_person").val(),			// 請求先情報
		quote_title: $("#quote_title").val(),
		quote_expire: $("#expire_date").val(),
		quote_total_price: $("#quote_total_price").val(),
		memo: $("#quote_form_memo").val(),
		rows: []
	};
	// 明細データの生成
	var no = 1;
	while ("quote_detail_no_" + no in quote) {
		// 行がある
		var specific = {};
		specific.quote_detail_no = quote["quote_detail_no_" + no];
		specific.test_middle_class_name = quote["test_middle_class_name_" + no];
		specific.unit = quote["unit_" + no];
		specific.unit_price = quote["unit_price_" + no];
		specific.quantity = quote["quantity_" + no];
		specific.price = quote["price_" + no];
		if ("summary_check_" + no in quote) {
			specific.summary_check = 1;
		} else {
			specific.summary_check = 0;
		}
		specific.specific_memo = quote["specific_memo_" + no];
		specific.specific_delete_check = Number(quote["specific_delete_check_" + no]);
		data.rows.push(specific);
		no++;
	}
	return data;
};

// 見積書の印刷（PDF生成）
quoteInfo.printQuote = function (data) {
	var canvas = new fabric.Canvas('canvas', { backgroundColor : "#ffffff" });
	canvas.setHeight(1500);
	canvas.setWidth(900);
	var doc = new jsPDF();
	fabric.Image.fromURL('images/logo_DRC.jpg',function(img) {
		img.left = 460;
		img.top = 167;
		img.scaleX = 0.25;
		img.scaleY = 0.25;
		canvas.add(img);
	
	var top = 100;
	var font_size = 20;
	// タイトル	
	quoteInfo.outputText(canvas, data.title, font_size, 330, 100);
	// 請求先情報	
	font_size = 16;
	var left = 80;
	top = 155;
	if (data.client_name_1 != "") {
		quoteInfo.outputTextBold(canvas, data.client_name_1, font_size, left, top);
		if ((data.client_name_2 == "") && (data.prepared_division == "") && (data.prepared_name == "")) {
			top += font_size + 6 + 4;
			canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));	// 下線
		}
	}
	top += font_size + 6;
	if (data.client_name_2 != "") {
		quoteInfo.outputTextBold(canvas, data.client_name_2, font_size, left, top);
		if ((data.prepared_division == "") && (data.prepared_name == "")) {
			top += font_size + 6 + 4;
			canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));	// 下線
		}
	}
	top += font_size + 6;
	if (data.prepared_division != "") {
		quoteInfo.outputTextBold(canvas, data.prepared_division, font_size, left, top);
		if (data.prepared_name == "") {
			top += font_size + 6 + 4;
			canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));	// 下線
		}
	}
	top += font_size + 6;
	if (data.prepared_name != "") {
		quoteInfo.outputTextBold(canvas, data.prepared_name, font_size, left, top);
		top += font_size + 6 + 4;
		canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));	// 下線
	}
	// 見積内容	
	top += font_size + 6;
	font_size = 12;
	quoteInfo.outputTextBold(canvas, "下記の通りお見積り申し上げます", font_size, left, top);
	top += font_size + 10;
	font_size = 14;
	quoteInfo.outputTextBold(canvas, "件名：" + data.quote_title, font_size, left, top);
	top += font_size + 4 + 4;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));	// 下線

	top += font_size;
	font_size = 12;
	quoteInfo.outputTextBold(canvas, "有効期限：" + data.quote_expire, font_size, left, top);
	top += font_size + 4 + 4;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 250, height : 1 }));	// 下線
	top += font_size;
	font_size = 20;
	quoteInfo.outputText(canvas, "御見積合計金額　" + scheduleCommon.addYenMark(scheduleCommon.numFormatter(data.quote_total_price)) + ".-", font_size, left, top);
	top += font_size + 4 + 4;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 340, height : 2 }));	// 下線
	// 見積情報
	font_size = 12;
	left = 560;
	top = 100;
	if (data.quote_issue_date != null)
		quoteInfo.outputText(canvas, "見積日：" + data.quote_issue_date, font_size, left, top);
	top += font_size + 8;
	if (data.quote_no != null)
		quoteInfo.outputText(canvas, "見積番号：" + data.quote_no, font_size, left, top);
	// 自社情報
	left = 530;
	top += 60;
	font_size = 14;
	quoteInfo.outputTextBold(canvas, data.drc_name, font_size, left, top);
	top += font_size + 10;
	font_size = 12;
	quoteInfo.outputText(canvas, data.drc_zipcode, font_size, left, top);
	top += font_size + 6;
	font_size = 12;
	quoteInfo.outputText(canvas, data.drc_address1, font_size, left, top);
	top += font_size + 6;
	quoteInfo.outputText(canvas, data.drc_address2, font_size, left, top);
	top += font_size + 6;
	font_size = 12;
	quoteInfo.outputTextMono(canvas, data.drc_tel, font_size, left, top);
	top += font_size + 6;
	quoteInfo.outputTextMono(canvas, data.drc_fax, font_size, left, top);
	top += font_size + 6;
	font_size = 14;
	quoteInfo.outputText(canvas, data.drc_division_name, font_size, left, top);
	top += font_size + 6;
	quoteInfo.outputText(canvas, data.drc_prepared, font_size, left, top);
	
	// 明細表
	left = 60;
	top = 400;
	var w = 680;
	h = 24;
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h, fill: 'gray', stroke: 'black',opacity: 0.7 }));

	var h = 624;	
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h,fill:'none', stroke:'black', strokeWidth:3, opacity:1}));

	h = 1;	
	var sw = 1;
	for (var i = 0; i < 25; i++) {
		top += 24;
		if (i == 0) sw = 2; else sw = 1;
		if (i >= 22) sw = 2;
		canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h, fill: 'none', stroke: 'black', strokeWidth: sw, opacity: 1 }));
	}
	top = 400;
	h = 624;
	canvas.add(new fabric.Rect({ top : top, left : 280, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Rect({ top : top, left : 330, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Rect({ top : top, left : 390, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Rect({ top : top, left : 510, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Rect({ top : top, left : 630, width : 1, height : h, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	
	top = 400;
	font_size = 16;
	quoteInfo.outputText(canvas, "件　　名", font_size, 130, top);
	quoteInfo.outputText(canvas, "数量", font_size, 290, top);
	quoteInfo.outputText(canvas, "単位"  , font_size, 345, top);
	quoteInfo.outputText(canvas, "単　価", font_size, 430, top);
	quoteInfo.outputText(canvas, "金  額", font_size, 550, top);
	quoteInfo.outputText(canvas, "備  考", font_size, 655, top);
	// 印鑑枠	
	canvas.add(new fabric.Rect({ top : 340, left : 530, width : 150, height : 50, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Rect({ top : 340, left : 580, width : 50, height : 50, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 1 }));
	// 備考
	font_size = 11;
	canvas.add(new fabric.Rect({ top : 1040, left : left, width : w, height : 60, fill: 'none', stroke: 'black',strokeWidth: 2, opacity: 1 }));
	quoteInfo.outputText(canvas, "備  考", font_size, 70, 1045);
	quoteInfo.outputText(canvas, data.memo, font_size, 120, 1045);


	// 明細データの出力
	quoteInfo.outputQuoteList(canvas, data, 424, 16);

	canvas.calcOffset();
	canvas.renderAll();
	// canvasからイメージを取得してPDFに追加する
//	doc.addImage( $('canvas').get(0).toDataURL('image/jpeg'),'JPEG',0,0);
	doc.addImage( $('canvas').get(0).toDataURL('image/svg+xml'),'SVG',0,0);
	var filename = "御見積書";// + data.quote_issue_date + "_" + data.quote_no + "_" + data.client_name_1 + ".pdf";
	if (data.quote_issue_date != null) filename += "_" + data.quote_issue_date;
	if (data.quote_no != null) filename += "_" + data.quote_no;
	if (data.client_name_1 != null) filename += "_" + data.client_name_1;
	filename += ".pdf";
	doc.save(filename);
	canvas.setHeight(0);
	canvas.setWidth(0);
	document.body.style.cursor = "default";
	return true;
	});
};

// canvasにテキストを出力
quoteInfo.outputText = function (canvas, text,font_size,left, top) {
//	canvas.add(new fabric.Text(text, { fontFamily: 'monospace', fill: 'black', left: left, top: top, fontSize: font_size}));
	canvas.add(new fabric.Text(text, { fontFamily: 'MS PGothic',fill: 'black',left: left, top: top, fontSize: font_size * 1.2}));
};
quoteInfo.outputTextBold = function (canvas, text,font_size,left, top) {
//	canvas.add(new fabric.Text(text, { fontFamily: 'monospace', fill: 'black', left: left, top: top, fontSize: font_size}));
	canvas.add(new fabric.Text(text, { fontFamily: 'MS PGothic', fontWeight:'bold',fill: 'black',left: left, top: top, fontSize: font_size * 1.2}));
};
quoteInfo.outputTextMono = function (canvas, text,font_size,left, top) {
	canvas.add(new fabric.Text(text, { fontFamily: 'monospace', fill: 'black', left: left, top: top, fontSize: font_size * 1.2}));
};

// 見積明細データの出力
quoteInfo.outputQuoteList = function (canvas, data, top, font_size) {
	var total = 0;
	var top_wk = top;
	for (var i in data.rows) {
		var row = data.rows[i];
		quoteInfo.outputText(canvas, row.test_middle_class_name, font_size, 65, top);	// 試験中分類名
		if (row.quantity > 0)
			quoteInfo.outputText(canvas, scheduleCommon.numFormatter(row.quantity,5), font_size, 285, top);	// 数量
		quoteInfo.outputText(canvas, row.unit, font_size, 340, top);					// 単位
//		quoteInfo.outputTextMono(canvas, "\\" + scheduleCommon.numFormatter(row.unit_price,10), font_size, 420, top);// 単価
		if (row.unit_price > 0)
			quoteInfo.outputTextMono(canvas, scheduleCommon.addYenMark(scheduleCommon.numFormatter(row.unit_price,12)), font_size, 400, top);// 単価
		var pr = scheduleCommon.numFormatter(Math.round(row.price),12);
		if (row.price < 0) {
			pr = scheduleCommon.numFormatter(Math.round(row.price),12);
			pr = pr.replace("  -","▲ ");
			quoteInfo.outputTextMono(canvas, pr, font_size, 510, top);				// 金額
		} else {
			quoteInfo.outputTextMono(canvas, scheduleCommon.addYenMark(pr), font_size, 520, top);				// 金額
		}
		if (row.specific_memo.length > 0) {
			var memo_top = top;
			var memo_font_size = font_size;
			var memo_line = Math.ceil(row.specific_memo.length / 8);
			var lines = "";
			if (memo_line  > 1) {
				memo_top += 6;
				memo_font_size = Math.round(memo_font_size / (memo_line));
				for(var k = 0;k < memo_line + 1;k++) {
					lines += row.specific_memo.substring((k * 13),(k * 13) + 13) + "\n";
				}
			} else {
				lines = row.specific_memo;
			}
			quoteInfo.outputText(canvas, lines, memo_font_size, 632, memo_top);		// 備考
		}
		top += 24;
		total += Number(row.price);
	}
	top = top_wk + (22 * 24);
	var tax = total * (quoteInfo.currentConsumption_tax / 100);
	quoteInfo.outputText(canvas, "（合計）", font_size, 450, top);
	quoteInfo.outputTextMono(canvas, scheduleCommon.addYenMark(scheduleCommon.numFormatter(total,12)), font_size, 520, top);		 
	top += 24;
	quoteInfo.outputText(canvas, "（消費税）", font_size, 435, top);
	quoteInfo.outputTextMono(canvas, scheduleCommon.addYenMark(scheduleCommon.numFormatter(tax,12)), font_size, 520, top);		 
	top += 24;
	quoteInfo.outputText(canvas, " 総合計 ", font_size, 445, top);
	quoteInfo.outputTextMono(canvas, scheduleCommon.addYenMark(scheduleCommon.numFormatter(total + tax,12)), font_size, 520, top);		 
};

// 備考を選択したらテキストエリアにコピーする
quoteInfo.selectMemoList = function(event) {
	
	var val = $("#quote_form_memo_select option:selected").val();
	var memo = $("#quote_form_memo").val();
	memo = memo + val + "\n";
	$("#quote_form_memo").val(memo);
	$("#quote_form_memo_select").val("");
	
};