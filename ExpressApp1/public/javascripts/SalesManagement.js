 
$(function() {
	$('#sales_dialog').dialog({
		autoOpen: false,
		title: '営業管理',
		closeOnEscape: false,
		width:'400px',
		modal: true,
			buttons: {
				"OK": function(){
					salesManagement.addSales();
					$(this).dialog('close');
				},
				"キャンセル": function(){
					$(this).dialog('close');
				},
				"閉じる": function(){
					$(this).dialog('close');
				}
			}
	});
	jQuery("#sales_list").jqGrid({
		url:'db?q=4',
		altRows: true,
		datatype: "json",
		colNames:['案件No', '名称', '得意先コード','受付日','受注日','入金予定日','入金完了日','営業担当者'],
		colModel:[
			{name:'sales_no', index:'sales_no', width:80},
			{name:'name', index:'name', width:160},
			{name:'customer_code', index:'customer_code', width:70},
			{name:'regist_date', index:'regist_date', width:80, align:"center"},
			{name:'order_date', index:'order_date_r', width:80, align:"center"},
			{name:'money_receive_date', index:'money_receive_date', width:70, align:"center"},
			{name:'money_receive_date_r', index:'money_receive_date_r', width:70, align:"center"},
			{name:'sales_user_id', index:'sales_user_id', width:70}
		],
		rowNum:20,
		rowList:[10,20,30],
		pager: '#sales_pager',
		sortname: 'sales_no',
		viewrecords: true,
		sortorder: "desc",
		caption:"案件リスト"
	});
	jQuery("#sales_list").jqGrid('navGrid','#sales_pager',{edit:false,add:false,del:false});
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
	$("#add_sales").click(salesManagement.openDialog);
});

var	salesManagement = salesManagement || {};
salesManagement.openDialog = function() {
	$("#sales_dialog").dialog("open");
	//window.open("http://localhost:1337/sales_edit","営業管理","width=600,height=400");
};

salesManagement.addSales = function() {
	var sales_no = $("#dlg_sales_no").val();
	var name = $("#dlg_name").val();
	var customer_code = $("#dlg_customer_code").val();
	var rd = $("#dlg_regist_date").val();
	var mrd = $("#dlg_money_receive_date").val();
	var mrdd = $("#dlg_money_received_date").val();
	var sid = $("#dlg_sales_user_id option:selected").val();
	var post_data = "q=3&sales_no=" + sales_no + "&name=" + name + "&customer_code=" + customer_code +"&regist_date=" + rd + "&money_receive_date=" + mrd + "&money_received_date=" + mrdd + "&sales_user_id=" + sid;
	$.ajax({
	   type: "POST",
	   url: "dbpost",
	   data: post_data,
	   success: function(msg){
		 alert( "Data Saved: " + msg );
	   }
	 });
};

