//
// DRC殿試験案件スケジュール管理
// 見積情報の処理
//

//
// 見積入力、リスト表示に関する処理
//
var quoteInfo = quoteInfo || {};
quoteInfo.currentEntry = {};			// 案件リストで選択中の案件情報
quoteInfo.currentQuoteRowId = 0;				// 選択中の見積リスト行ID
// イベント処理のバインド
quoteInfo.eventBind = function() {
	$(".add_row_btn").bind("click", quoteInfo.addQuoteRow);
	$(".del_row_btn").bind("click", quoteInfo.delQuoteRow);
}

// 明細入力用ダイアログの生成
quoteInfo.createQuoteDialog = function () {
	$('#quote_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 600,
		title: '試験（見積）明細',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (quoteInfo.saveQuote()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (quoteInfo.saveQuote()) {
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
				// 印刷用データを作成する
				var data = quoteInfo.printDataSetup();
				// データを渡してPDFを生成する
				if (quoteInfo.printQuote(data)) {
					// データの保存
					if (quoteInfo.saveQuote()) {
						$(this).dialog('close');
					}
				}
			},
			"登録": function () {
				// データの保存
				if (quoteInfo.saveQuote()) {
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
quoteInfo.printDataSetup = function () {
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

// 見積情報リストグリッドの生成(noは案件番号）
quoteInfo.createQuoteInfoGrid = function (no) {
	
	// checkboxの状態取得	
	var delchk = quoteInfo.getQuoteDeleteCheckDispCheck();
	jQuery("#quote_list").jqGrid({
		url: '/quote_get/' + no + '/?quote_delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','見積番号', '見積日','有効期限','被験者数','見積書提出','受注ステータス','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no' , index: 'entry_no', width: 80, align: "center" },				// 案件番号
			{ name: 'quote_no' , index: 'quote_no', width: 80, align: "center" },				// 見積番号
			{ name: 'quote_date' , index: 'quote_date', width: 120, align: "center" },			// 見積日
			{ name: 'expire_date' , index: 'expire_date', width: 120, align: "center" },		// 有効期限
			{ name: 'monitors_num', index: 'monitors_num', width: 80,align:"right" },			// 被験者数
			{ name: 'quote_submit_check', index: 'quote_submit_check', width: 120,align:"center",formatter:quoteInfo.submitCheckFormatter },			// 受注ステータス
			{ name: 'order_status', index: 'order_status', width: 120,align:"center",formatter:quoteInfo.orderCheckFormatter },			// 受注ステータス
			{ name: 'created', index: 'created', width: 120, align: "center" },					// 作成日
			{ name: 'created_id', index: 'created_id', width: 120 },							// 作成者ID
			{ name: 'updated', index: 'updated', width: 120, align: "center" },					// 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 }								// 更新者ID
		],
		height: "115px",
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
quoteInfo.submitCheckFormatter = function(no) {
	if (no == 1) {
		return "未提出";
	} else {
		return "提出済";
	}
};
quoteInfo.orderCheckFormatter = function(no) {
	if (no == 1) {
		return "商談中";
	} else {
		return "受注確定";
	}
};
// 見積明細リストグリッドの生成
quoteInfo.createQuoteSpecificGrid = function (no) {
	// checkboxの状態取得	
	var delchk = quoteInfo.getQuoteDeleteCheckDispCheck();
	jQuery("#quote_specific_list").jqGrid({
		url: '/quote_specific_get/' + no + '/?quote_specific_delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','見積番号', '明細番号','','試験中分類名','単位','単価','数量','見積金額','集計チェック','作成日','作成者','更新日','更新者','削除フラグ','削除理由'],
		colModel: [
			{ name: 'entry_no' , index: 'entry_no', width: 80, align: "center" },				// 案件番号
			{ name: 'quote_no' , index: 'quote_no', width: 80, align: "center" },				// 見積番号
			{ name: 'quote_detail_no', index: 'quote_detail_no', width: 80, align: "center" },	// 明細番号
			{ name: 'test_middle_cd', index: 'test_middle_cd', hidden:true },					// 試験中分類CD
			{ name: 'test_middle_name', index: 'test_middle_name', width: 200 },				// 試験中分類名
			{ name: 'unit', index: 'unit', width: 60,align:"center" },							// 単位
			{ name: 'unit_price', index: 'unit_price', width: 60,align:"right" },				// 単価
			{ name: 'quantity', index: 'quantity', width: 60,align:"right" },					// 数量
			{ name: 'quote_price', index: 'quote_price', width: 60,align:"right" },				// 見積金額
			{ name: 'quote_summary_check', index: 'quote_summary_check', width: 120 },			// 集計対象チェック
			{ name: 'created', index: 'created', width: 120 },									// 作成日
			{ name: 'created_id', index: 'created_id', width: 120 },							// 作成者ID
			{ name: 'updated', index: 'updated', width: 120 },									// 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },							// 更新者ID
			{ name: 'quote_delete_check', index: 'quote_delete_check', hidden: true },			// 削除フラグ
			{ name: 'quote_delete_reason', index: 'quote_delete_reason', hidden: true },		// 削除理由
		],
		height: "130px",
		width:960,
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

// 編集用ダイアログの表示
quoteInfo.openQuoteDialog = function (event) {
	var quote = {};
	quote.quote_no = '';
	quoteInfo.clearQuoteFormData(quote);
	if ($(event.target).attr('id') == 'edit_quote') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		var quote = quoteInfo.getSelectQuote();
		quoteInfo.setQuoteFormData(quote);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}
	$("#quote_dialog").dialog("open");
};
// 見積書ダイアログ表示
quoteInfo.openQuoteFormDialog = function (event) {
	// 選択中の案件情報を取得する
	var entry = event.data.entryList.currentEntry;
	quoteInfo.currentEntry = entry;
	var quote = {};
	if ($(event.target).attr("id") == "edit_quote") {
		// 見積の編集ボタン押下時は選択中の見積情報を取得する
		quote = $("#quote_list").getRowData(quoteInfo.currentQuoteRowId);
		quoteInfo.setQuoteFormData(quote);
	} else {
	}
	$("#billing_company_name_1").val(entry.client_name_1);
	$("#billing_company_name_2").val(entry.client_name_2);
	$("#billing_division").val(entry.client_division_name);
	$("#billing_person").val(entry.client_person_name);
	$("#drc_division_name").text("  試験課 " + entry.test_large_class_name);
	$("#drc_test_person").text("  担当者 " + entry.test_person_id);
	$("#quote_title").val(entry.entry_title);
	$("#quoteForm_dialog").dialog("open");
};

// 見積の選択イベント処理
quoteInfo.onSelectQuote = function(rowid) {
	// 編集ボタンを表示
	quoteInfo.enableQuoteButtons(true, 2);
	quoteInfo.currentQuoteRowId = rowid;	

};

// 明細追加、編集ボタンの表示・非表示
quoteInfo.enableQuoteButtons = function(enable, kind) {
	if (enable) {
		if (kind == 1) {
			$("#add_quote").css("display", "inline");
			$("#edit_quote").css("display", "none");
			$("#quote_delete_check_disp").css("display", "inline");
			$("#quote_delete_disp").css("display", "inline");
		} else if (kind == 2) {
			$("#edit_quote").css("display", "inline");
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
// 試験（見積）情報の入力フォームをクリアする
quoteInfo.clearQuoteFormData = function (quote) {
	$('#estimate_quote_no').val(''); // 見積番号
	$('#quote_title').val('');				// 試験タイトル
	$('#estimate_monitors_num').val('');				// 被験者数
	$('#quote_submit_check_no').prop("checked",true);	// 見積書提出済フラグ
	$('#order_status_no').prop("checked",true);			// 受注ステータス
//	$('#unit').val('');						// 単位
//	$('#unit_price').val('0');				// 単価
//	$('#quantity').val('0');				// 数量
//	$('#quote_price').val('0');				// 見積金額
//	$('#entry_memo').val('');				// 備考
//	$('#quote_delete_check').prop("checked",false);	// 削除フラグ
};
// 見積書フォームにデータをセットする
quoteInfo.setQuoteFormData = function (quote) {
	$('#estimate_quote_no').val(quote.quote_no);		// 見積番号
	$('#estimate_monitors_num').val(quote.monitors_num);// 被験者数
	$('#quote_date').val(quote.quote_date);				// 見積日
	$('#expire_date').val(quote.expire_date);			// 有効期限
	if (quote.quote_submit_check == "未提出") {
		$('#quote_submit_check_no').prop("checked",true);	// 見積書提出済フラグ
	} else if (quote.quote_submit_check == "提出済"){
		$('#quote_submit_check_yes').prop("checked",true);
	}
	if (quote.order_status == "商談中") {
		$('#order_status_no').prop("checked",true);			// 受注ステータス
	} else if (quote.order_status == "受注確定") {
		$('#order_status_yes').prop("checked",true);
	}
//	$('#unit').val(quote.unit);							// 単位
//	$('#unit_price').val(quote.unit_price);				// 単価
//	$('#quantity').val(quote.quantity);					// 数量
//	$('#quote_price').val(quote.quote_price);			// 見積金額
//	$('#entry_memo').val(quote.entry_memo);				// 備考
//	if (quote.quote_delete_check == 1) {
//		$('#quote_delete_check').prop("checked", true);		// 削除フラグ
//	} else {
//		$('#quote_delete_check').prop("checked", false);	// 削除フラグ
//	}
};
// 試験（見積）データの保存
quoteInfo.saveQuote = function () {
	// 入力値チェック
	if (!quoteInfo.quoteInputCheck()) {
		return false;
	}
	// formデータの取得
	var form = quoteInfo.getQuoteFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/quote_post', true);
	xhr.responseType = 'json';
	xhr.onload = quoteInfo.onloadQuoteReq;
	xhr.send(form);
	return true;
};
quoteInfo.quoteInputCheck = function () {
	var result = true;
	if (!result) {
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
		$('#quote_no').val(quote.quote_no);
		// グリッドの再表示
		$("#quote_list").GridUnload();
		quoteInfo.createQuoteInfoGrid(quoteInfo.currentEntry.entry_no);

	}
};

// 削除分の表示チェックイベント（明細）
quoteInfo.changeQuoteOption = function (event) {
	var entry = quoteInfo.getSelectEntry();
	$("#quote_list").GridUnload();
	quoteInfo.createQuoteInfoGrid(entry.entry_no);
};
// 試験（見積）の削除分を表示のチェックボックス情報取得
quoteInfo.getQuoteDeleteCheckDispCheck = function () {
	var dc = $("#quote_delete_check_disp").prop("checked");
	var delchk = (dc) ? 1:0;
	return delchk;
};

// 見積書の印刷（PDF生成）
quoteInfo.printQuote = function (data) {
	var canvas = new fabric.Canvas('canvas', { backgroundColor : "#fff" });
	canvas.setHeight(1500);
	canvas.setWidth(900);
	var doc = new jsPDF();
	
	var top = 100;
	var font_size = 25;
	// タイトル	
	quoteInfo.outputText(canvas, data.title, font_size, 80, 40);
	// 請求先情報	
	font_size = 16;
	var left = 60;
	top = 100;
	if (data.client_name_1 != null)
		quoteInfo.outputText(canvas, data.client_name_1, font_size, left, top);
	top += font_size + 2;
	if (data.client_name_2 != null)
		quoteInfo.outputText(canvas, data.client_name_2, font_size, left, top);
	top += font_size + 2;
	if (data.prepared_division != null)
		quoteInfo.outputText(canvas, data.prepared_division, font_size, left, top);
	top += font_size + 2;
	if (data.prepared_name != null)
		quoteInfo.outputText(canvas, data.prepared_name, font_size, left, top);
	// 見積内容	
	top += font_size + 10;
	quoteInfo.outputText(canvas, "下記の通りお見積申し上げます。", font_size, left, top);
	top += font_size + 2;
	quoteInfo.outputText(canvas, "件名：" + data.quote_title, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));

	quoteInfo.outputText(canvas, data.quote_title1, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	
	quoteInfo.outputText(canvas, data.quote_title2, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	
	quoteInfo.outputText(canvas, data.quote_title3, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	top += 10;
	quoteInfo.outputText(canvas, "有効期限：" + data.quote_expire, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 200, height : 1 }));
	font_size = 18;
	quoteInfo.outputText(canvas, "御見積合計金額　" + data.quote_total_price, font_size, left, top);
	top += font_size + 3;
	canvas.add(new fabric.Rect({ top : top, left : left, width : 250, height : 2 }));
	// 見積情報
	font_size = 16;
	left = 340;
	top = 100;
	if (data.quote_issue_date != null)
		quoteInfo.outputText(canvas, "見積日：" + data.quote_issue_date, font_size, left, top);
	top += font_size + 2;
	if (data.quote_no != null)
		quoteInfo.outputText(canvas, "見積番号：" + data.quote_no, font_size, left, top);
	// 自社情報
	top += font_size + 2;
	quoteInfo.outputText(canvas, data.drc_address1, font_size, left, top);
	top += font_size + 2;
	quoteInfo.outputText(canvas, data.drc_name, font_size, left, top);
	top += font_size + 2;
	quoteInfo.outputText(canvas, data.drc_tel, font_size, left, top);
	top += font_size + 2;
	quoteInfo.outputText(canvas, data.drc_fax, font_size, left, top);
	top += font_size + 20;
	quoteInfo.outputText(canvas, data.drc_division_name, font_size, left, top);
	top += font_size + 2;
	quoteInfo.outputText(canvas, data.drc_prepared, font_size, left, top);
	
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
	quoteInfo.outputText(canvas, "件　　名", font_size, 130, top);
	quoteInfo.outputText(canvas, "単位"  , font_size, 290, top);
	quoteInfo.outputText(canvas, "数  量", font_size, 365, top);
	quoteInfo.outputText(canvas, "単  価", font_size, 465, top);
	quoteInfo.outputText(canvas, "金  額", font_size, 570, top);
	quoteInfo.outputText(canvas, "備  考", font_size, 665, top);
	// 印鑑枠	
	canvas.add(new fabric.Rect({ top : 300, left : 530, width : 210, height : 70, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : 300, left : 600, width : 70, height : 70, fill: 'none', stroke: 'black', strokeWidth: 1, opacity: 0.7 }));
	// 明細データの出力
	quoteInfo.outputQuoteList(canvas, data, 420, 16);

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
	xhr.open('POST', '/print_pdf/' + quoteInfo.currentEntryNo, true);
	xhr.responseType = 'application/pdf';
	xhr.onload = quoteInfo.onloadPrintPDFReq;
	xhr.send();
 * **/
};

// canvasにテキストを出力
quoteInfo.outputText = function (canvas, text,font_size,left, top) {
	canvas.add(new fabric.Text(text, { fontFamily: 'Meiryo UI', fill: 'black', left: left, top: top, fontSize: font_size }));
};

// 見積明細データの出力
quoteInfo.outputQuoteList = function (canvas, data, top, font_size) {
	for (var i in data.rows) {
		var row = data.rows[i];
		quoteInfo.outputText(canvas, row.name, font_size, 65, top);			// 件名
		quoteInfo.outputText(canvas, row.unit, font_size, 295, top);		// 単位
		quoteInfo.outputText(canvas, row.quantity, font_size, 370, top);	// 数量
		quoteInfo.outputText(canvas, row.unit_price, font_size, 470, top);	// 単価
		quoteInfo.outputText(canvas, row.price, font_size, 575, top);		// 金額
		quoteInfo.outputText(canvas, row.memo, font_size, 670, top);		// 備考
		top += 20;
	}
};
quoteInfo.onloadPrintPDFReq = function () {
};

// 行追加ボタン押下イベント処理
quoteInfo.addQuoteRow = function(event) {
	// 現在の行数を取得する（見出し行を含む）
	var rows = $("#meisai_table tbody").children().length;
	// 行に追加する要素
	var id = "test_middle_class_cd_" + rows;
	var name = $("<td class='name'><input type='text' id='" + id + "' name='" + id + "' size='20'/></td>");
	id = "unit_" + rows;
	var unit = $("<td class='unit'><input type='text' id='" + id + "' name='" + id + "' size='4'/></td>");
	id = "qty_" + rows;
	var qty = $("<td class='qty'><input type='text' class='" + id + "' id='" + id + "' name='qty' size='4'/></td>");
	var id = "unit_price_" + rows;
	var unit_price = $("<td class='unit_price'><input type='text' class='num_type' id='" + id + "' name='" + id + "' size='9'/></td>");
	var id = "price_" + rows;
	var price = $("<td class='price'><input type='text' class='num_type' id='" + id + "' name='" + id + "' size='12'/></td>");
	var id = "summary_" + rows;
	var summary = $("<td class='memo'><label><input type='checkbox' id='" + id + "' name='" + id + "'/>集計する</label></td>");
	var id = "memo_" + rows;
	var memo = $("<td class='memo'><input type='text' id='" + id + "' name='" + id + "' size='12'/></td>");
	var id = "del_row_btn_" + rows;
	var button = $("<td><input type='button' id='" + id + "' class='del_row_btn' name='" + id + "' value='行削除'/></td>");

	var id = "row_" + rows;
	var row = $("<tr id='" + id + "'></tr>");
	$(row).append(name);
	$(row).append(unit);
	$(row).append(qty);
	$(row).append(unit_price);
	$(row).append(price);
	$(row).append(summary);
	$(row).append(memo);
	$(row).append(button);
	var id = $(event.target).attr("id");
	if (id != "") {
		var s = id.split("_");
		if (s.length == 3) {
			var no = s[2];
			var parent_tr = event.target.parentElement.parentElement;
			$("#meisai_table tbody").append(row);
			// 行削除ボタンのイベント登録
			$(".del_row_btn").bind("click",quoteInfo.delQuoteRow);
		}
	}
}

// 行削除ボタン押下イベント処理
quoteInfo.delQuoteRow = function(event) {
	var id = $(event.target).attr("id");
	var parent_tr = event.target.parentElement.parentElement;
	// その行を非表示にする
	$(parent_tr).css("display","none");
}

// テーブル行のデータ取得
quoteInfo.getRowsData = function() {
	$.each($("#meisai_table tbody").children(),function() {
	});
}
 