 
$(function() {
	$('#test_dialog').dialog({
		autoOpen: false,
		title: '試験情報',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"OK": function(){
					$(this).dialog('close');
				}
			}
	});
	jQuery("#test_list").jqGrid({
		url:'db?q=2',
		altRows: true,
		datatype: "json",
		colNames:['試験ID', '名称', '説明','試験種別','試験開始予定日','試験完了予定日','試験開始日','試験完了日','必要な検体数','手配済検体数','完了検体数','報告書提出予定日','報告書提出日','入金予定日','入金完了日','営業担当者','試験担当者'],
		colModel:[
			{name:'test_id', index:'test_id', width:40},
			{name:'name', index:'name', width:160},
			{name:'description', index:'description', width:200},
			{name:'test_type', index:'test_type', width:60, align:"center"},
			{name:'start_date', index:'start_date', width:80, align:"center"},
			{name:'end_date', index:'end_date', width:80, align:"center"},
			{name:'start_date_r', index:'start_date_r', width:70, align:"center"},
			{name:'end_date_r', index:'end_date_r', width:70, align:"center"},
			{name:'subject_vol', index:'subject_vol', width:80,align:"right"},
			{name:'set_subject_vol', index:'set_subject_vol', width:80,align:"right"},
			{name:'complete_vol', index:'complete_vol', width:60,align:"right"},
			{name:'report_date', index:'report_date', width:80, align:"center"},
			{name:'report_date_r', index:'report_date_r', width:80, align:"center"},
			{name:'money_receive_date', index:'money_receive_date', width:70, align:"center"},
			{name:'money_receive_date_r', index:'money_receive_date_r', width:70, align:"center"},
			{name:'sales_id', index:'sales_id', width:70},
			{name:'test_person_id', index:'test_person_id', width:70}
		],
		rowNum:20,
		rowList:[10,20,30],
		pager: '#test_pager',
		sortname: 'test_id',
		viewrecords: true,
		sortorder: "desc",
		caption:"被験者リスト"
	});
	jQuery("#test_list").jqGrid('navGrid','#test_pager',{edit:false,add:false,del:false});
	$("#add_test").click(testManagement.openDialog);
});

var	testManagement = testManagement || {};
testManagement.openDialog = function() {
	$("#test_dialog").dialog("open");
};


