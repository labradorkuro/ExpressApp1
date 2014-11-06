//
// DRC殿試験案件スケジュール管理
// 案件登録・編集の処理
//
$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	if ($("#entry_no").val() === "") {
		// 案件の登録前の場合、明細と履歴は表示しない
		$("#tabs-1").css("visibility", "hidden");
		$("#tabs-2").css("visibility", "hidden");
		$("#tab1").css("display", "none");
		$("#tab2").css("display", "none");
	}
	// Tab生成
	$("#tabs").tabs();
	entryEdit.tabsActivate();
	// 日付入力設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	// ツールバーのボタンイベント設定
	// 保存ボタンイベント
	$("#save_entry").click(entryEdit.saveEntry);
	// キャンセルボタンイベント
	$("#cancel_entry").click(entryEdit.cancelEntry);
	// 閉じるボタンイベント
	$("#close_entry").click(entryEdit.closeEntry);

	scheduleCommon.changeFontSize('1.0em');
	// 明細の編集用ダイアログ（ダイアログの中身はentry_edit.jadeの中に記述されている）
	entryEdit.quoteDialog();
	// 試験（見積）明細追加ボタンイベント
	$("#add_quote").click(entryEdit.openAddDialog);
	// 試験（見積）明細編集ボタンイベント
	$("#edit_quote").click(entryEdit.openEditDialog);
	// 案件番号が入っていたら、データを取得して表示する
	if ($('#entry_no').val() != '') {
		entryEdit.requestEntryData($('#entry_no').val());
	}
});
var entryEdit = entryEdit || {};

// Gridの生成
entryEdit.tabsActivate = function() {
	// このグリッドは試験（見積）明細タブの中身になる
	jQuery("#test_list").jqGrid({
		url: '/quote_get/' + $('#entry_no').val(),
		altRows: true,
		datatype: "json",
		colNames: ['見積番号', '明細番号','試験項目CD', '試験項目名','試料名','到着日','計画書番号',
			'被験者数','検体数','報告書番号','報告書提出期限','報告書提出日',
			'速報提出期限１','速報提出日１','速報提出期限２','速報提出日２','期待値/設定値',
			'値説明','単位CD','単位','単価','数量','見積金額','備考','作成日','作成者','更新日','更新者'],
			colModel: [
			{ name: 'quote_no' , index: 'quote_no', width: 120 }, // 見積番号
			{ name: 'quote_detail_no', index: 'quote_detail_no', width: 120 }, // 明細番号
			{ name: 'test_item_cd', index: 'test_item_cd', width: 120 }, // 試験項目CD
			{ name: 'test_item', index: 'test_item', width: 120 }, // 試験項目名
			{ name: 'sample_name', index: 'sample_name', width: 120 }, // 試料名
			{ name: 'arrive_date', index: 'arrive_date', width: 120 }, // 到着日
			{ name: 'test_planning_no', index: 'test_planning_no', width: 120 }, // 試験計画書番号
			{ name: 'monitors_num', index: 'monitors_num', width: 120 }, // 被験者数
			{ name: 'sample_volume', index: 'sample_volume', width: 120 }, // 検体数
			{ name: 'final_report_no', index: 'final_report_no', width: 120 }, // 報告書番号
			{ name: 'final_report_limit', index: 'final_report_limit', width: 120 }, // 報告書提出期限
			{ name: 'final_report_date', index: 'final_report_date', width: 120 }, // 報告書提出日
			{ name: 'quick_report_limit1', index: 'quick_report_limit1', width: 120 }, // 速報提出期限1
			{ name: 'quick_report_date1', index: 'quick_report_date1', width: 120 }, // 速報提出日1
			{ name: 'quick_report_limit2', index: 'quick_report_limit2', width: 120 }, // 速報提出期限2
			{ name: 'quick_report_date2', index: 'quick_report_date2', width: 120 }, // 速報提出日2
			{ name: 'expect_value', index: 'expect_value', width: 120 }, // 期待値・設定値
			{ name: 'descript_value', index: 'descript_value', width: 120 }, // 値説明
			{ name: 'unit_cd', index: 'unit', width: 120 }, // 単位CD
			{ name: 'unit', index: 'unit', width: 120 }, // 単位
			{ name: 'unit_price', index: 'unit_price', width: 120 }, // 単価
			{ name: 'quantity', index: 'quantity', width: 120 }, // 数量
			{ name: 'quote_price', index: 'quote_price', width: 120 }, // 見積金額
			{ name: 'test_memo', index: 'test_memo', width: 120 }, // 備考
			{ name: 'created', index: 'created', width: 120 }, // 作成日
			{ name: 'created_id', index: 'created_id', width: 120 }, // 作成者ID
			{ name: 'updated', index: 'updated', width: 120 }, // 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },			// 更新者ID
		],
		rowNum: 20,
		rowList: [10,20,30],
		pager: '#test_list_pager',
		sortname: 'quote_detail_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "試験（見積）情報"
	});
	jQuery("#test_list").jqGrid('navGrid', '#test_list_pager', { edit: false, add: false, del: false });
};

// 試験（見積）入力ダイアログの生成
entryEdit.quoteDialog = function() {
	$("#quote_dialog").dialog({
		autoOpen: false,
		width: '800px',
		title: '試験（見積）項目編集',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"保存": function () {
				entryEdit.saveQuote();
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
	$(".dlg_table").find("td").attr("align", "right");
};

// 案件データの読込み
entryEdit.requestEntryData = function(no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/entry_get/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = entryEdit.onloadEntryReq;
	xhr.send();
};

// 案件データの保存
entryEdit.saveEntry = function () {
	// checkboxのチェック状態確認と値設定
	entryEdit.checkCheckbox();
	// formデータの取得
	var form = entryEdit.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/entry_post', true);
	xhr.responseType = 'json';
	xhr.onload = entryEdit.onloadEntryReq;
	xhr.send(form);
};

// checkboxのチェック状態確認と値設定
entryEdit.checkCheckbox = function() {
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
// formデータの取得
entryEdit.getFormData = function () {
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

// 保存後のコールバック
entryEdit.onloadEntryReq = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		// formに取得したデータを埋め込む
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
		
	}
};

entryEdit.cancelEntry = function() {
	scheduleCommon.closeModalWindow();
};

entryEdit.closeEntry = function() {
	scheduleCommon.closeModalWindow();
};
// 試験（見積）明細ダイアログを開く
entryEdit.openAddDialog = function () {
	var quote = [];
	quote.quote_no = '';
	entryEdit.clearQuoteFormData(quote);
	$("#quote_dialog").dialog("open");
};
entryEdit.openEditDialog = function () {
	// 明細リストが選択されていたら、そのデータをダイアログのフィールドにセットしてから開く
	var quote = entryEdit.getSelectQuote();
	if (quote != null) {
		entryEdit.setQuoteFormData(quote);
	}
	$("#quote_dialog").dialog("open");
};
entryEdit.getSelectQuote = function () {
	var grid = $("#test_list");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};
entryEdit.clearQuoteFormData = function (quote) {
	$('#quote_no_dlg').val(quote.quote_no); // 見積番号
	$('#quote_detail_no').val(''); // 明細番号
	$('#test_item_cd').val(''); // 試験項目CD
	$('#test_item').val('');	// 試験項目名
	$('#sample_name').val('');	// 試料名
	$('#arrive_date').val(''); // 到着日
	$('#test_planning_no').val(''); // 試験計画書番号
	$('#monitors_num').val(''); // 被験者数
	$('#sample_volume').val(''); // 検体数
	$('#final_report_no').val(''); // 報告書番号
	$('#final_report_limit').val(''); // 報告書提出期限
	$('#final_report_date').val(''); // 報告書提出日
	$('#quick_report_limit1').val(''); // 速報提出期限1
	$('#quick_report_date1').val(''); // 速報提出日1
	$('#quick_report_limit2').val(''); // 速報提出期限2
	$('#quick_report_date2').val(''); // 速報提出日2
	$('#expect_value').val(''); // 期待値・設定値
	$('#descript_value').val(''); // 値説明
	$('#unit_cd').val('01'); // 単位CD
	$('#unit').val(''); // 単位
	$('#unit_price').val(''); // 単価
	$('#quantity').val(''); // 数量
	$('#quote_price').val(''); // 見積金額
	$('#test_memo').val(''); // 備考
	$('#quote_delete_check').val(0); // 削除フラグ
	$('#quote_delete_reason').val(''); // 削除理由
};
entryEdit.setQuoteFormData = function (quote) {
	$('#quote_no_dlg').val(quote.quote_no); // 見積番号
	$('#quote_detail_no').val(quote.quote_detail_no); // 明細番号
	$('#test_item_cd').val(quote.test_item_cd); // 試験項目CD
	$('#test_item').val(quote.test_item);	// 試験項目名
	$('#sample_name').val(quote.sample_name);	// 試料名
	$('#arrive_date').val(quote.arrive_date); // 到着日
	$('#test_planning_no').val(quote.test_planning_no); // 試験計画書番号
	$('#monitors_num').val(quote.monitors_num); // 被験者数
	$('#sample_volume').val(quote.sample_volume); // 検体数
	$('#final_report_no').val(quote.final_report_no); // 報告書番号
	$('#final_report_limit').val(quote.final_report_limit); // 報告書提出期限
	$('#final_report_date').val(quote.final_report_date); // 報告書提出日
	$('#quick_report_limit1').val(quote.quick_report_limit1); // 速報提出期限1
	$('#quick_report_date1').val(quote.quick_report_date1); // 速報提出日1
	$('#quick_report_limit2').val(quote.quick_report_limit2); // 速報提出期限2
	$('#quick_report_date2').val(quote.quick_report_date2); // 速報提出日2
	$('#expect_value').val(quote.expect_value); // 期待値・設定値
	$('#descript_value').val(quote.descript_value); // 値説明
	$('#unit_cd').val(quote.unit_cd); // 単位
	$('#unit').val(quote.unit); // 単位
	$('#unit_price').val(quote.unit_price); // 単価
	$('#quantity').val(quote.quantity); // 数量
	$('#quote_price').val(quote.quote_price); // 見積金額
	$('#test_memo').val(quote.test_memo); // 備考
	$('#quote_delete_check').val(quote.quote_delete_check); // 削除フラグ
	$('#quote_delete_reason').val(quote.quote_delete_reason); // 削除理由
};
// 試験（見積）データの保存
entryEdit.saveQuote = function () {
	// 案件番号の取得
	var no = $("#entry_no").val();
	// checkboxのチェック状態確認と値設定
	entryEdit.checkQuoteCheckbox();
	// formデータの取得
	var form = entryEdit.getQuoteFormData();
	// 案件番号をフォームデータに追加する
	form.append('entry_no', no);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/quote_post', true);
	xhr.responseType = 'json';
	xhr.onload = entryEdit.onloadQuoteReq;
	xhr.send(form);
};

// checkboxのチェック状態確認と値設定
entryEdit.checkQuoteCheckbox = function () {
	if ($("#quote_delete_check:checked").val()) {
		$("#quote_delete_check").val('1');
	}
};
// formデータの取得
entryEdit.getQuoteFormData = function () {
	var form = new FormData(document.querySelector("#quoteForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#quote_delete_check:checked").val()) {
		form.append('quote_delete_check', '0');
	}
	return form;
};
entryEdit.onloadQuoteReq = function (e) {
	if (this.status == 200) {
		var quote = this.response;
		$('#quote_no_dlg').val(quote.quote_no);
		$('#quote_detail_no').val(quote.quote_detail_no);
		alert('試験（見積）明細が保存されました。');
	}
};