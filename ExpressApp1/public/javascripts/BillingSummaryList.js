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
});

// 処理用オブジェクト
var billingSummaryList = billingSummaryList || {}

// 初期化処理
billingSummaryList.init = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#start_date").val(today);
  $("#end_date").val(today);
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

// 検索集計結果を表示するグリッドの生成処理
billingSummaryList.createGrid = function() {
  var keyword = $("#billing_search_keyword").val();
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/billing_summary_list_get?delete_check=0"+ "&keyword=" + keyword;
	jQuery("#billing_summary_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
        colNames: ['案件No.','請求先','試験大分類','試験タイトル','案件金額','消費税','案件金額(税込)','請求予定日','報告書提出日',
        '請求日','請求番号','請求金額','消費税','請求金額(税込)','入金予定日','入金予定日(仮)','入金日','入金額','振込手数料','回収額','請求ステータス','試験場'],
		colModel: [
      { name: 'entry_no', index: 'entry_no', width: 200, align: "center" },
      { name: 'client_name', index: 'client_name', width: 160, align: "center" },
	    { name: 'test_large_class_name', index: 'test_large_class_name', width: 160, align: "center" },
      { name: 'entry_title', index: 'entry_title', width: 160, align: "center" },
      { name: 'entry_amount_price', index: 'entry_amout_price', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'entry_amount_tax', index: 'entry_amount_tax', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'entry_amount_total', index: 'entry_amount_total', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_planning_date', index: 'pay_planning_date', width: 120, align: "center" },
      { name: 'report_limit_date', index: 'report_limit_date', width: 120, align: "center" },
      { name: 'seikyu_date', index: 'seikyu_date', width: 120, align: "center" },
      { name: 'billing_number', index: 'billing_number', width: 120, align: "center" },
      { name: 'pay_amount', index: 'pay_amout', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_amount_tax', index: 'pay_amount_tax', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_amount_total', index: 'pay_amount_total', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 120, align: "center" },
      { name: 'nyukin_yotei_date_p', index: 'nyukin_yotei_date_p', width: 120, align: "center" },
      { name: 'nyukin_date', index: 'nyukin_date', width: 120, align: "center" },
      { name: 'pay_complete', index: 'pay_complete', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'furikomi_tesuuryou', index: 'furikomi_tesuuryou', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_complete_total', index: 'pay_complete_total', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
      { name: 'pay_result', index: 'pay_result', width: 100, align: "center",formatter: scheduleCommon.payResultFormatter },
      { name: 'shikenjo', index: 'shikenjo', width: 160, align: "center" ,formatter: scheduleCommon.shikenjoFormatter ,searchoptions:{sopt:['cn','nc','eq', 'ne', 'bw', 'bn', 'ew', 'en']}},
		],
		height:320,
		width:screen.width - 50,
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
    onSelectRow:billingSummaryList.onSelectbillingSummaryList,
    loadComplete:billingSummaryList.loadCompleteUgiageSummary
	});
	jQuery("#billing_summary_list").jqGrid('navGrid', '#billing_summary_list_pager', { edit: false, add: false, del: false ,search:false});
  $('#billing_summary_list_pager_left table.ui-pg-table').css('float','left');
  $('#billing_summary_list_pager_left').css('width','30%');
  $('#billing_summary_list_pager_center').css('vertical-align','top');
	scheduleCommon.changeFontSize();
  billingSummaryList.getUriageTotal(sd,ed,keyword);
};

// 売上集計総合計の取得
billingSummaryList.getUriageTotal = function(start_date, end_date,keyword) {
/*
    $.get('/uriage_total?start_date=' + start_date + '&end_date=' + end_date + '&keyword=' + keyword,function(response) {
        if (response.uriage_total) {
          $("#uriage_total").text('合計：' + billingSummaryList.numFormatterC(response.uriage_total) + '円');
        } else {
          $("#uriage_total").text("");
        }
    });
    */
}
billingSummaryList.loadCompleteUgiageSummary = function(event) {
    // loadCompleイベント処理（表示行数に合わせてグリッドの高さを変える）
      var rowNum = Number($("#billing_summary_list").getGridParam('rowNum'));
      $("#billing_summary_list").setGridHeight(rowNum * 25);
  };
  