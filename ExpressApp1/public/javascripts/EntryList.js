//
// DRC殿試験案件スケジュール管理
// 案件リスト画面の処理
//
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
	// 案件リストのグリッド
	jQuery("#entry_list").jqGrid({
		url:'/entry_get',
		altRows: true,
		datatype: "json",
		colNames:['案件No','案件名','問合せ日', '案件ステータス', '拠点CD','担当者','見積番号','見積発行日'
				,'受注日','仮受注チェック','受注区分','試験課','作成日','作成者','更新日','更新者'],
		colModel:[
			{name: 'entry_no', index: 'entry_no', width: 110, align: "center" },
			{name:'entry_title', index:'entry_title', width:200, align:"center"},
			{name:'inquiry_date', index:'inquiry_date', width:100},
			{name:'entry_status', index:'entry_status', width:100},
			{name:'base_cd', index:'base_cd', width:100, align:"center"},
			{name:'person_id', index:'person_id', width:100, align:"center"},
			{name:'quoto_no', index:'quoto_no'},
			{name:'quoto_issue_date', index:'quoto_issue_date'},
			{name:'order_accepted_date', index:'order_accepted_date'},
			{name:'order_accept_check', index:'order_accept_check'},
			{name:'order_type', index:'order_type', width:100, align:"center"},
			{name:'division', index:'division', width:100, align:"center"},
			{name:'created', index:'created'},
			{name:'created_id', index:'created_id'},
			{name:'updated', index:'updated'},
			{name:'updated_id', index:'updated_id'},
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
	entryList.changeFontSize('1.2em');
	// 追加ボタンイベント（登録・編集用画面の表示）
	$("#add_entry").click(entryList.openEditWindow);
	// 編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_entry").click(entryList.openEditWindow);
	// オーバーレイ表示する（元の画面全体をグレー表示にする）	
	$("body").append("<div id='graylayer'></div><div id='overlayer'></div>");
	//$("#graylayer").css("height","100%");
	//$("#graylayer").click(function(){
	//	$(this).hide();
	//	$("#overlayer").hide();
	//});
});
var entryList = entryList || {};

// 表示フォントサイズ変更
entryList.changeFontSize = function(size){
	$('div.ui-jqgrid').css('font-size', size);
	$('div.ui-jqgrid-view').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('height', size)
        .children('div').css('height', size);
    $('div.ui-jqgrid-pager').css('height', '1.6em');
    $('div.ui-jqgrid-pager').css('font-size', '1.2em');
    $('.ui-pg-input').css('height', '1.3em');
    $('.ui-pg-selbox').css('height', '1.3em');
};

// 編集用画面の表示
entryList.openEditWindow = function() {
	$("#graylayer").show();
	var no = '140808013';
	var margin_top = $("#overlayer").height() / 2;
	var margin_left = $("#overlayer").width() / 2;
	// 表示する内容を読込む
	$("#overlayer").show().html("<iframe id='entry_modal' src='entry_edit/" + no + "'></iframe>").css({"margin-top":"-" + margin_top + "px","margin-left":"-" + margin_left + "px"});
	//$("#overlayer img.close").click(function(){
	//	$("#overlayer").hide();
	//	$("#graylayer").hide();
	//});
	return false;
};

