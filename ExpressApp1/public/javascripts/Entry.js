$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs1" ).tabs();
	$( "#tabs2" ).tabs();
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
	$("#save_entry").click(entryManagement.saveEntry);
	$("#cancel_entry").click(entryManagement.cancelEntry);
	$("#close_entry").click(entryManagement.closeEntry);

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

});
var	entryManagement = entryManagement || {};

entryManagement.saveEntry = function() {

};

entryManagement.cancelEntry = function() {
	scheduleCommon.closeModalWindow();
};

entryManagement.closeEntry = function() {
	scheduleCommon.closeModalWindow();
};
