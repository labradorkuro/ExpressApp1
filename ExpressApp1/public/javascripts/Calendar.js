$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
					
	$('#schedule_dialog').dialog({
		autoOpen: false,
		width:'400px',
		title: 'スケジュールの詳細',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"追加": function(){
					scheduleManagement.addSchedule();
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
	CalendarTableForPatchTest.init("calendar_div1",2014,6);
	CalendarTable.init("calendar_div2",2014,2);
	CalendarTable.init("calendar_div3",2014,6);
	CalendarTable.init("calendar_div4",2014.6);
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
});
