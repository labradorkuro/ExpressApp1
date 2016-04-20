
$(function ()　{
    'use strict';
  // 権限チェック
  uriageList.checkAuth();
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
  $("#search_button").bind('click',uriageList.onSearchButton);
});

var uriageList = uriageList || {}
uriageList.onSearchButton = function(ui,event) {
  $("#uriage_list").GridUnload();
  uriageList.createGrid();
}
// 権限チェック
uriageList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
	}
};
uriageList.createGrid = function() {
  var sd = $("#start_date").val();
  var ed = $("#end_date").val();
  // 売上集計リストのグリッド
  var req_url = "/uriage_summary?start_date='" + sd + "'&end_date='" + ed + "'";
	jQuery("#uriage_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['案件No','試験名','売上金額'],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 100, align: "center" ,sortable:true},
      { name: 'entry_title', index: 'entry_title', width: 200, align: "center" },
			{ name: 'uriage_sum', index: 'uriage_sum', width: 200, align: "right",formatter:uriageList.numFormatterC }
		],
		height:240,
		width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#uriage_pager',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "desc",
		caption: "売上集計",
		onSelectRow:uriageList.onSelectUriageList,
    loadComplete:uriageList.loadCompleteUgiageList
	});
	jQuery("#uriage_list").jqGrid('navGrid', '#uriage_pager', { edit: false, add: false, del: false});
	scheduleCommon.changeFontSize();

};
uriageList.onSelectUriageList = function(event) {

};
uriageList.loadCompleteUgiageList = function(event) {

};
uriageList.numFormatterC = function(num) {
	return scheduleCommon.numFormatter( Math.round(num), 10);
};
