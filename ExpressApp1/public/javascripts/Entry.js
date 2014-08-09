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
	$( "#tabs1" ).tabs();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	// 保存ボタンイベント
	$("#save_entry").click(entryEdit.saveEntry);
	// キャンセルボタンイベント
	$("#cancel_entry").click(entryEdit.cancelEntry);
	// 閉じるボタンイベント
	$("#close_entry").click(entryEdit.closeEntry);

	// このグリッドは試験（見積）明細タブの中身になる
	jQuery("#test_list").jqGrid({
		//url:'db?q=5',
		altRows: true,
		datatype: "json",
		colNames:['見積番号', '見積（試験）項目', '検体数','検体（試料）名','到着日','計画書番号','報告書番号',
				'報告書提出期限','報告書提出日','速報提出期限１','速報提出日１','速報提出期限２','速報提出日２','期待値/設定値','単位','備考'],
		colModel:[
			{name:'quote_no', index:'quote_no', width:110},
			{name:'test_item', index:'test_item', width:120},
			{name:'quantity', index:'quantity', width:100},
			{name:'sample_name', index:'sample_name', width:200},
			{name:'arrive_date', index:'arrive_date', width:100,align:"center"},
			{name:'test_planning_no', index:'test_planning_no', width:100, align:"center"},
			{name:'final_report_no', index:'final_report_no', width:100},
			{name:'final_report_limit', index:'final_report_limit', width:110, align:"center"},
			{name:'final_report_date', index:'final_report_date', width:110, align:"center"},
			{name:'quick_report_limit1', index:'quick_report_limit1', width:110, align:"center"},
			{name:'quick_report_date1', index:'quick_report_date1', width:110, align:"center"},
			{name:'quick_report_limit2', index:'quick_report_limit2', width:110, align:"center"},
			{name:'quick_report_date2', index:'quick_report_date2', width:110, align:"center"},
			{name:'expect_value', index:'expect_value', width:110},
			{name:'unit', index:'unit', width:100, align:"center"},
			{name:'memo', index:'memo', width:100}


		],
		rowNum:20,
		rowList:[10,20,30],
		pager: '#test_list_pager',
		sortname: 'quote_no',
		viewrecords: true,
		sortorder: "desc",
		caption:"見積（試験）情報"
	});
	jQuery("#test_list").jqGrid('navGrid','#test_list_pager',{edit:false,add:false,del:false});
	scheduleCommon.changeFontSize('1.4em');
	// 明細の編集用ダイアログ（ダイアログの中身はentry_edit.jadeの中に記述されている）
	$("#estimate_dialog").dialog({
		autoOpen: false,
		width:'800px',
		title: '試験（見積）項目編集',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"追加": function(){
					$(this).dialog('close');
				},
				"OK": function(){
					$(this).dialog('close');
				},
				"CANCEL": function(){
					$(this).dialog('close');
				}
			}
	});
	$(".dlg_table").find("td").attr("align", "right");
	// 試験（見積）明細追加ボタンイベント
	$("#add_estimate").click(entryEdit.openDialog);
	if ($('#entry_no').val() != '') {
		entryEdit.requestEntryData($('#entry_no').val());
	}
});
var	entryEdit = entryEdit || {};

// 案件データの読込み
entryEdit.requestEntryData = function(no) {
	var xhr = new XMLHttpRequest();
	//var form = new FormData();
	//form.append('no', no);
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
		$("#quoto_no").val(entry.quoto_no); // 見積番号
		$("#quoto_issue_date").val(entry.quoto_issue_date); // 見積書発行日
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

entryEdit.openDialog = function() {
	$("#estimate_dialog").dialog("open");
};