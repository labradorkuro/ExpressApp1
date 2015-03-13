$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
					
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	GanttTable.start_date = today;
	GanttTable.disp_span = 1;
	workitemEdit.ganttTableInit();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	$("#prev_btn").click(workitemEdit.prev);
	$("#next_btn").click(workitemEdit.next);
	$("#today_btn").click(workitemEdit.today);
	$("#select_date").change(workitemEdit.selectDate);
	workitemEdit.createWorkitemDialog();
	workitemEdit.createTemplateSelectDialog();
	workitemEdit.createTemplateNameDialog();
	workitemEdit.createEntryDialog();
});
var workitemEdit = workitemEdit || {};
workitemEdit.createWorkitemDialog = function () {
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
				class: "close-btn",
				click: function () {
					$(this).dialog('close');
				}
			}
		]
	});
};
workitemEdit.createTemplateSelectDialog = function () {
	$('#select_template_dialog').dialog({
		autoOpen: false,
		width: 540,
		height: 500,
		title: 'テンプレートの選択',
		closeOnEscape: false,
		modal: true,
		buttons: [
			{
				text: "閉じる",
				class: "close-btn",
				click: function () {
					$(this).dialog('close');
				}
			}
		]
	});
};
workitemEdit.createTemplateNameDialog = function () {
	$('#template_name_dialog').dialog({
		autoOpen: false,
		width: '510px',
		title: 'テンプレートの保存',
		closeOnEscape: false,
		modal: true,
		buttons: [
			{
				text: "保存",
				class: "save-btn",
				click: function () {
					// 保存処理
					// テンプレート名の入力ダイアログを表示する
					workitemEdit.saveTemplate($("#template_name").val(), $("#entry_no").val());
					$(this).dialog('close');
				}
			},
			{
				text: "閉じる",
				class: "close-btn",
				click: function () {
					$(this).dialog('close');
				}
			}
		]
	});
};
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
	GanttTable.Init("ganttTable_div1", "L01", 1);
	GanttTable.Init("ganttTable_div2", "L02", 1);
	GanttTable.Init("ganttTable_div3", "L03", 1);
	GanttTable.Init("ganttTable_div4", "L04", 1);
	GanttTable.Init("ganttTable_div5", "L05", 1);
	GanttTable.Init("ganttTable_div6", "L06", 1);
};

// テンプレート選択ボタンイベント
workitemEdit.onSelectTemplate = function (event) {
	scheduleCommon.showConfirmDialog("#messageDlg", "作業項目の追加", "このテンプレートを作業項目として追加しますか？", function (){
		$("#messageDlg").dialog("close");
		$("#select_template_dialog").dialog("close");
		var workitem = $(event.target).data("workitem");
		// 案件の作業項目として追加する
		workitemEdit.selectTemplate(workitem.entry_no, workitem.template_name);
	});
};

// 選択されたテンプレートを指定された案件の作業項目として追加する
workitemEdit.selectTemplate = function (entry_no, template_name) {
	var entry = $.get('/entry_get/' + entry_no, {});
	var template = $.get('/template_get/list/' + template_name + '/' + 2 + '?delete_check=' + 0, {});
	$.when(entry,template)
	.done(function (entry_Response,template_response) {
		var temp = template_response[0];
		for (var i = 0; i < temp.length; i++) {
			// 案件の受注日を起点の日とする
			var base_date = entry_Response[0].order_accepted_date;
			// 作業項目の開始日などの日付と起点の日の日数を求める
			var start_offset = scheduleCommon.calcDateCount("2000/01/01", temp[i].start_date) - 1;
			var end_offset = scheduleCommon.calcDateCount("2000/01/01", temp[i].end_date) - 1;
			var workitem = {
				entry_no: entry_no, 
				work_item_id: -1,
				work_title: temp[i].work_title, 
				start_date_result: "",
				end_date_result: "",
				item_type: temp[i].item_type, 
				priority_item_id: temp[i].priority_item_id,
				subsequent_item_id: 0,
				progress:0,
				delete_check:0
			};
			// 求めた各日数を起点の日に加算して日付とする
			var sd = scheduleCommon.addDate(scheduleCommon.dateStringToDate(base_date), start_offset);
			workitem.start_date = scheduleCommon.getDateString(sd, "{0}/{1}/{2}");
			var ed = scheduleCommon.addDate(scheduleCommon.dateStringToDate(base_date), end_offset);
			workitem.end_date = scheduleCommon.getDateString(ed, "{0}/{1}/{2}");
			workitemEdit.addWorkitem(workitem);
		}
	})
    .fail(function () {
		$("#error").html("an error occured").show();
	});
};

// テンプレートとして保存ボタンイベント
workitemEdit.onSaveToTemplate = function (event) {
	var workitem = $(event.target).data("workitem");
	$('#template_name').val(workitem.entry_title);
	$('#entry_no').val(workitem.entry_no);
	workitemEdit.openTemplateNameDialog();
};

// 案件に登録されている項目をテンプレートとして保存する
workitemEdit.saveTemplate = function (template_name, entry_no) {
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
				template_name: template_name, 
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
workitemEdit.addWorkitem = function (workitem) {
	$.ajax("/workitem_post", {
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify(workitem),
		contentType : 'application/json',
		success: workitemEdit.onAddWorkitem
	}
	);
};

workitemEdit.onAddWorkitem = function () {
	// ガントチャート表示の更新処理		
	workitemEdit.ganttTableInit();
};

// テンプレート選択ダイアログ
workitemEdit.openSelectTemplateDialog = function (event) {
	var workitem = $(event.target).data('workitem');
	// 初期化
	$("#template_table").empty();
	// テーブルを作成してリストを表示する
	$("#template_table").append("<tr><th>テンプレート名</th><th>項目名</th><th>種別</th>");
	var template = $.get('/template_get_all?delete_check=' + 0, {});
	$.when(template)
	.done(function (template_response) {
		var temp = template_response;
		if (temp.length > 0) {
			// 同一テンプレート名毎の件数を取得する
			var prev_name = temp[0].template_name;
			var name_count = [];
			var count = 0;
			for (var i = 0; i < temp.length; i++) {
				if (temp[i].template_name != prev_name) {
					// 名前と件数を保存する
					name_count.push({ name: prev_name, count: count });
					prev_name = temp[i].template_name;
					count = 0;
				}
				count++;
			}
			// 名前と件数を保存する
			name_count.push({ name: prev_name, count: count });
			// テーブル行を作成する
			var offset = 0;
			for (var j = 0; j < name_count.length; j++) {
				var name = name_count[j].name;
				var count = name_count[j].count;
				var td_name = $("<td rowspan=" + count + ">" + name + "</td>");
				var sel_btn = $("<a class='template_select_button'>選択</a>");
				// 選択ボタン押下処理にバインド
				workitem.template_name = name;
				$(sel_btn).data('workitem', workitem);
				$(sel_btn).bind("click",workitemEdit.onSelectTemplate);
				var tr = $("<tr></tr>");
				$(td_name).append(sel_btn);
				$(tr).append(td_name);
				for (var i = offset; i < count + offset; i++) {
					var type = temp[i].item_type == 0 ? "作業項目": "マイルストーン";
					var td_detail = $("<td>" + temp[i].work_title + "</td><td>" + type + "</td>");
					$(tr).append(td_detail);
					$("#template_table").append(tr);
					tr = $("<tr></tr>");
				}
				offset += count;
			}
		}
		$("#select_template_dialog").dialog("open");
	});
};
workitemEdit.openTemplateNameDialog = function (event) {
	$("#template_name_dialog").dialog("open");
};
// 案件入力用ダイアログの生成
workitemEdit.createEntryDialog = function () {
	$('#entry_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 600,
		title: '案件情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (workitemEdit.saveEntry()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (workitemEdit.saveEntry()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
workitemEdit.openEntryDialog = function (event) {
	var entry = event.data;
	$("#entry_dialog").dialog("open");
};
workitemEdit.saveEntry = function () {
};
