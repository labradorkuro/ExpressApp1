//
// 入金予測集計画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  yosokuList.init();
  // 権限チェック
  yosokuList.checkAuth();
  $.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo("");
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
  // 検索ボタンのクリックイベント登録
  $("#search_button").bind('click',yosokuList.onSearchButton);
  $("#nyukin_list_print").bind('click',yosokuList.nyukinListPrint);
});

// 処理用オブジェクト
var yosokuList = yosokuList || {}

// 初期化処理
yosokuList.init = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#start_date").val(today);
  $("#end_date").val(today);
  yosokuList.createEntryDialog();
}
// 検索ボタンクリック処理
yosokuList.onSearchButton = function(ui,event) {
  // グリッドのクリア
  $("#yosoku_list").GridUnload();
  $("#yosoku_list_detail").GridUnload();
  // グリッドの生成（検索集計、結果表示）
  if ($("#search_option_all").prop('checked')) {
    // 全社
    yosokuList.createGrid_all();
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    yosokuList.createGrid_division();
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    yosokuList.createGrid_client();
  }
}
// 権限チェック
yosokuList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};
// 検索集計結果を表示するグリッドの生成処理（全社）
yosokuList.createGrid_all = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/nyukin_yosoku_summary?op=all&start_date=" + sd + "&end_date=" + ed;
	jQuery("#yosoku_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['案件No.','試験大分類','試験中分類','クライアント名','代理店','試験タイトル','売上税抜','消費税','売上計','請求日','入金日',
    '入金予定日','営業担当者'],
		colModel: [
      { name: 'entry_no', index: 'entry_no', width: 200, align: "center" },
			{ name: 'test_large_class_name', index: 'test_large_class_name', width: 160, align: "center" },
      { name: 'test_middle_class_name', index: 'test_middle_class_name', width: 160, align: "center" },
      { name: 'client_name', index: 'client_name', width: 160, align: "center" },
      { name: 'agent_name', index: 'agent_name', width: 160, align: "center" },
      { name: 'entry_title', index: 'entry_title', width: 160, align: "center" },
      { name: 'yosoku_sum', index: 'yosoku_sum', width: 100, align: "right",formatter:yosokuList.numFormatterC },
      { name: 'yosoku_tax', index: 'yosoku_tax', width: 100, align: "right",formatter:yosokuList.numFormatterC },
      { name: 'yosoku_total', index: 'yosoku_total', width: 100, align: "right",formatter:yosokuList.numFormatterC },
      { name: 'seikyu_date', index: 'seikyu_date', width: 120, align: "center" },
      { name: 'nyukin_date', index: 'nyukin_date', width: 120, align: "center" },
      { name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 120, align: "center" },
      { name: 'sales_person_name', index: 'sales_person_name', width: 160, align: "center" },
		],
		height:240,
		//width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#yosoku_pager',
    pagerpos: 'left',
    recordpos: 'center',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "入金予測集計(全社)",
    onSelectRow:yosokuList.onSelectNyukinList,
    loadComplete:yosokuList.loadCompleteUgiageSummary
	});
	jQuery("#yosoku_list").jqGrid('navGrid', '#yosoku_pager', { edit: false, add: false, del: false ,search:false});
  $('#yosoku_pager_left table.ui-pg-table').css('float','left');
  $('#yosoku_pager_left').css('width','30%');
  $('#yosoku_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  yosokuList.getUriageTotal(sd,ed);
};

// 売上集計総合計の取得
yosokuList.getUriageTotal = function(start_date, end_date) {
  $.get('/nyukin_yosoku_total?start_date=' + start_date + '&end_date=' + end_date,function(response) {
    if (response.nyukin_yosoku_total) {
      $("#yosoku_total").text('合計：' + yosokuList.numFormatterC(response.nyukin_yosoku_total) + '円');
    }
  });
}
// 案件リストの表示用グリッド生成
yosokuList.createGrid_list = function(list_kind,division_cd) {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/nyukin_yosoku_detail?op=" + list_kind + "&start_date=" + sd + "&end_date=" + ed;
  if (division_cd != "") {
    req_url += "&division_cd=" + division_cd;
  }
	jQuery("#yosoku_list_detail").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
    colNames: ['案件No.','試験大分類','試験中分類','クライアント名','代理店','試験タイトル','売上(税抜)','消費税','売上計','請求日','入金日',
    '入金予定日','営業担当者'],
		colModel: [
      { name: 'entry_no', index: 'entry_no', width: 200, align: "center" },
			{ name: 'test_large_class_name', index: 'test_large_class_name', width: 160, align: "center" },
      { name: 'test_middle_class_name', index: 'test_middle_class_name', width: 160, align: "center" },
      { name: 'client_name', index: 'client_name', width: 160, align: "center" },
      { name: 'agent_name', index: 'agent_name', width: 160, align: "center" },
      { name: 'entry_title', index: 'entry_title', width: 160, align: "center" },
      { name: 'yosoku_sum', index: 'yosoku_sum', width: 100, align: "right",formatter:yosokuList.numFormatterC },
      { name: 'yosoku_tax', index: 'yosoku_tax', width: 100, align: "right",formatter:yosokuList.numFormatterC },
      { name: 'yosoku_total', index: 'yosoku_total', width: 100, align: "right",formatter:yosokuList.numFormatterC },
      { name: 'seikyu_date', index: 'seikyu_date', width: 120, align: "center" },
      { name: 'nyukin_date', index: 'nyukin_date', width: 120, align: "center" },
      { name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 120, align: "center" },
      { name: 'sales_person_name', index: 'sales_person_name', width: 160, align: "center" },
		],
		height:240,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#yosoku_detail_pager',
    pagerpos: 'left',
    recordpos: 'center',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "案件リスト",
		onSelectRow:yosokuList.onSelectNyukinListDetail,
    loadComplete:yosokuList.loadCompleteUgiageList
	});
	jQuery("#yosoku_list_detail").jqGrid('navGrid', '#yosoku_detail_pager', { edit: false, add: false, del: false ,search:false});
  $('#yosoku_detail_pager_left table.ui-pg-table').css('float','left');
  $('#yosoku_detail_pager_left').css('width','30%');
  $('#yosoku_detail_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
};

// 検索集計結果を表示するグリッドの生成処理（試験課別）
yosokuList.createGrid_division = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/nyukin_yosoku_summary?op=division&start_date=" + sd + "&end_date=" + ed;
	jQuery("#yosoku_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['CD','試験課','売上(税抜)','消費税','売上計'],
		colModel: [
      { name: 'division_cd', index: 'division_cd', hidden:true, sortable:true},
      { name: 'division', index: 'division', width: 300, align: "center" ,sortable:true},
			{ name: 'yosoku_sum', index: 'yosoku_sum', width: 200, align: "right",formatter:yosokuList.numFormatterC },
			{ name: 'yosoku_tax', index: 'yosoku_tax', width: 200, align: "right",formatter:yosokuList.numFormatterC },
			{ name: 'yosoku_total', index: 'yosoku_total', width: 200, align: "right",formatter:yosokuList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#yosoku_pager',
    pagerpos: 'left',
    recordpos: 'center',
		sortname: 'division_cd',
		viewrecords: true,
		sortorder: "asc",
		caption: "入金予測集計(試験課別)",
		onSelectRow:yosokuList.onSelectUriageSummary,
    loadComplete:yosokuList.loadCompleteUgiageSummary
	});
	jQuery("#yosoku_list").jqGrid('navGrid', '#yosoku_pager', { edit: false, add: false, del: false ,search:false});
  $('#yosoku_pager_left table.ui-pg-table').css('float','left');
  $('#yosoku_pager_left').css('width','50%');
  $('#yosoku_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  yosokuList.getUriageTotal(sd,ed);
};

// 検索集計結果を表示するグリッドの生成処理（顧客別）
yosokuList.createGrid_client = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/nyukin_yosoku_summary?op=client&start_date=" + sd + "&end_date=" + ed;
	jQuery("#yosoku_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['CD','顧客名','売上(税抜)','消費税','売上計'],
		colModel: [
      { name: 'client_cd', index: 'client_cd', hidden:true, sortable:true},
      { name: 'client', index: 'cilent', width: 300, align: "center" ,sortable:true},
			{ name: 'yosoku_sum', index: 'yosoku_sum', width: 200, align: "right",formatter:yosokuList.numFormatterC },
			{ name: 'yosoku_tax', index: 'yosoku_tax', width: 200, align: "right",formatter:yosokuList.numFormatterC },
			{ name: 'yosoku_total', index: 'yosoku_total', width: 200, align: "right",formatter:yosokuList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#yosoku_pager',
    pagerpos: 'left',
    recordpos: 'center',
		sortname: 'entry_info.client_cd',
		viewrecords: true,
		sortorder: "asc",
		caption: "入金予測集計(顧客別)",
		onSelectRow:yosokuList.onSelectUriageSummary,
    loadComplete:yosokuList.loadCompleteUgiageSummary
	});
	jQuery("#yosoku_list").jqGrid('navGrid', '#yosoku_pager', { edit: false, add: false, del: false ,search:false});
  $('#yosoku_pager_left table.ui-pg-table').css('float','left');
  $('#yosoku_pager_left').css('width','50%');
  $('#yosoku_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  yosokuList.getUriageTotal(sd,ed);
};

yosokuList.onSelectUriageSummary = function(rowid) {
  $("#yosoku_list_detail").GridUnload();
  // グリッドの生成（検索集計、結果表示）
  if ($("#search_option_all").prop('checked')) {
    // 全社
    yosokuList.createGrid_list("all","");
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    var row = $("#yosoku_list").getRowData(rowid);
    yosokuList.createGrid_list("division",row.division_cd);
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    var row = $("#yosoku_list").getRowData(rowid);
    yosokuList.createGrid_list("client",row.client_cd);
  }

};
yosokuList.loadCompleteUgiageSummary = function(event) {
  var rowNum = Number($("#yosoku_list").getGridParam('rowNum'));
  $("#yosoku_list").setGridHeight(rowNum * 32);
};
yosokuList.onSelectNyukinList = function(rowid) {
  var row = $("#yosoku_list").getRowData(rowid);
  yosokuList.openEntryDialog(row);
};
yosokuList.onSelectNyukinListDetail = function(rowid) {
  var row = $("#yosoku_list_detail").getRowData(rowid);
  yosokuList.openEntryDialog(row);
};
yosokuList.loadCompleteUgiageList = function(event) {
  var rowNum = Number($("#yosoku_list_detail").getGridParam('rowNum'));
  $("#yosoku_list_detail").setGridHeight(rowNum * 32);

};
yosokuList.numFormatterC = function(num) {
	return scheduleCommon.numFormatter( Math.round(num), 11);
};
// 案件参照用ダイアログの生成
yosokuList.createEntryDialog = function () {
	$('#entry_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 900,
		title: '案件情報',
		closeOnEscape: false,
		modal: false,
		buttons: {
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 案件情報の参照ダイアログ
yosokuList.openEntryDialog = function (event) {
	var entry = event;
	yosokuList.requestEntryData(entry.entry_no);
//	$("#entry_dialog").dialog("open");
};
// 案件データの読込み
yosokuList.requestEntryData = function (no) {
	$.get('/entry_get/' + no,function(response) {
		var entry = response;
		// formに取得したデータを埋め込む
		yosokuList.setEntryForm(entry);
		//$("#entryForm #entry_memo_ref").text(entry.entry_memo);
		// 見積情報の取得
		yosokuList.requestQuoteInfo(entry.entry_no, entry.test_large_class_cd, entry.consumption_tax);
	});
};
// 請求金額、入金額取得リクエスト
yosokuList.requestBillingTotal = function (no) {
	$.get('/billing_get_total/' + no,function(response) {
		var billing = response;
		if (billing.amount_total != null) {
			$("#entryForm #entry_amount_billing").val(scheduleCommon.numFormatter(billing.amount_total,11));
		}
		if (billing.complete_total != null) {
			$("#entryForm #entry_amount_deposit").val(scheduleCommon.numFormatter(billing.complete_total,11));
		}
		$("#entry_dialog").dialog("open");
	});
};

// 受注確定になっている見積情報を取得する
yosokuList.requestQuoteInfo = function(entry_no, large_item_cd, consumption_tax) {
	$.get('/quote_specific_get_list_for_entryform/' + entry_no + '?large_item_cd=' + large_item_cd, function (quote_list) {
			yosokuList.setQuoteInfo(quote_list, consumption_tax);
			// 請求情報から請求金額、入金金額合計を取得して表示
			yosokuList.requestBillingTotal(entry_no);
	});
};
yosokuList.setQuoteInfo = function (quote_list, consumption_tax) {
	if (quote_list != null) {
		var total_price = 0;
		var rows = quote_list.rows;
		if (rows.length > 0) {
			$("#entryForm #quote_no").val(rows[0].quote_no);
			var list = "";
			for (var i = 0;i <  rows.length;i++) {
				list += rows[i].test_middle_class_name + "\n";
				total_price += Number(rows[i].price);
			}
			$("#entryForm #test_middle_class_list").text(list);
			tax = total_price * (consumption_tax / 100);
			$("#entryForm #entry_amount_price").val(scheduleCommon.numFormatter(total_price + tax,11));
      $("#entryForm #entry_amount_price_notax").val(scheduleCommon.numFormatter(total_price,11));	// 金額(税抜)
			$("#entryForm #entry_amount_tax").val(scheduleCommon.numFormatter(tax,11));					// 消費税
			$("#entryForm #entry_consumption_tax").val(rows[0].consumption_tax);							// 消費税率
		}
	}
};
// 案件データをフォームにセットする
yosokuList.setEntryForm = function (entry) {
	$("#entryForm #entry_no").val(entry.entry_no);					// 案件No
	$("#entryForm #quote_no").val(entry.quote_no);					// 見積番号
	$("#entryForm #inquiry_date").val(entry.inquiry_date);			// 問合せ日
	$("#entryForm #entry_status").val(entry.entry_status);			// 案件ステータス
	$("#entryForm #sales_person_id").val(entry.sales_person_id);	// 案件ステータス
//	$("#quote_issue_date").val(entry.quote_issue_date); // 見積書発行日
	$("#entryForm #agent_cd").val(entry.agent_cd);					// 代理店コード
	$("#entryForm #agent_name").val(entry.agent_name_1);				// 代理店名
	$("#entryForm #agent_division_cd").val(entry.agent_division_cd);		// 所属部署CD
	$("#entryForm #agent_division_name").val(entry.agent_division_name);	// 所属部署名
	$("#entryForm #agent_division_memo").val(entry.agent_division_memo);	// 所属部署メモ
	$("#entryForm #agent_person_id").val(entry.agent_person_id);			// 担当者ID
	$("#entryForm #agent_person_name").val(entry.agent_person_name);		// 担当者名
	$("#entryForm #agent_person_memo").val(entry.agent_person_memo);		// 担当者メモ

	$("#entryForm #client_cd").val(entry.client_cd);				// 得意先コード
	var name_1 = entry.client_name_1;
	var name_2 = entry.client_name_2;
	$("#entryForm #client_name").val(name_1 );								// 得意先名1
	$("#entryForm #client_division_cd").val(entry.client_division_cd);		// 所属部署CD
	$("#entryForm #client_division_name").val(entry.client_division_name);	// 所属部署名
	$("#entryForm #client_division_memo").val(entry.client_division_memo);	// 所属部署メモ
	$("#entryForm #client_person_id").val(entry.client_person_id);			// 担当者ID
	$("#entryForm #client_person_name").val(entry.client_person_name);		// 担当者名
	$("#entryForm #client_person_memo").val(entry.client_person_memo);		// 担当者メモ

	$("#entryForm #test_large_class_cd").val(entry.test_large_class_cd);		// 試験大分類CD
	$("#entryForm #test_large_class_name").val(entry.test_large_class_name);	// 試験大分類名
	$("#entryForm #test_middle_class_cd").val(entry.test_middle_class_cd);		// 試験中分類CD
	$("#entryForm #test_middle_class_name").val(entry.test_middle_class_name);	// 試験中分類名
	$("#entryForm #entry_title").val(entry.entry_title);						// 案件名

	$("#entryForm #order_accepted_date").val(entry.order_accepted_date);	// 受注日付
	$("#entryForm #order_accept_check").val(entry.order_accept_check);		// 仮受注日チェック
	$("#entryForm #acounting_period_no").val(entry.acounting_period_no);	// 会計期No
	$("#entryForm #order_type").val(entry.order_type);						// 受託区分
	$("#entryForm #contract_type").val(entry.contract_type);				// 契約区分
	$("#entryForm #outsourcing_cd").val(entry.outsourcing_cd);				// 委託先CD
	$("#entryForm #outsourcing_name").val(entry.outsourcing_name);			// 委託先CD
	$("#entryForm #entry_amount_price_notax").val(entry.entry_amount_price_notax);		// 案件合計金額（税抜）
	$("#entryForm #entry_amount_tax").val(entry.entry_amount_tax);			// 消費税額
	$("#entryForm #entry_amount_price").val(entry.entry_amount_price);		// 案件合計金額（税込）
	$("#entryForm #entry_amount_billing").val(entry.entry_amount_billing);	// 案件請求合計金額
	$("#entryForm #entry_amount_deposit").val(entry.entry_amount_deposit); // 案件入金合計金額
	$("#entryForm #test_person_id").val(entry.test_person_id);				// 試験担当者ID

	$("#entryForm #report_limit_date").val(entry.report_limit_date);		// 報告書提出期限
	$("#entryForm #report_submit_date").val(entry.report_submit_date);		// 報告書提出日
	$("#entryForm #prompt_report_limit_date_1").val(entry.prompt_report_limit_date_1);		// 速報提出期限1
	$("#entryForm #prompt_report_submit_date_1").val(entry.prompt_report_submit_date_1);	// 速報提出日1
	$("#entryForm #prompt_report_limit_date_2").val(entry.prompt_report_limit_date_2);		// 速報提出期限2
	$("#entryForm #prompt_report_submit_date_2").val(entry.prompt_report_submit_date_2);	// 速報提出日2
	$("#entryForm #entry_consumption_tax").val(entry.consumption_tax);		// 消費税率
	$("#entryForm #entry_memo").val(entry.entry_memo);						// 備考
	if (entry.delete_check == 1) {
		$("#entryForm #delete_check").prop("checked", true);				// 削除フラグ
	} else {
		$("#entryForm #delete_check").prop("checked", false);				// 削除フラグ
	}
	$("#entryForm #delete_reason").val(entry.delete_reason);				// 削除理由
	$("#entryForm #input_check_date").val(entry.input_check_date);			// 入力日
	if (entry.input_check == 1) {
		$("#entryForm #input_check").prop("checked",true);					// 入力完了チェック
	} else {
		$("#entryForm #input_check").prop("checked", false);				// 入力完了チェック
	}
	$("#entryForm #input_operator_id").val(entry.input_operator_id);		// 入力者ID
	$("#entryForm #confirm_check_date").val(entry.confirm_check_date);		// 確認日
	if (entry.confirm_check == 1) {
		$("#entryForm #confirm_check").prop("checked",true);				// 確認完了チェック
	} else {
		$("#entryForm #confirm_check").prop("checked", false);				// 確認完了チェック
	}
	$("#entryForm #confirm_operator_id").val(entry.confirm_operator_id);	// 確認者ID
	$("#entryForm #created").val(entry.created);							// 作成日
	$("#entryForm #created_id").val(entry.created_id);						// 作成者ID
	$("#entryForm #updated").val(entry.updated);							// 更新日
	$("#entryForm #updated_id").val(entry.updated_id);						// 更新者ID
};

yosokuList.getSortParams = function() {
  var sn = $("#yosoku_list").getGridParam("sortname");
  if (sn == undefined) sn = "entry_no";
  var sd = $("#yosoku_list").getGridParam("sortorder");
  if (sd == undefined) sd = "asc";
	if (sn == 'division_cd') {
		sn = 'entry_info.test_large_class_cd'
	}
  return "&sidx=" + sn + "&sord=" + sd;
}
yosokuList.nyukinListPrintSub = function(sd, ed, cw,target) {
  var req_url = "/nyukin_yosoku_summary_print?op=all&start_date=" + sd + "&end_date=" + ed;
  req_url += yosokuList.getSortParams();
  $.get(req_url,function(response) {
      var tbl = cw.document.getElementById(target);
      var total = 0;
      for(var i = 0;i < response.records;i++) {
        var row = response.rows[i].cell;
        var tr = $("<tr>" +
        "<td class='data_value border_up_left'>" + (row.entry_no != null ? row.entry_no : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.test_large_class_name != null ? row.test_large_class_name : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.test_middle_class_name != null ? row.test_middle_class_name : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.client_name != null ? row.client_name : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.agent_name != null ? row.agent_name : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.entry_title != null ? row.entry_title :"") + "</td>" +
        "<td class='data_value_num border_up_left'>" + (row.yosoku_sum != null ? scheduleCommon.numFormatter(row.yosoku_sum,11) : "") + "</td>" +
        "<td class='data_value_num border_up_left'>" + (row.yosoku_tax != null ? scheduleCommon.numFormatter(row.yosoku_tax,11) : "") + "</td>" +
        "<td class='data_value_num border_up_left'>" + (row.yosoku_total != null ? scheduleCommon.numFormatter(row.yosoku_total,11) : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.seikyu_date != null ? row.seikyu_date : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.nyukin_date != null ? row.nyukin_date : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.nyukin_yotei_date != null ? row.nyukin_yotei_date : "") + "</td>" +
        "<td class='data_value border_up_left_right'>" + (row.sales_person_name != null ? row.sales_person_name : "") + "</td>" +
        "</tr>");
        total += Number(row.yosoku_total);
        $(tbl).append(tr);
      }
      var total_label = cw.document.getElementById("total");
      $(total_label).text(scheduleCommon.numFormatter(total,11) + "円");

  });

}

// リスト印刷
yosokuList.nyukinListPrint = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  if ($("#search_option_all").prop('checked')) {
    // 全社
    // 売上集計
    var cw = window.open('/pay_planning_print_all','_blank','');
    $(cw).load(function(){
      yosokuList.nyukinListPrintSub(sd, ed, cw,"nyukin_list_table");
    });
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    var req_url = "/nyukin_yosoku_summary_print?op=division&start_date=" + sd + "&end_date=" + ed;
    req_url += yosokuList.getSortParams();
    $.get(req_url,function(response) {
      var cw = window.open('/pay_planning_print_division','_blank','');
      $(cw).load(function(){
        var tbl = cw.document.getElementById("nyukin_list_table");
        for(var i = 0;i < response.records;i++) {
          var row = response.rows[i].cell;
          var tr = $("<tr>" +
          "<td class='data_value border_up_left'>" + (row.division != null ? row.division : "") + "</td>" +
          "<td class='data_value_num border_up_left'>" + (row.yosoku_sum != null ? scheduleCommon.numFormatter(row.yosoku_sum,11) : "") + "</td>" +
          "<td class='data_value_num border_up_left'>" + (row.yosoku_tax != null ? scheduleCommon.numFormatter(row.yosoku_tax,11) : "") + "</td>" +
          "<td class='data_value_num border_up_left_right'>" + (row.yosoku_total != null ? scheduleCommon.numFormatter(row.yosoku_total,11) : "") + "</td>" +
          "</tr>"
          );
          $(tbl).append(tr);
        }
        yosokuList.nyukinListPrintSub(sd, ed, cw,"nyukin_list_detail_table");

      })
  	});
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    var req_url = "/nyukin_yosoku_summary_print?op=client&start_date=" + sd + "&end_date=" + ed;
    req_url += yosokuList.getSortParams();
    $.get(req_url,function(response) {
      var cw = window.open('/pay_planning_print_client','_blank','');
      $(cw).load(function(){
        var tbl = cw.document.getElementById("nyukin_list_table");
        for(var i = 0;i < response.records;i++) {
          var row = response.rows[i].cell;
          var tr = $("<tr>" +
          "<td class='data_value border_up_left'>" + (row.client != null ? row.client : "") + "</td>" +
          "<td class='data_value_num border_up_left'>" + (row.yosoku_sum != null ? scheduleCommon.numFormatter(row.yosoku_sum,11) : "") + "</td>" +
          "<td class='data_value_num border_up_left'>" + (row.yosoku_tax != null ? scheduleCommon.numFormatter(row.yosoku_tax,11) : "") + "</td>" +
          "<td class='data_value_num border_up_left_right'>" + (row.yosoku_total != null ? scheduleCommon.numFormatter(row.yosoku_total,11) : "") + "</td>" +
          "</tr>"
          );
          $(tbl).append(tr);
        }
        yosokuList.nyukinListPrintSub(sd, ed, cw,"nyukin_list_detail_table");

      })
  	});
  }
}
