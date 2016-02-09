//
// テンプレートの追加、編集処理
//
$(function() {
	GanttTemplate.checkAuth();
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();

	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	GanttTemplate.start_date = today;
	GanttTemplate.disp_span = 1;
	templateEdit.GanttTemplateInit();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd",defaultDate:"2000/01/01" });
	templateEdit.createWorkitemDialog();
	templateEdit.createTemplateNameDialog();
	$("#start_date").bind('change',templateEdit.changeStart_date);
	$("#end_date").bind('change',templateEdit.changeEnd_date);
	// 試験大分類リストの取得と表示
	templateEdit.getLargeItemList();
});

var templateEdit = templateEdit || {};


// 作業項目のダイアログ生成
templateEdit.createWorkitemDialog = function () {
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
					templateEdit.addItem();
					$(this).dialog('close');
				}
			},
			{
				text: "更新",
				class: "update-btn",
				click: function () {
					templateEdit.updateItem(true);
					$(this).dialog('close');
				}
			},
			{
				text: "削除",
				class: "delete-btn",
				click: function () {
					templateEdit.deleteItemConfirm();
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

// テンプレート保存用ダイアログ生成
templateEdit.createTemplateNameDialog = function () {
	$('#template_name_dialog').dialog({
		autoOpen: false,
		width: '600px',
		title: 'テンプレートの保存',
		closeOnEscape: false,
		modal: true,
		buttons: [
			{
				text: "追加",
				class: "save-btn",
				click: function () {
					// 保存処理
					GanttTemplate.newRow($("#template_cd_nf").val(), $("#template_name_nf").val(), $("#template_test_type_nf").val());
					$(this).dialog('close');
				}
			},
			{
				text: "更新",
				class: "update-btn",
				click: function () {
					// 更新処理
					templateEdit.updateTemplate();

					$(this).dialog('close');
				}
			},
			{
				text: "削除",
				class: "del-btn",
				click: function () {
					// 保存処理
					templateEdit.deleteTemplateConfirm();

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

// 作業項目ダイアログに値をセットする
templateEdit.setFormData = function (workitem) {
	// eventに渡されたデータをフォームにセットする
	$("#template_id").val(workitem.template_id);		// hidden項目
	$("#template_cd").val(workitem.template_cd);		// hidden項目
	$("#template_name").val(workitem.template_name);	// hidden項目
	$("#template_test_type").val(workitem.test_type);	// hidden項目
	$("#work_title").val(workitem.work_title);
	var sd = scheduleCommon.calcDateCount("2000/01/01",workitem.start_date);
	$("#start_date").val(sd);
	var ed = scheduleCommon.calcDateCount("2000/01/01",workitem.end_date);
	$("#end_date").val(ed);
	$("#start_date").attr('max',ed);
	$("#end_date").attr('min',sd);
	$("#priority_item_id").val("");
	$("#subsequent_item_id").val("");
	if (workitem.item_type == 0) {
		$("#item_type1").prop("checked", true);
	} else {
		$("#item_type2").prop("checked", true);
	}
};

// 作業項目ダイアログの表示
templateEdit.openDialog = function (event) {
	$("#start_date").attr('min',1);
	$("#end_date").attr('min',1);
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
	var template = $(target).data("template");
	templateEdit.setFormData(template);
	if (template.template_id != -1) {
		// 更新
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("enable");

	} else {
		// 追加
		$("#start_date").attr('max',365);
		$("#end_date").attr('max',365);
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("disable");
	}
	$("#workitem_dialog").dialog("open");
	return false;
};


// 作業項目の追加
templateEdit.addItem = function () {
	// formデータの取得
	var form = templateEdit.getFormData();
	templateEdit.exchangeDayCountToDateString(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_post', true);
	xhr.responseType = 'json';
	xhr.onload = templateEdit.onloadTemplateReq;
	xhr.send(form);
};
// 作業項目の更新
templateEdit.updateItem = function (refresh) {
	// formデータの取得
	var form = templateEdit.getFormData();
	templateEdit.exchangeDayCountToDateString(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_post', true);
	xhr.responseType = 'json';
	if (refresh) {
		xhr.onload = templateEdit.onloadTemplateReq;
	}
	xhr.send(form);
};
templateEdit.exchangeDayCountToDateString = function(form) {
	var sd = $("#start_date").val();
	if (sd == "") sd = 1; else sd = Number(sd);
	var start_date = scheduleCommon.addDate(new Date(2000,0,1,0,0,0,0),sd - 1);
	form.append("start_date_date",scheduleCommon.getDateString(start_date,"{0}/{1}/{2}"));
	var ed = $("#end_date").val();
	if (ed == "") ed = 1; else ed = Number(ed);
	var end_date = scheduleCommon.addDate(new Date(2000,0,1,0,0,0,0),ed - 1);
	form.append("end_date_date",scheduleCommon.getDateString(end_date,"{0}/{1}/{2}"));

};

// テンプレートの削除確認ダイアログ表示
templateEdit.deleteTemplateConfirm = function () {
	scheduleCommon.showConfirmDialog("#messageDlg", "テンプレートの削除", "このテンプレートを削除しますか？", templateEdit.deleteTemplate);
};
// 作業項目の削除確認ダイアログ表示
templateEdit.deleteItemConfirm = function () {
	scheduleCommon.showConfirmDialog("#messageDlg", "作業項目の削除", "この作業項目を削除しますか？", templateEdit.deleteItem);
};

// テンプレートの更新（名前の変更）
templateEdit.updateTemplate = function () {
	$("#template_cd").val($("#template_cd_nf").val());
	$('#template_name').val($("#template_name_nf").val());
	$('#template_test_type').val($("#template_test_type_nf").val());
	// formデータの取得
	var form = templateEdit.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_update', true);
	xhr.responseType = 'json';
	xhr.onload = templateEdit.onloadTemplateReq;
	xhr.send(form);
};

// テンプレートの削除
templateEdit.deleteTemplate = function () {
	$("#messageDlg").dialog("close");
	$('#template_cd').val($("#template_cd_nf").val());
	// formデータの取得
	var form = templateEdit.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_delete', true);
	xhr.responseType = 'json';
	xhr.onload = templateEdit.onloadTemplateReq;
	xhr.send(form);
};

// 作業項目の削除(削除フラグのセット）
templateEdit.deleteItem = function () {
	$("#messageDlg").dialog("close");
	// formデータの取得
	var form = templateEdit.getFormData();
	form.append('delete_check', '1'); // 削除フラグセット
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_post', true);
	xhr.responseType = 'json';
	xhr.onload = templateEdit.onloadTemplateReq;
	xhr.send(form);
};
// formデータの取得
templateEdit.getFormData = function () {
	var form = new FormData(document.querySelector("#templateForm"));
	return form;
};
// 追加、更新後のコールバック
templateEdit.onloadTemplateReq = function (e) {
	if (this.status == 200) {
		var workitem = this.response;
		// ガントチャート表示の更新処理
		templateEdit.GanttTemplateInit();
	}
};

// 初期化
templateEdit.GanttTemplateInit = function () {
	for(var i= 1;i <= 6;i++) {
		GanttTemplate.Init("ganttTemplate_" + i,"L0" + i);
	}
};

// テンプレートをDBに追加する
templateEdit.addTemplate = function (template) {
	$.ajax("/template_post", {
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify(template),
		contentType : 'application/json',
		success: templateEdit.onAddTemplate
	}
	);
};

templateEdit.onAddTemplate = function () {
};

templateEdit.openTemplateNameDialog = function (event) {
	$("#template_cd_nf").val("");
	$("#template_name_nf").val("");
	$("#template_test_type_nf").val("");
	if (event.target.className == "gt_workitem_button") {
		var template = $(event.target).data('template');
		$("#template_cd_nf").val(template.template_cd);
		$("#template_cd_nf").attr('readonly',true);
		$("#template_name_nf").val(template.template_name);
		$("#template_test_type_nf").val(template.test_type);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("enable");
	} else {
		var template = $(event.target).data('ganttdata');
		$("#template_cd_nf").attr('readonly',false);
		$("#template_test_type_nf").val(template.test_type);
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("disable");
	}
	$("#template_name_dialog").dialog("open");
};

// 試験大分類リストの取得リクエスト 2016.0209
templateEdit.getLargeItemList = function() {
	$.ajax("/large_item_list_get" , {
		type: 'GET',
		dataType: 'json',
		contentType : 'application/json',
		success: templateEdit.onGetLargeItemList
		});
};
// 試験大分類リストの取得リクエストレスポンス 20016.02.09
templateEdit.onGetLargeItemList = function(large_item_list) {
	$("#template_test_type_nf").empty();
	$.each(large_item_list.rows,function() {
		$("#template_test_type_nf").append($("<option value=" + this.item_cd + ">" + this.item_name + "</option>"));
	});
};

// 開始日の変更イベント
templateEdit.changeStart_date = function(event) {
	var sd = $("#start_date").val();
	var ed = $("#end_date").val();
	$("#end_date").attr("min",sd);
};
templateEdit.changeEnd_date = function(event) {
	var sd = $("#start_date").val();
	var ed = $("#end_date").val();
	$("#start_date").attr("max",ed);
};
