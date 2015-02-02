$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
					
	$('#workitem_dialog').dialog({
		autoOpen: false,
		width: '700px',
		title: '作業項目の編集',
		closeOnEscape: false,
		modal: true,
		buttons: [
			{
			text: "追加",
			class: "add-btn",
			click: function () {
				workitemEdit.addItem();
				$(this).dialog('close');
			}
		},
			{
			text: "更新",
			class: "update-btn",
			click: function () {
				workitemEdit.updateItem(true);
				$(this).dialog('close');
			}
		},
			{
				text: "削除",
				class: "delete-btn",
				click: function () {
				workitemEdit.deleteItemConfirm();
					$(this).dialog('close');
				}
			},
			{
				text: "閉じる",
				class: "delete-btn",
				click: function () {
					$(this).dialog('close');
				}
			}
	]
	});
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	GanttTable.start_date = today;
	GanttTable.disp_span = 1;
	workitemEdit.ganttTableInit();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	$("#prev_btn").click(workitemEdit.prev);
	$("#next_btn").click(workitemEdit.next);
	$("#today_btn").click(workitemEdit.today);
	$("#select_date").change(workitemEdit.selectDate);
});
var workitemEdit = workitemEdit || {};
workitemEdit.setFormData = function (workitem) {
	// eventに渡されたデータをフォームにセットする
	$("#entry_no").val(workitem.entry_no);
	$("#work_item_id").val(workitem.work_item_id);
	$("#work_title").val(workitem.work_title);
	$("#start_date").val(workitem.start_date);
	$("#end_date").val(workitem.end_date);
	$("#start_date_result").val(workitem.start_date_result);
	$("#end_date_result").val(workitem.end_date_result);
	$("#priority_item_id").val("");
	$("#subsequent_item_id").val("");
	$("#progress").val(workitem.progress);
	$("#entry_no").val(workitem.entry_no);
	$("#entry_title").val(workitem.entry_title);
};
workitemEdit.openDialog = function (event) {
	// ドラッグした際に発生するイベントの場合はダイアログ表示しないようにフラグをチェックする
	var drag = $(event.target).data("drag");
	if (drag == 'on') {
		// フラグをクリアする
		$(event.target).data("drag","");
		return false;
	}
	var workitem = $(event.target).data("workitem");
	workitemEdit.setFormData(workitem);
	if (workitem.work_item_id != -1) {
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable"); 
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("enable");

	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable"); 
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("disable");
	}
	$("#workitem_dialog").dialog("open");
	return false;
};
// 作業項目の追加
workitemEdit.addItem = function () {
	// formデータの取得
	var form = workitemEdit.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/workitem_post', true);
	xhr.responseType = 'json';
	xhr.onload = workitemEdit.onloadWorkitemReq;
	xhr.send(form);
};
// 作業項目の更新
workitemEdit.updateItem = function (refresh) {
	// formデータの取得
	var form = workitemEdit.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/workitem_post', true);
	xhr.responseType = 'json';
	if (refresh) {
		xhr.onload = workitemEdit.onloadWorkitemReq;
	}
	xhr.send(form);
};
// 作業項目の削除確認ダイアログ表示
workitemEdit.deleteItemConfirm = function () {
	scheduleCommon.showConfirmDialog("#messageDlg", "作業項目の削除", "この作業項目を削除しますか？", workitemEdit.deleteItem);
};

// 作業項目の削除(削除フラグのセット）
workitemEdit.deleteItem = function () {
	$("#messageDlg").dialog("close");
	// formデータの取得
	var form = workitemEdit.getFormData();
	form.append('delete_check', '1'); // 削除フラグセット
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/workitem_post', true);
	xhr.responseType = 'json';
	xhr.onload = workitemEdit.onloadWorkitemReq;
	xhr.send(form);
};
// formデータの取得
workitemEdit.getFormData = function () {
	var form = new FormData(document.querySelector("#workitemForm"));
	return form;
};
// 追加、更新後のコールバック
workitemEdit.onloadWorkitemReq = function (e) {
	if (this.status == 200) {
		var workitem = this.response;
		// ガントチャート表示の更新処理		
		workitemEdit.ganttTableInit();
	}
};

// 前へボタン
workitemEdit.prev = function () {
	GanttTable.prev();
	workitemEdit.ganttTableInit();
};

// 次へボタン
workitemEdit.next = function () {
	GanttTable.next();
	workitemEdit.ganttTableInit();
};

// 今日ボタン
workitemEdit.today = function () {
	GanttTable.start_date = scheduleCommon.getToday("{0}/{1}/{2}");
	workitemEdit.ganttTableInit();
};

// 日付選択
workitemEdit.selectDate = function () {
	GanttTable.start_date = $("#select_date").val();
	workitemEdit.ganttTableInit();
};
workitemEdit.ganttTableInit = function () {
	GanttTable.Init("ganttTable_div1", "01", 1);
	GanttTable.Init("ganttTable_div2", "02", 1);
	GanttTable.Init("ganttTable_div3", "03", 1);
	GanttTable.Init("ganttTable_div4", "04", 1);
	GanttTable.Init("ganttTable_div5", "05", 1);
	GanttTable.Init("ganttTable_div6", "06", 1);
};
