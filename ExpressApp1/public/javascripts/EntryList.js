$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs1" ).tabs();
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
	$('#entry_dialog').dialog({
		autoOpen: false,
		title: '案件情報',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"OK": function(){
					$(this).dialog('close');
				}
			}
	});

	jQuery("#entry_list").jqGrid({
		//url:'db?q=5',
		altRows: true,
		datatype: "json",
		colNames:['案件番号', '問合せ日', 'ステータス','案件名','契約タイプ','受注区分','試験課','担当者'],
		colModel:[
			{name:'entry_no', index:'entry_no', width:110},
			{name:'inquiry_date', index:'inquiry_date', width:100},
			{name:'entry_status', index:'entry_status', width:100},
			{name:'entry_name', index:'entry_name', width:200, align:"center"},
			{name:'contract_type', index:'contract_type', width:100, align:"center"},
			{name:'order_type', index:'order_type', width:100, align:"center"},
			{name:'division', index:'division', width:100, align:"center"},
			{name:'person_id', index:'person_id', width:100, align:"center"}
		],
		rowNum:20,
		rowList:[10,20,30],
		pager: '#entry_pager',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "desc",
		caption:"案件リスト"
	});
	jQuery("#entry_list").jqGrid('navGrid','#entry_pager',{edit:false,add:false,del:false});
	entryList.changeFontSize('1.6em');
	$("#add_entry").click(entryList.openEditWindow);
	// Modal Window
	//$("html").css("height","100%");
	//$("body").css("height","100%");
	$("body").append("<div id='graylayer'></div><div id='overlayer'></div>");
	//$("#graylayer").css("height","100%");
	$("#graylayer").click(function(){
		$(this).hide();
		$("#overlayer").hide();
	});
});
var	entryList = entryList || {};

entryList.changeFontSize = function(size){
    $('div.ui-jqgrid').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('height', size)
        .children('div').css('height', size);
    $('div.ui-jqgrid-pager').css('height', size);
    $('div.ui-jqgrid-pager').css('font-size', '1em');
    $('.ui-pg-input').css('height', '1.3em');
    $('.ui-pg-selbox').css('height', '1.3em');
};

entryList.openEditWindow = function() {
	$("#graylayer").show();
	var margin_top = $("#overlayer").height() / 2;
	var margin_left = $("#overlayer").width() / 2;
	$("#overlayer").show().html("<img src='images/no.png' class='close' /><iframe id='entry_modal' src='entry_management'></iframe>").css({"margin-top":"-" + margin_top + "px","margin-left":"-" + margin_left + "px"});
	$("#overlayer img.close").click(function(){
		$("#overlayer").hide();
		$("#graylayer").hide();
	});
	return false;
};

