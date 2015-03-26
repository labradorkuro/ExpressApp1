//
// テンプレートの追加、編集処理
//
$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
					
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	GanttTemplate.start_date = today;
	GanttTemplate.disp_span = 1;
	templateEdit.GanttTemplateInit();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd",defaultDate:"2000/01/01" });
	templateEdit.createWorkitemDialog();
	templateEdit.createTemplateNameDialog();
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
					GanttTemplate.newRow($("#template_cd_nf").val(), $("#template_name_nf").val());
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
	$("#work_title").val(workitem.work_title);
	$("#start_date").val(workitem.start_date);
	$("#end_date").val(workitem.end_date);
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
templateEdit.addItem = function () {
	// formデータの取得
	var form = templateEdit.getFormData();
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
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_post', true);
	xhr.responseType = 'json';
	if (refresh) {
		xhr.onload = templateEdit.onloadTemplateReq;
	}
	xhr.send(form);
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
	// formデータの取得
	var form = templateEdit.getFormData();
	form.append('template_cd',$("#template_cd_nf").val());
	form.append('template_name',$("#template_name_nf").val());
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/template_update', true);
	xhr.responseType = 'json';
	xhr.onload = templateEdit.onloadTemplateReq;
	xhr.send(form);
};

// テンプレートの削除
templateEdit.deleteTemplate = function () {
	$("#messageDlg").dialog("close");
	// formデータの取得
	var form = templateEdit.getFormData();
	form.append('template_cd',$("#template_cd_nf").val());
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
	GanttTemplate.Init("ganttTemplate");
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
	if (event.target.className == "gt_workitem_button") {
		var template = $(event.target).data('template');
		$("#template_cd_nf").val(template.template_cd);
		$("#template_cd_nf").attr('readonly',true);
		$("#template_name_nf").val(template.template_name);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable"); 
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("enable");
	} else {
		$("#template_cd_nf").attr('readonly',false);
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable"); 
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("disable");
	}
	$("#template_name_dialog").dialog("open");
};


