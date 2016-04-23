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
});

// 処理用オブジェクト
var uriageList = uriageList || {}

// 初期化処理
uriageList.init = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#start_date").val(today);
  $("#end_date").val(today);
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
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?op=all&start_date=" + sd + "&end_date=" + ed;
	jQuery("#uriage_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['集計','売上金額'],
		colModel: [
      { name: 'title', index: 'title', width: 200, align: "center" },
			{ name: 'uriage_sum', index: 'uriage_sum', width: 200, align: "right",formatter:uriageList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#uriage_pager',
		sortname: 'title',
		viewrecords: true,
		sortorder: "asc",
		caption: "売上集計(全社)",
		onSelectRow:uriageList.onSelectUriageSummary,
    loadComplete:uriageList.loadCompleteUgiageSummary
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();

};

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
		colNames: ['案件No','試験名','売上金額'],
		colModel: [
      { name: 'entry_no', index: 'entry_no', width: 200, align: "center" },
      { name: 'entry_title', index: 'entry_title', width: 200, align: "center" },
			{ name: 'uriage_sum', index: 'uriage_sum', width: 200, align: "right",formatter:uriageList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#uriage_detail_pager',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "案件リスト",
		onSelectRow:uriageList.onSelectUriageList,
    loadComplete:uriageList.loadCompleteUgiageList
	});
	jQuery("#uriage_list_detail").jqGrid('navGrid', '#uriage_detail_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();
};

// 検索集計結果を表示するグリッドの生成処理（試験課別）
uriageList.createGrid_division = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?op=division&start_date=" + sd + "&end_date=" + ed;
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
		sortname: 'division_cd',
		viewrecords: true,
		sortorder: "asc",
		caption: "売上集計(試験課別)",
		onSelectRow:uriageList.onSelectUriageSummary,
    loadComplete:uriageList.loadCompleteUgiageSummary
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();
};

// 検索集計結果を表示するグリッドの生成処理（顧客別）
uriageList.createGrid_client = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?op=client&start_date=" + sd + "&end_date=" + ed;
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
		sortname: 'entry_info.client_cd',
		viewrecords: true,
		sortorder: "asc",
		caption: "売上集計(顧客別)",
		onSelectRow:uriageList.onSelectUriageSummary,
    loadComplete:uriageList.loadCompleteUgiageSummary
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false ,search:false});
	scheduleCommon.changeFontSize();
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
uriageList.onSelectUriageList = function(event) {

};
uriageList.loadCompleteUgiageList = function(event) {

};
uriageList.numFormatterC = function(num) {
	return scheduleCommon.numFormatter( Math.round(num), 10);
};
