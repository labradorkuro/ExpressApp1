$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
	$("#tabs_patch").tabs();
					
	$('#schedule_dialog').dialog({
		autoOpen: false,
		width:'600px',
		title: 'スケジュールの詳細',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"追加": function(){
					CalendarTable.addSchedule();
					$(this).dialog('close');
				},
				"OK": function(){
					$(this).dialog('close');
				},
				"CANCEL": function(){
					$(this).dialog('close');
				}
			}
	});
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	var ymd = today.split("/");
	CalendarTable.init("calendar_div1", ymd[0], ymd[1]);
	CalendarTableForPatchTest.init("calendar_div2_1", ymd[0], ymd[1]);
	CalendarTableForPatchTest.init("calendar_div2_2", ymd[0], ymd[1]);
	CalendarTable.init("calendar_div3", ymd[0], ymd[1]);
	CalendarTable.init("calendar_div4", ymd[0], ymd[1]);
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});

});
