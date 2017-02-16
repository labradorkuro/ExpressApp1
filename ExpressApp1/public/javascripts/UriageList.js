//
// 売上集計画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  uriageList.init();
  // 権限チェック
  uriageList.checkAuth();
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
  // 検索ボタンのクリックイベント登録
  $("#search_button").bind('click',uriageList.onSearchButton);
  // リスト印刷ボタン
	$("#uriage_list_print").bind('click' , {}, uriageList.uriageListPrint);
  // リストCSVボタン
	$("#uriage_list_csv").bind('click' , {}, uriageList.uriageListCsv);
});

// 処理用オブジェクト
var uriageList = uriageList || {}

// 初期化処理
uriageList.init = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#start_date").val(today);
  $("#end_date").val(today);
  uriageList.createEntryDialog();
}
// 検索ボタンクリック処理
uriageList.onSearchButton = function(ui,event) {
  // グリッドのクリア
  $("#uriage_list").GridUnload();
  $("#uriage_list_detail").GridUnload();
  // グリッドの生成（検索集計、結果表示）
  if ($("#search_option_all").prop('checked')) {
    // 全社
    uriageList.createGrid_all();
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    uriageList.createGrid_division();
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    uriageList.createGrid_client();
  }
}
// 権限チェック
uriageList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};
// 検索集計結果を表示するグリッドの生成処理（全社）
uriageList.createGrid_all = function() {
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?op=all&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
	jQuery("#uriage_list").jqGrid({
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
      { name: 'uriage_sum', index: 'uriage_sum', width: 100, align: "right",formatter:uriageList.numFormatterC },
      { name: 'uriage_tax', index: 'uriage_tax', width: 100, align: "right",formatter:uriageList.numFormatterC },
      { name: 'uriage_total', index: 'uriage_total', width: 100, align: "right",formatter:uriageList.numFormatterC },
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
		pager: '#uriage_pager',
    pagerpos:'left',
    recordpos:'center',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "売上集計(全社)",
    loadComplete:uriageList.loadCompleteUgiageSummary
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false ,search:false});
  $('#uriage_pager_left table.ui-pg-table').css('float','left');
  $('#uriage_pager_left').css('width','30%');
  $('#uriage_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  uriageList.getUriageTotal(sd,ed,keyword);
};

// 売上集計総合計の取得
uriageList.getUriageTotal = function(start_date, end_date,keyword) {
    $.get('/uriage_total?start_date=' + start_date + '&end_date=' + end_date + '&keyword=' + keyword,function(response) {
        if (response.uriage_total) {
          $("#uriage_total").text('合計：' + uriageList.numFormatterC(response.uriage_total) + '円');
        } else {
          $("#uriage_total").text("");
        }
    });
}
// 案件リストの表示用グリッド生成
uriageList.createGrid_list = function(list_kind,division_cd) {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_detail?op=" + list_kind + "&start_date=" + sd + "&end_date=" + ed;
  if (division_cd != "") {
    req_url += "&division_cd=" + division_cd;
  }
	jQuery("#uriage_list_detail").jqGrid({
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
      { name: 'uriage_sum', index: 'uriage_sum', width: 100, align: "right",formatter:uriageList.numFormatterC },
      { name: 'uriage_tax', index: 'uriage_tax', width: 100, align: "right",formatter:uriageList.numFormatterC },
      { name: 'uriage_total', index: 'uriage_total', width: 100, align: "right",formatter:uriageList.numFormatterC },
      { name: 'seikyu_date', index: 'seikyu_date', width: 120, align: "center" },
      { name: 'nyukin_date', index: 'nyukin_date', width: 120, align: "center" },
      { name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 120, align: "center" },
      { name: 'sales_person_name', index: 'sales_person_name', width: 160, align: "center" },
		],
		height:240,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
	  pager: '#uriage_detail_pager',
    pagerpos: 'left',
    recordpos:'center',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "案件リスト",
		onSelectRow:uriageList.onSelectUriageList,
    loadComplete:uriageList.loadCompleteUgiageList
	});
	jQuery("#uriage_list_detail").jqGrid('navGrid', '#uriage_detail_pager', { edit: false, add: false, del: false ,search:false});
  $('#uriage_detail_pager_left table.ui-pg-table').css('float','left');
  $('#uriage_detail_pager_left').css('width','30%');
  $('#uriage_detail_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
};

// 検索集計結果を表示するグリッドの生成処理（試験課別）
uriageList.createGrid_division = function() {
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?op=division&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
	jQuery("#uriage_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['CD','試験課','売上金額'],
		colModel: [
      { name: 'division_cd', index: 'division_cd', hidden:true, sortable:true},
      { name: 'division', index: 'division', width: 300, align: "center" ,sortable:true},
			{ name: 'uriage_sum', index: 'uriage_sum', width: 200, align: "right",formatter:uriageList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#uriage_pager',
    pagerpos: 'left',
    recordpos: 'center',
		sortname: 'division_cd',
		viewrecords: true,
		sortorder: "asc",
		caption: "売上集計(試験課別)",
		onSelectRow:uriageList.onSelectUriageSummary,
    loadComplete:uriageList.loadCompleteUgiageSummary
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false ,search:false});
  $('#uriage_pager_left table.ui-pg-table').css('float','left');
  $('#uriage_pager_left').css('width','50%');
  $('#uriage_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  uriageList.getUriageTotal(sd,ed,keyword);
};

// 検索集計結果を表示するグリッドの生成処理（顧客別）
uriageList.createGrid_client = function() {
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?op=client&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
	jQuery("#uriage_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['CD','顧客名','売上金額'],
		colModel: [
      { name: 'client_cd', index: 'client_cd', hidden:true, sortable:true},
      { name: 'client', index: 'cilent', width: 300, align: "center" ,sortable:true},
			{ name: 'uriage_sum', index: 'uriage_sum', width: 200, align: "right",formatter:uriageList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#uriage_pager',
    pagerpos: 'left',
    recordpos: 'center',
		sortname: 'entry_info.client_cd',
		viewrecords: true,
		sortorder: "asc",
		caption: "売上集計(顧客別)",
		onSelectRow:uriageList.onSelectUriageSummary,
    loadComplete:uriageList.loadCompleteUgiageSummary
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false ,search:false});
  $('#uriage_pager_left table.ui-pg-table').css('float','left');
  $('#uriage_pager_left').css('width','50%');
  $('#uriage_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  uriageList.getUriageTotal(sd,ed,keyword);
};

uriageList.onSelectUriageSummary = function(rowid) {
  $("#uriage_list_detail").GridUnload();
  // グリッドの生成（検索集計、結果表示）
  if ($("#search_option_all").prop('checked')) {
    // 全社
    uriageList.createGrid_list("all","");
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    var row = $("#uriage_list").getRowData(rowid);
    uriageList.createGrid_list("division",row.division_cd);
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    var row = $("#uriage_list").getRowData(rowid);
    uriageList.createGrid_list("client",row.client_cd);
  }

};
uriageList.loadCompleteUgiageSummary = function(event) {

};
uriageList.onSelectUriageList = function(rowid) {
  var row = $("#uriage_list_detail").getRowData(rowid);
  uriageList.openEntryDialog(row);
};
uriageList.loadCompleteUgiageList = function(event) {

};
uriageList.numFormatterC = function(num) {
	return scheduleCommon.numFormatter( Math.round(num), 10);
};
// 案件参照用ダイアログの生成
uriageList.createEntryDialog = function () {
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
uriageList.openEntryDialog = function (event) {
	var entry = event;
	uriageList.requestEntryData(entry.entry_no);
//	$("#entry_dialog").dialog("open");
};
// 案件データの読込み
uriageList.requestEntryData = function (no) {
	$.get('/entry_get/' + no,function(response) {
		var entry = response;
		// formに取得したデータを埋め込む
		uriageList.setEntryForm(entry);
		//$("#entryForm #entry_memo_ref").text(entry.entry_memo);
		// 見積情報の取得
		uriageList.requestQuoteInfo(entry.entry_no, entry.test_large_class_cd, entry.consumption_tax);
	});
};
// 請求金額、入金額取得リクエスト
uriageList.requestBillingTotal = function (no) {
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
uriageList.requestQuoteInfo = function(entry_no, large_item_cd, consumption_tax) {
	$.get('/quote_specific_get_list_for_entryform/' + entry_no + '?large_item_cd=' + large_item_cd, function (quote_list) {
			uriageList.setQuoteInfo(quote_list, consumption_tax);
			// 請求情報から請求金額、入金金額合計を取得して表示
			uriageList.requestBillingTotal(entry_no);
	});
};
uriageList.setQuoteInfo = function (quote_list, consumption_tax) {
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
		}
	}
};
// 案件データをフォームにセットする
uriageList.setEntryForm = function (entry) {
	$("#entryForm #entry_no").val(entry.entry_no);					// 案件No
	$("#entryForm #quote_no").val(entry.quote_no);					// 見積番号
	$("#entryForm #inquiry_date").val(entry.inquiry_date);			// 問合せ日
	$("#entryForm #entry_status").val(entry.entry_status);			// 案件ステータス
	$("#entryForm #sales_person_id").val(entry.sales_person_id);	// 案件ステータス
//	$("#quote_issue_date").val(entry.quote_issue_date); // 見積書発行日
	$("#entryForm #agent_cd").val(entry.agent_cd);					// 代理店コード
	$("#entryForm #agent_name").val(entry.agent_name);				// 代理店名
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

uriageList.uriageListPrintSub = function(sd, ed, keyword, cw,target) {
  var req_url = "/uriage_summary_print?op=all&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
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
        "<td class='data_value_num border_up_left'>" + (row.uriage_sum != null ? scheduleCommon.numFormatter(row.uriage_sum,11) : "") + "</td>" +
        "<td class='data_value_num border_up_left'>" + (row.uriage_tax != null ? scheduleCommon.numFormatter(row.uriage_tax,11) : "") + "</td>" +
        "<td class='data_value_num border_up_left'>" + (row.uriage_total != null ? scheduleCommon.numFormatter(row.uriage_total,11) : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.seikyu_date != null ? row.seikyu_date : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.nyukin_date != null ? row.nyukin_date : "") + "</td>" +
        "<td class='data_value border_up_left'>" + (row.nyukin_yotei_date != null ? row.nyukin_yotei_date : "") + "</td>" +
        "<td class='data_value border_up_left_right'>" + (row.sales_person_name != null ? row.sales_person_name : "") + "</td>" +
        "</tr>");
        total += Number(row.uriage_total);
        $(tbl).append(tr);
      }
      var total_label = cw.document.getElementById("total");
      $(total_label).text(scheduleCommon.numFormatter(total,11) + "円");

  });

}
// リスト印刷
uriageList.uriageListPrint = function() {
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  if ($("#search_option_all").prop('checked')) {
    // 全社
    // 売上集計
    var cw = window.open('/uriage_list_print_all','_blank','');
    $(cw).load(function(){
      uriageList.uriageListPrintSub(sd, ed, keyword, cw,"uriage_list_table");
    });
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    var req_url = "/uriage_summary_print?op=division&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
    $.get(req_url,function(response) {
      var cw = window.open('/uriage_list_print_division','_blank','');
      $(cw).load(function(){
        var tbl = cw.document.getElementById("uriage_list_table");
        for(var i = 0;i < response.records;i++) {
          var row = response.rows[i].cell;
          var tr = $("<tr>" +
          "<td class='data_value border_up_left'>" + (row.division != null ? row.division : "") + "</td>" +
          "<td class='data_value_num border_up_left_right'>" + (row.uriage_sum != null ? scheduleCommon.numFormatter(row.uriage_sum,11) : "") + "</td>" +
          "</tr>"
          );
          $(tbl).append(tr);
        }
        uriageList.uriageListPrintSub(sd, ed, keyword, cw,"uriage_list_detail_table");

      })
  	});
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    var req_url = "/uriage_summary_print?op=client&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
    $.get(req_url,function(response) {
      var cw = window.open('/uriage_list_print_client','_blank','');
      $(cw).load(function(){
        var tbl = cw.document.getElementById("uriage_list_table");
        for(var i = 0;i < response.records;i++) {
          var row = response.rows[i].cell;
          var tr = $("<tr>" +
          "<td class='data_value border_up_left'>" + (row.client != null ? row.client : "") + "</td>" +
          "<td class='data_value_num border_up_left_right'>" + (row.uriage_sum != null ? scheduleCommon.numFormatter(row.uriage_sum,11) : "") + "</td>" +
          "</tr>"
          );
          $(tbl).append(tr);
        }
        uriageList.uriageListPrintSub(sd, ed, keyword, cw,"uriage_list_detail_table");

      })
  	});
  }
}

// CSVファイル
uriageList.uriageListCsv = function() {
  var today = scheduleCommon.getToday("{0}_{1}_{2}");
  var filename = "売上集計_" + today;
  var detail_text = "";
  var summary_text = "";
  var empty_line = "\r\n\r\n";
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = null;
  // グリッドの生成（検索集計、結果表示）
  if ($("#search_option_all").prop('checked')) {
    // 全社
    uriageList.getDetailList("");
  } else if ($("#search_option_division").prop('checked')) {
    // 試験課別
    uriageList.getDivisionSummaryList();
  } else if ($("#search_option_client").prop('checked')) {
    // 顧客別
    uriageList.getClientSummaryList();
  }
}

// 試験課別
uriageList.getDivisionSummaryList = function() {
  var colnames = "試験課,売上金額";
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  var lines = [];
  lines.push(colnames);
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = null;
  // 売上集計
  var req_url = "/uriage_summary_print?op=division&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
  $.get(req_url,function(response) {
      for(var i = 0;i < response.records;i++) {
        var row = response.rows[i].cell;
        var text = scheduleCommon.setQuotation(row.division != null ? row.division : "") + "," +
          scheduleCommon.setQuotation(row.uriage_sum != null ? row.uriage_sum : "");
        lines.push(text);
      }
      var detail_text = lines.join("\r\n");
      uriageList.getDetailList(detail_text);
    });
  return "";
}

// 顧客別
uriageList.getClientSummaryList = function() {
  var colnames = "顧客名,売上金額";
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  var lines = [];
  lines.push(colnames);
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = null;
  // 売上集計
  var req_url = "/uriage_summary_print?op=client&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
  $.get(req_url,function(response) {
      for(var i = 0;i < response.records;i++) {
        var row = response.rows[i].cell;
        var text = scheduleCommon.setQuotation(row.client != null ? row.client : "") + "," +
          scheduleCommon.setQuotation(row.uriage_sum != null ? row.uriage_sum : "");
        lines.push(text);
      }
      var detail_text = lines.join("\r\n");
      uriageList.getDetailList(detail_text);
    });
  return "";
}

// 詳細リスト
uriageList.getDetailList = function(summary_text) {
  var keyword = $("#uriage_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  var today = scheduleCommon.getToday("{0}_{1}_{2}");
  var filename = "売上集計_" + today;
  var empty_line = "\r\n\r\n";
  var lines = [];
  var colnames = "案件No.,試験大分類,試験中分類,クライアント名,代理店,試験タイトル,売上税抜,消費税,売上計,請求日,入金日,入金予定日,営業担当者";
  lines.push(colnames);
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = null;
  // 売上集計
  var req_url = "/uriage_summary_print?op=all&start_date=" + sd + "&end_date=" + ed + "&keyword=" + keyword;
  $.get(req_url,function(response) {
      var total = 0;
      for(var i = 0;i < response.records;i++) {
        var row = response.rows[i].cell;
        var text = scheduleCommon.setQuotation(row.entry_no != null ? row.entry_no : "") + "," +
          scheduleCommon.setQuotation(row.test_large_class_name != null ? row.test_large_class_name : "") + "," +
          scheduleCommon.setQuotation(row.test_middle_class_name != null ? row.test_middle_class_name : "") + "," +
          scheduleCommon.setQuotation(row.client_name != null ? row.client_name : "") + "," +
          scheduleCommon.setQuotation(row.agent_name != null ? row.agent_name : "") + "," +
          scheduleCommon.setQuotation(row.entry_title != null ? row.entry_title :"") + "," +
          scheduleCommon.setQuotation(row.uriage_sum != null ? row.uriage_sum : "") + "," +
          scheduleCommon.setQuotation(row.uriage_tax != null ? row.uriage_tax : "") + "," +
          scheduleCommon.setQuotation(row.uriage_total != null ? row.uriage_total : "") + "," +
          scheduleCommon.setQuotation(row.seikyu_date != null ? row.seikyu_date : "") + "," +
          scheduleCommon.setQuotation(row.nyukin_date != null ? row.nyukin_date : "") + "," +
          scheduleCommon.setQuotation(row.nyukin_yotei_date != null ? row.nyukin_yotei_date : "") + "," +
          scheduleCommon.setQuotation(row.sales_person_name != null ? row.sales_person_name : "");
        lines.push(text);
        total += Number(row.uriage_total);
      }
      lines.push("\r\n");
      lines.push(",,,,,,,合計," + scheduleCommon.setQuotation(total));
      var detail_text = lines.join("\r\n");
      if (summary_text == "") {
        // 全社リストの場合
        blob = new Blob([bom,detail_text], {type: "text/csv;charset=utf-8"});
      } else {
        // 試験課別、顧客別の場合
        blob = new Blob([bom, summary_text, empty_line, detail_text], {type: "text/csv;charset=utf-8"});
      }
      saveAs(blob,filename + ".csv");

    });
  return "";
}
