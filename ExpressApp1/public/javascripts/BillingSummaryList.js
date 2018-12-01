//
// 請求情報集計画面の動作
//
$(function ()　{
    'use strict';
  // 初期化
  billingSummaryList.init();
  // 権限チェック
  billingSummaryList.checkAuth();
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo("");
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
  // 検索ボタンのクリックイベント登録
  $("#search_button").bind('click',billingSummaryList.onSearchButton);
  // リスト印刷ボタン
	$("#uriage_list_print").bind('click' , {}, billingSummaryList.billingSummaryListPrint);
  // リストCSVボタン
	$("#uriage_list_csv").bind('click' , {}, billingSummaryList.billingSummaryListCsv);
  // 試験大分類リストの取得とセット
  billingSummaryList.getLargeItemList();
  // 請求情報ボタンイベント（登録・編集用画面の表示）
	billingSummaryList.createBillingListDialog();		// 請求情報リスト用
  $("#entry_billing").bind('click' , {},billingSummaryList.openBillingListDialog);
  // 案件情報ボタン
  $("#entry_info").bind('click' , {},billingSummaryList.onOpenEntryInfoDialog);
	// 請求先編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_billing").bind('click' , {}, billingSummaryList.openBillingFormDialog);
	billingSummaryList.createBillingFormDialog();		// 請求情報編集選択用
});

// 処理用オブジェクト
var billingSummaryList = billingSummaryList || {}

// 検索オプション用
billingSummaryList.large_item_list = null;
// 請求情報の表示用
billingSummaryList.currentBilling = null;

// 初期化処理
billingSummaryList.init = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#start_date").val(today);
  $("#end_date").val(today);
  billingSummaryList.createEntryDialog();
}
// 検索ボタンクリック処理
billingSummaryList.onSearchButton = function(ui,event) {
  // グリッドのクリア
  $("#billing_summary_list").GridUnload();
  // グリッドの生成（検索集計、結果表示）
    billingSummaryList.createGrid();
}
// 権限チェック
billingSummaryList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};

// 試験大分類リストの取得リクエスト
billingSummaryList.getLargeItemList = function() {
	$.ajax("/large_item_list_get" , {
		type: 'GET',
		dataType: 'json',
		contentType : 'application/json',
		success: billingSummaryList.onGetLargeItemList
		});
};
// 試験大分類リストの取得リクエストレスポンス
billingSummaryList.onGetLargeItemList = function(large_item_list) {
  $("#largeItem_check").empty();
  billingSummaryList.large_item_list = large_item_list;
	$.each(large_item_list.rows,function() {
    // 案件リストの絞り込み用にチェックボックスを追加する
		$("#largeItem_check").append($("<label class='search_option_check'><input type='checkbox' class='search_option_check' value="
        + this.item_cd + " id='largeItem_check_" + this.item_cd +"'>" + this.item_name + "</label>"));
        // 追加した要素の変更イベント登録
        $("#largeItem_check_" + this.item_cd).bind('change', billingSummaryList.changeEntryOption);
	});
  //billingSummaryList.largeItem_check_all();
  billingSummaryList.createGrid();						// 案件リスト

};
// 案件リストの絞り込み用チェックボックスを全部選択状態にする
billingSummaryList.largeItem_check_all = function() {
  $.each(billingSummaryList.large_item_list.rows,function() {
		$("#largeItem_check_" + this.item_cd).prop('checked', true);
	});

};
// 案件リストの絞り込み用チェックボックスの選択状態を取得する
billingSummaryList.getLargeItem_check = function() {
  var items=[];
  if (billingSummaryList.large_item_list != null) {
    $.each(billingSummaryList.large_item_list.rows,function() {
      var id = "largeItem_check_" + this.item_cd;
      var ck = ($("#" + id).prop("checked")) ? '1':'0';
      items.push({'item_cd':this.item_cd,'value':ck});
  	});
  }
  return items;
};

// 検索対象の日付を取得する
billingSummaryList.getSearchTargetDate = function() {
  var dt = '0';
	var date01 = ($("#search_option_date_01").prop("checked")) ? '01':'0';
	var date02 = ($("#search_option_date_02").prop("checked")) ? '02':'0';
	var date03 = ($("#search_option_date_03").prop("checked")) ? '03':'0';
	var date04 = ($("#search_option_date_04").prop("checked")) ? '04':'0';
	var date05 = ($("#search_option_date_05").prop("checked")) ? '05':'0';
  if (date01 != '0') {
    dt = date01;
  } else if (date02 != '0') {
    dt = date02;
  } else if (date03 != '0') {
    dt = date03;
  } else if (date04 != '0') {
    dt = date04;
  } else if (date05 != '0') {
    dt = date05;
  }
  return dt;
}

// 試験場選択取得
billingSummaryList.getShikenjoSelect = function() {
  var shikenjo = "";
  if ($("#search_option_shikenjo_all").prop("checked")) {
    shikenjo = "0";
  } else if ($("#search_option_shikenjo_osaka").prop("checked")) {
    shikenjo = "1";
  } else if ($("#search_option_shikenjo_sapporo").prop("checked")) {
    shikenjo = "2";
  } else if ($("#search_option_shikenjo_tokyo").prop("checked")) {
    shikenjo = "3";
  }
  return shikenjo;
}

// 請求ステータス選択の取得
billingSummaryList.getPayResultSelect = function() {
  var pr = 0;
  if ($("#search_option_pay_status_1").prop("checked")) { // 未請求
    pr += 1;
	} 
	if ($("#search_option_pay_status_2").prop("checked")) {  // 請求済
    pr += 2;
	}
	if ($("#search_option_pay_status_3").prop("checked")) {  // 入金済
    pr += 4;
	}
	if ($("#search_option_pay_status_4").prop("checked")) {  // 未入金
    pr += 8;
  }
  return pr;
}

// 検索条件の取得
billingSummaryList.getSearchOption = function () {
  var delchk = ($("#entry_delete_check_disp").prop("checked")) ? 1:0;
  var target_date = billingSummaryList.getSearchTargetDate();
  // 試験大分類の絞り込み用チェックボックスの状態を取得
  var large_items = billingSummaryList.getLargeItem_check();
  var option = '?delete_check=' + delchk + '&target_date=' + target_date
  // 試験大分類の絞り込み
  for(var i = 0;i < large_items.length;i++) {
    var item = large_items[i];
    option += "&" + item.item_cd + "=" + item.value;
  }
  return option;
};


// 検索集計結果を表示するグリッドの生成処理
billingSummaryList.createGrid = function() {
  var keyword = $("#billing_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  var option = billingSummaryList.getSearchOption();
  var shikenjo = billingSummaryList.getShikenjoSelect();
  var pay_result = billingSummaryList.getPayResultSelect();
  // 売上集計リストのグリッド
  var req_url = "/billing_summary_list_get"+ option + "&keyword=" + keyword + "&op=all&start_date=" + sd + "&end_date=" + ed 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result;
	jQuery("#billing_summary_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
        colNames: ['案件No.','請求先','試験大分類','試験タイトル','案件金額','消費税','案件金額(税込)','請求予定日','報告書提出日',
        '請求日','請求番号','請求金額','消費税','請求金額(税込)','入金予定日','入金予定日(仮)','入金日','入金額','振込手数料','回収額','請求ステータス','試験場'],
		colModel: [
      { name: 'entry_no', index: 'entry_no', width: 120, align: "center" },
      { name: 'seikyu_name', index: 'seikyu_name', width: 160, align: "center" },
	    { name: 'test_large_class_name', index: 'test_large_class_name', width: 160, align: "center" },
      { name: 'entry_title', index: 'entry_title', width: 160, align: "center" },
      { name: 'entry_amount_price', index: 'entry_amount_price', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'entry_amount_tax', index: 'entry_amount_tax', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'entry_amount_total', index: 'entry_amount_total', width: 160, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_planning_date', index: 'pay_planning_date', width: 120, align: "center" },
      { name: 'report_submit_date', index: 'report_submit_date', width: 140, align: "center" },
      { name: 'seikyu_date', index: 'seikyu_date', width: 120, align: "center" },
      { name: 'billing_number', index: 'billing_number', width: 120, align: "center" },
      { name: 'pay_amount', index: 'pay_amout', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_amount_tax', index: 'pay_amount_tax', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_amount_total', index: 'pay_amount_total', width: 160, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 120, align: "center" },
      { name: 'nyukin_yotei_date_p', index: 'nyukin_yotei_date_p', width: 160, align: "center" },
      { name: 'pay_complete_date', index: 'pay_complete_date', width: 120, align: "center" },
      { name: 'pay_complete', index: 'pay_complete', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'furikomi_ryo', index: 'furikomi_ryo', width: 140, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_complete_total', index: 'pay_complete_total', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_result', index: 'pay_result', width: 160, align: "center",formatter: scheduleCommon.payResultFormatter },
      { name: 'shikenjo', index: 'shikenjo', width: 160, align: "center" ,formatter: scheduleCommon.shikenjoFormatter ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
		],
		height:320,
		width:screen.width,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#billing_summary_list_pager',
    pagerpos:'left',
    recordpos:'center',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "desc",
		caption: "請求情報集計",
    //onSelectRow:billingSummaryList.onSelectbillingSummaryList,
    loadComplete:billingSummaryList.loadCompleteUgiageSummary
	});
	jQuery("#billing_summary_list").jqGrid('navGrid', '#billing_summary_list_pager', { edit: false, add: false, del: false ,search:false});
  $('#billing_summary_list_pager_left table.ui-pg-table').css('float','left');
  $('#billing_summary_list_pager_left').css('width','30%');
  $('#billing_summary_list_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  billingSummaryList.getTotal(sd,ed,keyword,option,shikenjo,pay_result);
};

// 合計の取得と表示
billingSummaryList.getTotal = function(start_date, end_date,keyword,option,shikenjo,pay_result) {
  $.get('/billing_summary_total' + option + '&start_date=' + start_date + '&end_date=' + end_date + '&keyword=' + keyword 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result
    ,function(response) {
      $("#entry_amount_price_total").text( billingSummaryList.numFormatterC(response.entry_amount_price_sum) );
      $("#entry_amount_tax_total").text( billingSummaryList.numFormatterC(response.entry_amount_tax_sum) );
      $("#entry_amount_total_total").text( billingSummaryList.numFormatterC(response.entry_amount_total_sum) );
      $("#pay_amount_price_total").text( billingSummaryList.numFormatterC(response.pay_amount_sum) );
      $("#pay_amount_tax_total").text( billingSummaryList.numFormatterC(response.pay_amount_tax_sum) );
      $("#pay_amount_total_total").text( billingSummaryList.numFormatterC(response.pay_amount_total_sum) );
      $("#nyukingaku_total").text( billingSummaryList.numFormatterC(response.pay_complete_sum) );
      $("#furikomiryo_total").text( billingSummaryList.numFormatterC(response.furikomiryo_sum) );
      $("#kaishuugaku_total").text( billingSummaryList.numFormatterC(response.kaishuugaku_total) );
    });
}
billingSummaryList.loadCompleteUgiageSummary = function(event) {
    // loadCompleイベント処理（表示行数に合わせてグリッドの高さを変える）
      var rowNum = Number($("#billing_summary_list").getGridParam('rowNum'));
      $("#billing_summary_list").setGridHeight(rowNum * 25);
  };

billingSummaryList.numFormatterC = function(num) {
    return scheduleCommon.numFormatter( Math.round(num), 13);
};
billingSummaryList.onSelectbillingSummaryList = function(rowid) {
  var row = $("#billing_summary_list").getRowData(rowid);
  billingSummaryList.openEntryDialog(row);
};
    
// 案件参照用ダイアログの生成
billingSummaryList.createEntryDialog = function () {
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
billingSummaryList.openEntryDialog = function (event) {
	var entry = event;
	billingSummaryList.requestEntryData(entry.entry_no);
//	$("#entry_dialog").dialog("open");
};
// 案件データの読込み
billingSummaryList.requestEntryData = function (no) {
	$.get('/entry_get/' + no,function(response) {
		var entry = response;
		// formに取得したデータを埋め込む
		billingSummaryList.setEntryForm(entry);
		//$("#entryForm #entry_memo_ref").text(entry.entry_memo);
		// 見積情報の取得
		billingSummaryList.requestQuoteInfo(entry.entry_no, entry.test_large_class_cd, entry.consumption_tax);
	});
};
// 請求金額、入金額取得リクエスト
billingSummaryList.requestBillingTotal = function (no) {
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
// 請求金額、入金額取得リクエスト
billingSummaryList.requestBillingTotalForBillingForm = function (no) {
	$.get('/billing_get_total/' + no,function(response) {
		var billing = response;
    if (billing != null) {
      billingList.calcAmountZan(billingSummaryList.currentBilling.pay_amount_total,billing.nyukin_total);
      $("#billing_form_dialog").dialog("open");
    }
  });
};

// 受注確定になっている見積情報を取得する
billingSummaryList.requestQuoteInfo = function(entry_no, large_item_cd, consumption_tax) {
	$.get('/quote_specific_get_list_for_entryform/' + entry_no + '?large_item_cd=' + large_item_cd, function (quote_list) {
    billingSummaryList.setQuoteInfo(quote_list, consumption_tax);
			// 請求情報から請求金額、入金金額合計を取得して表示
			billingSummaryList.requestBillingTotal(entry_no);
	});
};
billingSummaryList.setQuoteInfo = function (quote_list, consumption_tax) {
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
billingSummaryList.setEntryForm = function (entry) {
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

// リスト印刷
billingSummaryList.billingSummaryListPrint = function() {
  var keyword = $("#billing_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  var option = billingSummaryList.getSearchOption();
  var shikenjo = billingSummaryList.getShikenjoSelect();
  var pay_result = billingSummaryList.getPayResultSelect();
  // 売上集計リストのグリッド
  var req_url = "/billing_summary_list_get"+ option + "&keyword=" + keyword + "&op=all&start_date=" + sd + "&end_date=" + ed 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result;
    var cw = window.open('/billing_summary_list_print','_blank','');
    $(cw).load(function(){
      billingSummaryList.billingSummaryListPrintSub(sd, ed, keyword,shikenjo,pay_result,option, cw,"billing_summary_list_table");
    });
}


billingSummaryList.billingSummaryListPrintSub = function(sd, ed, keyword,shikenjo,pay_result,option, cw,target) {
  var req_url = "/billing_summary_print" + option + "&keyword=" + keyword + "&op=all&start_date=" + sd + "&end_date=" + ed 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result;
  $.get(req_url,function(response) {
      var tbl = cw.document.getElementById(target);
      var total = 0;
      for(var i = 0;i < response.records;i++) {
        var row = response.rows[i].cell;
        var tr = $("<tr>" +
        "<td class='data_value border_up_left'>" + row.entry_no + "</td>" +
        "<td class='data_value border_up_left'>" + row.client_name + "</td>" +
        "<td class='data_value border_up_left'>" + row.test_large_class_name + "</td>" +
        "<td class='data_value border_up_left'>" + row.entry_title + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.entry_amount_price) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.entry_amount_tax) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.entry_amount_total) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.dateStringCheck(row.pay_planning_date) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.dateStringCheck(row.report_limit_date) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.dateStringCheck(row.seikyu_date) + "</td>" +
        "<td class='data_value border_up_left'>" + row.billing_number + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.pay_amount) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.pay_amount_tax) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.pay_amount_total) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.dateStringCheck(row.nyukin_yotei_date) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.dateStringCheck(row.nyukin_yotei_date_p) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.dateStringCheck(row.pay_complete_date) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.pay_complete) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.furikomi_ryo) + "</td>" +
        "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(row.pay_complete_total,11) + "</td>" +
        "<td class='data_value border_up_left'>" + scheduleCommon.pay_resultFormatter(row.pay_result,null,null) + "</td>" +
        "<td class='data_value border_up_left_right'>" + scheduleCommon.shikenjoFormatter(row.shikenjo,null,null) + "</td>" +
        "</tr>");
        $(tbl).append(tr);
      }
      billingSummaryList.getTotalPrint(sd,ed,keyword,option,shikenjo,pay_result,cw);

  });

}

// 合計の取得と表示
billingSummaryList.getTotalPrint = function(start_date, end_date,keyword,option,shikenjo,pay_result,cw) {
  $.get('/billing_summary_total' + option + '&start_date=' + start_date + '&end_date=' + end_date + '&keyword=' + keyword 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result
    ,function(response) {
      var tbl = cw.document.getElementById("billing_total_table_p");
      var tr = $("<tr>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.entry_amount_price_sum) + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.entry_amount_tax_sum) + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.entry_amount_total_sum)  + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.pay_amount_sum)  + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.pay_amount_tax_sum) + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.pay_amount_total_sum) + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.pay_complete_sum) + "</td>" +
      "<td class='data_value_num border_up_left'>" + billingSummaryList.numFormatterC(response.furikomiryo_sum) + "</td>" +
      "<td class='data_value_num border_up_left_right'>" + billingSummaryList.numFormatterC(response.kaishuugaku_total) + "</td>" +
      "</tr>");
      $(tbl).append(tr);
  });
}

// CSVファイル
billingSummaryList.billingSummaryListCsv = function() {
  var lines = [];
  var colnames = "案件No.,請求先,試験大分類,試験タイトル,案件金額,消費税,案件金額（税込）,請求予定日,報告書提出日,請求日,請求番号,"
      + "請求金額,消費税,請求金額（税込）,入金予定日,入金予定日（仮）,入金日,入金額,振込手数料,回収額,請求ステータス,試験場";
  lines.push(colnames);
  var keyword = $("#billing_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  var option = billingSummaryList.getSearchOption();
  var shikenjo = billingSummaryList.getShikenjoSelect();
  var pay_result = billingSummaryList.getPayResultSelect();
  var req_url = "/billing_summary_print"+ option + "&keyword=" + keyword + "&op=all&start_date=" + sd + "&end_date=" + ed 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result;
  $.get(req_url,function(response) {
      var total = 0;
      for(var i = 0;i < response.records;i++) {
        var row = response.rows[i].cell;

          var text = scheduleCommon.setQuotation(row.entry_no != null ? row.entry_no :"") + "," +
          scheduleCommon.setQuotation(row.client_name != null ? row.client_name :"") + "," +
          scheduleCommon.setQuotation(row.test_large_class_name != null ? row.test_large_class_name:"") + "," +
          scheduleCommon.setQuotation(row.entry_title != null ? row.entry_title:"") + "," +
          scheduleCommon.setQuotation(row.entry_amount_price != null ? billingSummaryList.numFormatterC(row.entry_amount_price):"0") + "," +
          scheduleCommon.setQuotation(row.entry_amount_tax != null ? billingSummaryList.numFormatterC(row.entry_amount_tax):"0") + "," +
          scheduleCommon.setQuotation(row.entry_amount_total != null ? billingSummaryList.numFormatterC(row.entry_amount_total):"0") + "," +
          scheduleCommon.setQuotation(row.pay_planning_date != null ? scheduleCommon.dateStringCheck(row.pay_planning_date):"") + "," +
          scheduleCommon.setQuotation(row.report_limit_date != null ? scheduleCommon.dateStringCheck(row.report_limit_date):"") + "," +
          scheduleCommon.setQuotation(row.seikyu_date != null ? scheduleCommon.dateStringCheck(row.seikyu_date):"") + "," +
          scheduleCommon.setQuotation(row.billing_number != null ? row.billing_number:"") + "," +
          scheduleCommon.setQuotation(row.pay_amount != null ? billingSummaryList.numFormatterC(row.pay_amount):"0") + "," +
          scheduleCommon.setQuotation(row.pay_amount_tax != null ? billingSummaryList.numFormatterC(row.pay_amount_tax):"0") + "," +
          scheduleCommon.setQuotation(row.pay_amount_total != null ? billingSummaryList.numFormatterC(row.pay_amount_total):"0") + "," +
          scheduleCommon.setQuotation(row.nyukin_yotei_date != null ? scheduleCommon.dateStringCheck(row.nyukin_yotei_date):"") + "," +
          scheduleCommon.setQuotation(row.nyukin_yotei_date_p != null ? scheduleCommon.dateStringCheck(row.nyukin_yotei_date_p):"") + "," +
          scheduleCommon.setQuotation(row.pay_complete_date != null ? scheduleCommon.dateStringCheck(row.pay_complete_date):"") + "," +
          scheduleCommon.setQuotation(row.pay_complete != null ? billingSummaryList.numFormatterC(row.pay_complete):"0") + "," +
          scheduleCommon.setQuotation(row.furikomi_ryo != null ? billingSummaryList.numFormatterC(row.furikomi_ryo) :"0")+ "," +
          scheduleCommon.setQuotation(row.pay_complete_total != null ? billingSummaryList.numFormatterC(row.pay_complete_total,11):"0") + "," +
          scheduleCommon.setQuotation(row.pay_result != null ? scheduleCommon.pay_resultFormatter(row.pay_result,null,null):"") + "," +
          scheduleCommon.setQuotation(row.shikenjo != null ? scheduleCommon.shikenjoFormatter(row.shikenjo,null,null):"") ;
          lines.push(text);
      }
      billingSummaryList.getTotalCsv(sd, ed,keyword,option,shikenjo,pay_result,lines);
    });
  return "";
}
billingSummaryList.getTotalCsv = function(start_date, end_date,keyword,option,shikenjo,pay_result,lines) {
  var colnames = "合計,案件金額,消費税,案件金額（税込）,請求金額,消費税,請求金額（税込）,入金額,振込手数料,回収額";
  var today = scheduleCommon.getToday("{0}_{1}_{2}");
  var filename = "請求情報集計_" + today;
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = null;
  $.get('/billing_summary_total' + option + '&start_date=' + start_date + '&end_date=' + end_date + '&keyword=' + keyword 
    + "&shikenjo=" + shikenjo + "&pay_result=" + pay_result
    ,function(response) {
      lines.push("\r\n");
      lines.push(colnames);
      var text = "," + scheduleCommon.setQuotation(response.entry_amount_price_sum != null ? billingSummaryList.numFormatterC(response.entry_amount_price_sum):"") + "," +
      scheduleCommon.setQuotation(response.entry_amount_tax_sum != null ? billingSummaryList.numFormatterC(response.entry_amount_tax_sum):"0") + "," +
      scheduleCommon.setQuotation(response.entry_amount_total_sum != null ? billingSummaryList.numFormatterC(response.entry_amount_total_sum):"0")  + "," +
      scheduleCommon.setQuotation(response.pay_amount_sum != null ? billingSummaryList.numFormatterC(response.pay_amount_sum):"0")  + "," +
      scheduleCommon.setQuotation(response.pay_amount_tax_sum != null ? billingSummaryList.numFormatterC(response.pay_amount_tax_sum):"0") + "," +
      scheduleCommon.setQuotation(response.pay_amount_total_sum != null ? billingSummaryList.numFormatterC(response.pay_amount_total_sum):"0") + "," +
      scheduleCommon.setQuotation(response.pay_complete_sum != null ? billingSummaryList.numFormatterC(response.pay_complete_sum):"0") + "," +
      scheduleCommon.setQuotation(response.furikomiryo_sum != null ? billingSummaryList.numFormatterC(response.furikomiryo_sum):"0") + "," +
      scheduleCommon.setQuotation(response.kaishuugaku_total != null ? billingSummaryList.numFormatterC(response.kaishuugaku_total):"0") ;
      lines.push(text);
      lines.push("\r\n");
      var detail_text = lines.join("\r\n");
      blob = new Blob([bom,detail_text], {type: "text/csv;charset=utf-8"});
      saveAs(blob,filename + ".csv");
  });
}
// 案件情報ダイアログの表示
billingSummaryList.onOpenEntryInfoDialog = function (event) {
  var rowid = $("#billing_summary_list").getGridParam('selrow');
  var row = $("#billing_summary_list").getRowData(rowid);
  billingSummaryList.openEntryDialog(row);
};

// 請求情報リストダイアログの表示
billingSummaryList.openBillingListDialog = function (event) {
  var rowid = $("#billing_summary_list").getGridParam('selrow');
  var row = $("#billing_summary_list").getRowData(rowid);
	$("#billing_info_list").GridUnload();
	billingSummaryList.createBillingListGrid(row.entry_no);
};
// 請求情報リストの生成
billingSummaryList.createBillingListGrid = function (entry_no) {
	// 請求情報リストのグリッド
	jQuery("#billing_info_list").jqGrid({
		url: '/billing_info_get?entry_no=' + entry_no + '&delete_check=0',
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','請求番号serial','請求番号','請求日', '入金予定日','税抜請求金額'
			,'消費税','請求金額合計','入金額', '入金日','請求区分','請求先区分'
			,'','クライアント名','','クライアント部署','','','','','','クライアント担当者','クライアント情報','備考'
			,'','代理店名','','代理店部署','','','','','','代理店担当者','代理店情報','代理店備考'
			,'','その他名','','その他部署','','その他担当者','その他情報','その他備考'
			,'作成日','作成者','更新日','更新者','削除フラグ','','',''],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'billing_no', index: 'billing_no', hidden:true },
			{ name: 'billing_number', index: 'billing_number', width: 80, align: "center" },
			{ name: 'pay_planning_date', index: 'pay_planning_date', width: 80, align: "center" },
			{ name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 100, align: "center" },
			{ name: 'pay_amount', index: 'pay_amount', width: 120, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_amount_tax', index: 'pay_amount_tax', width: 80, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_amount_total', index: 'pay_amount_total', width: 120, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_complete', index: 'pay_complete', width: 80, align: "right" },
			{ name: 'pay_complete_date', index: 'pay_complete_date', width: 80, align: "center" },
			{ name: 'pay_result', index: 'pay_result', width: 80, align: "center" ,formatter:scheduleCommon.pay_resultFormatter},
			{ name: 'billing_kind', index: 'billing_kind', width: 100 , align: "center", formatter:scheduleCommon.billing_kindFormatter},
			{ name: 'client_cd', index: '', hidden:true },
			{ name: 'client_name', index: 'client_name', width: 200 , align: "center" },
			{ name: 'client_division_cd', index: '', hidden:true },
			{ name: 'client_division_name', index: 'client_division_name', width: 200 , align: "center" },
			{ name: 'client_address_1', index: '', hidden:true },
			{ name: 'client_address_2', index: '', hidden:true },
			{ name: 'client_tel_no', index: '', hidden:true },
			{ name: 'client_fax_no', index: '', hidden:true },
			{ name: 'client_person_id', index: '', hidden:true },
			{ name: 'client_person_name', index: 'client_person_name', width: 120 , align: "center" },
			{ name: 'client_info', hidden:true},
			{ name: 'memo', index: 'memo', width: 100, align: "center" },
			{ name: 'agent_cd', index: '', hidden:true },
			{ name: 'agent_name', index: 'agent_name', width: 200 , align: "center" },
			{ name: 'agent_division_cd', index: '', hidden:true },
			{ name: 'agent_division_name', index: 'agent_division_name', width: 200 , align: "center" },
			{ name: 'agent_address_1', index: '', hidden:true },
			{ name: 'agent_address_2', index: '', hidden:true },
			{ name: 'agent_tel_no', index: '', hidden:true },
			{ name: 'agent_fax_no', index: '', hidden:true },
			{ name: 'agent_person_id', index: '', hidden:true },
			{ name: 'agent_person_name', index: 'agent_person_name', width: 120 , align: "center" },
			{ name: 'agent_info', hidden:true},
			{ name: 'agent_memo', index: 'agent_memo', width: 100, align: "center" },
			{ name: 'etc_cd', index: '', hidden:true },
			{ name: 'etc_name', index: 'etc_name', width: 200 , align: "center" },
			{ name: 'etc_division_cd', index: '', hidden:true },
			{ name: 'etc_division_name', index: 'etc_division_name', width: 200 , align: "center" },
			{ name: 'etc_person_id', index: '', hidden:true },
			{ name: 'etc_person_name', index: 'etc_person_name', width: 120 , align: "center" },
			{ name: 'etc_info', hidden:true},
			{ name: 'etc_memo', index: 'etc_memo', width: 100, align: "center" },
			{ name: 'created', index: 'created', width: 120 }, // 作成日
			{ name: 'created_id', index: 'created_id', width: 120 }, // 作成者ID
			{ name: 'updated', index: 'updated', width: 120 }, // 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },			// 更新者ID
			{ name: 'delete_check', index: '', hidden:true },
			{ name: 'furikomi_ryo', index:'', hidden:true},
			{ name: 'nyukin_total', index:'', hidden:true},
			{ name: 'nyukin_yotei_p', index:'', hidden:true}
		],
		height: "230px",
		//width:"800",
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10],
		pager: '#billing_info_list_pager',
		sortname: 'billing_number',
		viewrecords: true,
		sortorder: "asc",
    caption: "請求情報",
		onSelectRow: billingSummaryList.onSelectBillingList,
    loadComplete:billingSummaryList.loadComplete
	});
	jQuery("#billing_info_list").jqGrid('navGrid', '#billing_info_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
billingSummaryList.loadComplete = function() {
  $("#billing_list_dialog").dialog("open");
}

// 請求情報リストダイアログの生成
billingSummaryList.createBillingListDialog = function () {
	$('#billing_list_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 600,
		title: '請求情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 請求選択イベント
billingSummaryList.onSelectBillingList = function (rowid) {
	billingSummaryList.currentBilling = $("#billing_info_list").getRowData(rowid);
	$("#add_billing").css("display","none");
	$("#edit_billing").css("display","inline");
};
// 請求情報編集ダイアログの生成
billingSummaryList.createBillingFormDialog = function () {
	$('#billing_form_dialog').dialog({
		autoOpen: false,
		width: 960,
		height: 900,
		title: '請求情報の編集',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (billingList.saveBillingInfo()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (billingList.saveBillingInfo()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 請求情報編集用ダイアログの表示
billingSummaryList.openBillingFormDialog = function (event) {
	// フォームをクリアする
	billingList.clearPayResult();	// 請求区分のチェックをクリアする
	var billing = billingList.clearBilling();
	billingList.setBillingForm(billing);
	if ($(event.target).attr('id') == 'edit_billing') {
		// 編集ボタンから開いた場合
		billingSummaryList.openEditDialog();
  }
	// 請求金額合計を取得する
	billingSummaryList.requestBillingTotalForBillingForm(billingSummaryList.currentBilling.entry_no);
};

// 編集用にダイアログを表示する
billingSummaryList.openEditDialog = function() {
	billingSummaryList.status = "edit";
	//billingSummaryList.currentBilling.client_info = client_info;
	var billing = billingSummaryList.currentBilling;
	billing.pay_amount = billing.pay_amount.trim().replace(/,/g,'');
	billing.pay_amount_tax = billing.pay_amount_tax.trim().replace(/,/g,'');
	billing.pay_amount_total = billing.pay_amount_total.trim().replace(/,/g,'');
	billingList.setBillingForm(billing);
};
