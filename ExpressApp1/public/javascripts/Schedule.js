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
	if (workitem.item_type == 0) {
		$("#item_type1").prop("checked", true);
	} else {
		$("#item_type2").prop("checked", true);
	}
};
workitemEdit.openDialog = function (event) {
	var target = event.target;
	// マイルストーンのimgがtargetになっている時は親のa要素からデータを取得するようにする
	if (event.target.className == 'gt_milestone_img') {
		target = event.target.parentElement;
	}
	// ドラッグした際に発生するイベントの場合はダイアログ表示しないようにフラグをチェックする
	var drag = $(target).data("drag");
	if (drag == 'on') {
		// フラグをクリアする
		$(target).data("drag","");
		return false;
	}
	var workitem = $(target).data("workitem");
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

// テンプレート選択ボタンイベント
workitemEdit.onSelectTemplate = function (event) {
	var workitem = $(event.target).data("workitem");
	var template_name = "";
	template_name = "案件１";	/// for debug
	workitemEdit.selectTemplate(workitem.entry_no, template_name);
};

// テンプレートを選択して指定された案件の作業項目として追加する
workitemEdit.selectTemplate = function (entry_no, template_name) {
	var template = $.get('/template_get/list/' + tamplate_name + '/' + 2, {});
	$.when(template)
	.done(function (template_response) {
		for (var i = 0; i < template_response.length; i++) {
		}
	})
    .fail(function () {
		$("#error").html("an error occured").show();
	});
};

// テンプレートとして保存ボタンイベント
workitemEdit.onSaveToTemplate = function (event) {
	var workitem = $(event.target).data("workitem");
	workitemEdit.saveTemplate(workitem.entry_no);
};

// 案件に登録されている項目をテンプレートとして保存する
workitemEdit.saveTemplate = function (entry_no) {
	var entry = $.get('/entry_get/' + entry_no, {});
	// 作業項目データの検索(マイルストーンと作業項目)
	var workitem_list = $.get('/workitem_get/' + entry_no + '/' + 2, {});
	// 検索が終了後に処理	
	$.when(entry, workitem_list)
    .done(function (entry_Response, workitem_listResponse) {
		var list = workitem_listResponse[0];
		for (var i = 0; i < list.length; i++) {
			var workitem = list[i];
			// 案件の受注日を起点の日とする
			var base_date = entry_Response[0].order_accepted_date;
			// 作業項目の開始日などの日付と起点の日の日数を求める
			var start_offset = scheduleCommon.calcDateCount(base_date, workitem.start_date) - 1;
			var end_offset = scheduleCommon.calcDateCount(base_date, workitem.end_date) - 1;
			// テンプレート化する時は起点の日を2000年1月1日とする
			var template = {
				template_id: -1, 
				template_name: entry_Response[0].entry_title, 
				work_title: workitem.work_title , 
				start_date: "2000/01/01", 
				end_date: "2000/01/01",
				priority_item_id: 0,
				item_type: workitem.item_type
			};
			// 求めた各日数を起点の日に加算して日付とする
			var sd = scheduleCommon.addDate(scheduleCommon.dateStringToDate(template.start_date), start_offset);
			template.start_date = scheduleCommon.getDateString(sd, "{0}/{1}/{2}");
			var ed = scheduleCommon.addDate(scheduleCommon.dateStringToDate(template.end_date), end_offset);
			template.end_date = scheduleCommon.getDateString(ed, "{0}/{1}/{2}");
			// DBにテンプレートを追加する
			workitemEdit.addTemplate(template);
		}
	})
    .fail(function () {
		$("#error").html("an error occured").show();
	});
};

// テンプレートをDBに追加する
workitemEdit.addTemplate = function (template) {
	$.ajax("/template_post", {
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify(template),
		contentType : 'application/json',
		success: workitemEdit.onAddTemplate
	}
	);
};

workitemEdit.onAddTemplate = function () {
};
