$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
					
	$('#workitem_dialog').dialog({
		autoOpen: false,
		width:'700px',
		title: '作業項目の編集',
		closeOnEscape: false,
		modal: true,
			buttons: {
				"追加": function(){
					workitemEdit.addItem();
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
	GanttTable.start_date = today;
	GanttTable.disp_span = 1;
	GanttTable.Init("ganttTable_div1","01",1);
	GanttTable.Init("ganttTable_div2","02",1);
	GanttTable.Init("ganttTable_div3","03",1);
	GanttTable.Init("ganttTable_div4","04",1);
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	$("#prev_btn").click(workitemEdit.prev);
	$("#next_btn").click(workitemEdit.next);
});
var workitemEdit = workitemEdit || {};
workitemEdit.openDialog = function (event) {
	$("#entry_no").val(event.data.entry_no);
	$("#entry_title").val(event.data.entry_title);
	$("#workitem_dialog").dialog("open");
};

workitemEdit.addItem = function() {
	// formデータの取得
	var form = workitemEdit.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/workitem_post', true);
	xhr.responseType = 'json';
	xhr.onload = workitemEdit.onloadWorkitemReq;
	xhr.send(form);
};
// formデータの取得
workitemEdit.getFormData = function () {
	var form = new FormData(document.querySelector("#workitemForm"));
	// 新規追加時は-1を入れておく
	form.append('work_item_id', '-1');
	return form;
};
// 保存後のコールバック
workitemEdit.onloadEntryReq = function (e) {
	if (this.status == 200) {
		var workitem = this.response;
		// formに取得したデータを埋め込む
		$("#entry_no").val(workitem.entry_no); // 案件No
		
	}
};
workitemEdit.prev = function () {
	GanttTable.prev();
	GanttTable.Init("ganttTable_div1", "01",1);
	GanttTable.Init("ganttTable_div2", "02", 1);
	GanttTable.Init("ganttTable_div3", "03", 1);
	GanttTable.Init("ganttTable_div4", "04", 1);
};
workitemEdit.next = function () {
	GanttTable.next();
	GanttTable.Init("ganttTable_div1", "01", 1);
	GanttTable.Init("ganttTable_div2", "02", 1);
	GanttTable.Init("ganttTable_div3", "03", 1);
	GanttTable.Init("ganttTable_div4", "04", 1);
};
