 
$(function() {
	$( "#tabs" ).tabs();
	$('#subject_dialog').dialog({
		autoOpen: false,
		title: '被験者情報',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"OK": function(){
					$(this).dialog('close');
				}
			}
	});
	jQuery("#subjects_list").jqGrid({
		url:'db?q=1',
		altRows: true,
		datatype: "json",
		colNames:['被験者No', '氏名', 'カナ','年齢','性別','所属'],
		colModel:[
			{name:'subject_no', index:'subject_no', width:100},
			{name:'name', index:'name', width:130},
			{name:'name_kana', index:'name_kana', width:130},
			{name:'age', index:'age', width:40, align:"right"},
			{name:'sex', index:'sex', width:40},
			{name:'affiliation', index:'affiliation', width:140}
		],
		rowNum:10,
		rowList:[10,20,30],
		pager: '#subjects_pager',
		sortname: 'subject_no',
		viewrecords: true,
		sortorder: "desc",
		caption:"被験者リスト"
	});
	jQuery("#subjects_list").jqGrid('navGrid','#subjects_pager',{edit:false,add:false,del:false});
	$("#add_subject").click(adminMenu.openSubjectDialog);
});

var	adminMenu = adminMenu || {};
adminMenu.openSubjectDialog = function() {
	$("#subject_dialog").dialog("open");
};


