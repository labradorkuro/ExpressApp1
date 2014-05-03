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
	GanttTable.Init("ganttTable_div1","2014/05/07","2014/05/13",1,1);
	GanttTable.Init("ganttTable_div2","2014/05/07","2014/05/13",2,1);
	GanttTable.Init("ganttTable_div3","2014/05/07","2014/05/13",3,1);
	GanttTable.Init("ganttTable_div4","2014/05/07","2014/05/13",4,1);
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
	$("#add_schedule_1").click(scheduleManagement.openDialog);
	$("#dlg_tests").change(scheduleManagement.getSubjects);
});
var	scheduleManagement = scheduleManagement || {};
scheduleManagement.openDialog = function() {
	$.ajax({
		url: 'db?q=2',
		cache: false,
		dataType:'json',
		success: function(tests){
			scheduleManagement.setTestList(tests);				
			$("#schedule_dialog").dialog("open");
		}
	});
};

scheduleManagement.setTestList = function(tests) {
	$("#dlg_tests").empty();
	$("#dlg_tests").append("<option value='0'>選択して下さい</option>");
	for(var i = 0;i < tests.rows.length;i++) {
		$("#dlg_tests").append("<option value='" + tests.rows[i].test_id + "'>" + tests.rows[i].name + "</option>");
	}
};
scheduleManagement.setSubjectList = function(subjects) {
	$("#dlg_subjects").empty();
	for(var i = 0;i < subjects.rows.length;i++) {
		$("#dlg_subjects").append("<option value='" + subjects.rows[i].subject_no + "'>" + subjects.rows[i].name + "</option>");
	}
};
scheduleManagement.getSubjects = function() {
	$.ajax({
		url: 'db?q=1',
		cache: false,
		dataType:'json',
		success: function(subjects){
			scheduleManagement.setSubjectList(subjects);
		}
	});
};

scheduleManagement.addSchedule = function() {
	var test_id = $("#dlg_tests option:selected").val();
	var patch_no = $("#dlg_patch_no option:selected").val();
	var sd = $("#dlg_start_date").val();
	var ed = $("#dlg_end_date").val();
	var sdr = $("#dlg_start_date_r").val();
	var edr = $("#dlg_end_date_r").val();
	//$("#dlg_subjects option:selected").each(function() {
	//	$(subject_no).push($(this).val());
	//});
	var post_data = "q=1&test_id=" + test_id + "&patch_no=" + patch_no + "&start_date=" + sd +"&end_date=" + ed + "&start_date_r=" + sdr + "&end_date_r=" + edr + "&subjects=";
	var children = $("#dlg_subjects").children();
	for(var i = 0;i < children.length;i++) {
		var v = $(children[i]).val();
		if (i > 0) post_data += ",";
		post_data += v;		
	}
	$.ajax({
	   type: "POST",
	   url: "dbpost",
	   data: post_data,
	   success: function(msg){
		 alert( "Data Saved: " + msg );
	   }
	 });
};
