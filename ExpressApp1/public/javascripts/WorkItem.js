//
// ガントチャートに表示する項目の処理
//
$(function() {
	// 権限チェック
	workitemEdit.checkAuth();
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$( "#tabs" ).tabs();
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo("_ref");
					
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
	workitemEdit.createMessageDialog();
});

var workitemEdit = workitemEdit || {};

workitemEdit.currentWorkitem = null;	// 処理中のスケジュール情報

// 権限チェック
workitemEdit.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f11") {
			GanttTable.auth = auth.value;
		}
	}
};

// 作業項目のダイアログ生成
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

// テンプレート選択用ダイアログ生成
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

// テンプレート保存用ダイアログ生成
workitemEdit.createTemplateNameDialog = function () {
	$('#template_name_dialog').dialog({
		autoOpen: false,
		width: '600px',
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
					workitemEdit.saveTemplate($("#template_cd_nf").val(),$("#template_name_nf").val(), $("#entry_no_nf").val());
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
// メッセージ表示用ダイアログの生成
workitemEdit.createMessageDialog = function () {
	$('#message_dialog').dialog({
		autoOpen: false,
		width: 400,
		height: 180,
		title: 'メッセージ',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// 作業項目ダイアログに値をセットする
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

// 作業項目ダイアログの表示
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
		workitemEdit.selectTemplate(workitem.entry_no, workitem.template_cd);
	});
};

// 選択されたテンプレートを指定された案件の作業項目として追加する
workitemEdit.selectTemplate = function (entry_no, template_cd) {
	var entry = $.get('/entry_get/' + entry_no, {});
//	var template = $.get('/template_get/list/' + template_name + '/' + 2 + '?delete_check=' + 0, {});
	var template = $.get('/template_get_list/' + template_cd + '?delete_check=' + 0, {});
	$.when(entry,template)
	.done(function (entry_Response,template_response) {
		var temp = template_response[0];
		for (var i = 0; i < temp.length; i++) {
			// 案件の受注日を起点日とする
			var base_date = entry_Response[0].order_accepted_date;
			if ((base_date == null) || (base_date == "")) {
				// 受注日が未入力の場合、ガントチャートの開始日を起点日とする
				base_date = GanttTable.start_date;
			}

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
	$('#template_cd_nf').val("");
	$('#template_name_nf').val("");
	$('#entry_no_nf').val("");
	$('#template_name_nf').val(workitem.entry_title);
	$('#entry_no_nf').val(workitem.entry_no);
	workitemEdit.openTemplateNameDialog();
};

// 案件に登録されている項目をテンプレートとして保存する
workitemEdit.saveTemplate = function (template_cd, template_name, entry_no) {
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
			if ((base_date == null) || (base_date == "")) {
				// 受注日が未入力の場合
				base_date = scheduleCommon.getToday("{0}/{1}/{2}");
			}
			// 作業項目の開始日などの日付と起点の日の日数を求める
			var start_offset = scheduleCommon.calcDateCount(base_date, workitem.start_date) - 1;
			var end_offset = start_offset;
			if (workitem.end_date != null) {
				end_offset = scheduleCommon.calcDateCount(base_date, workitem.end_date) - 1;
			}
			// テンプレート化する時は起点の日を2000年1月1日とする
			var template = {
				template_id: -1, 
				template_cd: template_cd,
				template_name: template_name, 
				work_title: workitem.work_title , 
				start_date: "2000/01/01", 
				end_date: "2000/01/01",
				priority_item_id: 0,
				item_type: workitem.item_type
			};
			// 求めた各日数を起点の日に加算して日付とする
			var sd = scheduleCommon.addDate(scheduleCommon.dateStringToDate(template.start_date), start_offset);
			template.start_date_date = scheduleCommon.getDateString(sd, "{0}/{1}/{2}");
			var ed = scheduleCommon.addDate(scheduleCommon.dateStringToDate(template.end_date), end_offset);
			template.end_date_date = scheduleCommon.getDateString(ed, "{0}/{1}/{2}");
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
		$("#message").text("テンプレートに保存されました");
		$("#message_dialog").dialog("option", { title: "ガントチャート" });
		$("#message_dialog").dialog("open");
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
	workitemEdit.currentWorkitem = $(event.target).data('workitem');
	// 初期化
	$("#template_table").empty();
	// テーブルを作成してリストを表示する
	$("#template_table").append("<tr><th>テンプレート名</th><th>項目名</th><th>種別</th>");

	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/template_get_all?delete_check=' + 0, true);
	xhr.responseType = 'json';
	xhr.onload = workitemEdit.onloadTemplateReq;
	xhr.send();
	/**
	var template = $.get('/template_get_all?delete_check=' + 0, {});
	$.when(template)
	.done(function (template_response) {
		var temp = template_response;
		if (temp.length > 0) {
			// 同一テンプレート名毎の件数を取得する
			var prev_cd = temp[0].template_cd;
			var prev_name = temp[0].template_name;
			var name_count = [];
			var count = 0;
			for (var i = 0; i < temp.length; i++) {
				if (temp[i].template_cd != prev_cd) {
					// 名前と件数を保存する
					name_count.push({ cd:prev_cd, name: prev_name, count: count });
					prev_cd = temp[i].template_cd;
					prev_name = temp[i].template_name;
					count = 0;
				}
				count++;
			}
			// 名前と件数を保存する
			name_count.push({ cd:prev_cd, name: prev_name, count: count });
			// テーブル行を作成する
			var offset = 0;
			for (var j = 0; j < name_count.length; j++) {
				var cd = name_count[j].cd;
				var name = name_count[j].name;
				var count = name_count[j].count;
				var td_name = $("<td rowspan=" + count + ">" + name + "</td>");
				var sel_btn = $("<a class='template_select_button'>選択</a>");
				// 選択ボタン押下処理にバインド
				var workitem_wk = {entry_no:workitem.entry_no,template_cd:cd, template_name:name};
				$(sel_btn).data('workitem', workitem_wk);
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
	**/
};

workitemEdit.onloadTemplateReq = function(e) {
	if (this.status == 200) {
		var temp = this.response;
		if (temp.length > 0) {
			// 同一テンプレート名毎の件数を取得する
			var prev_cd = temp[0].template_cd;
			var prev_name = temp[0].template_name;
			var name_count = [];
			var count = 0;
			for (var i = 0; i < temp.length; i++) {
				if (temp[i].template_cd != prev_cd) {
					// 名前と件数を保存する
					name_count.push({ cd:prev_cd, name: prev_name, count: count });
					prev_cd = temp[i].template_cd;
					prev_name = temp[i].template_name;
					count = 0;
				}
				count++;
			}
			// 名前と件数を保存する
			name_count.push({ cd:prev_cd, name: prev_name, count: count });
			// テーブル行を作成する
			var offset = 0;
			for (var j = 0; j < name_count.length; j++) {
				var cd = name_count[j].cd;
				var name = name_count[j].name;
				var count = name_count[j].count;
				var td_name = $("<td rowspan=" + count + ">" + name + "</td>");
				var sel_btn = $("<a class='template_select_button'>選択</a>");
				// 選択ボタン押下処理にバインド
				var workitem_wk = {entry_no:workitemEdit.currentWorkitem.entry_no,template_cd:cd, template_name:name};
				$(sel_btn).data('workitem', workitem_wk);
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
	}
};

workitemEdit.openTemplateNameDialog = function (event) {
	$("#template_name_dialog").dialog("open");
};
// 案件入力用ダイアログの生成
workitemEdit.createEntryDialog = function () {
	$('#entry_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 900,
		title: '案件情報',
		closeOnEscape: false,
		modal: false,
		buttons: {
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// 案件情報の参照ダイアログ
workitemEdit.openEntryDialog = function (event) {
	var entry = event.data.entry;
	workitemEdit.requestEntryData(entry.entry_no);
	$("#entry_dialog").dialog("open");
};
// 案件データの読込み
workitemEdit.requestEntryData = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/entry_get/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = workitemEdit.onloadEntryReq;
	xhr.send();
};
// 案件データ取得リクエストのコールバック
workitemEdit.onloadEntryReq = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		// formに取得したデータを埋め込む
		workitemEdit.setEntryForm(entry);
		//$("#entryForm #entry_memo_ref").text(entry.entry_memo);		
		// 見積情報の取得
		workitemEdit.requestQuoteInfo(entry.entry_no, entry.test_large_class_cd, entry.consumption_tax);		
	}
};
workitemEdit.requestBillingTotal = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/billing_get_total/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = workitemEdit.onloadBillingTotalReq;
	xhr.send();
};
// 請求金額、入金額取得リクエストのコールバック
workitemEdit.onloadBillingTotalReq = function (e) {
	if (this.status == 200) {
		var billing = this.response;
		if (billing.amount_total != null) {
			$("#entryForm #entry_amount_billing").val(scheduleCommon.numFormatter(billing.amount_total,11));
		}
		if (billing.complete_total != null) {
			$("#entryForm #entry_amount_deposit").val(scheduleCommon.numFormatter(billing.complete_total,11));
		}
	}
};

// 受注確定になっている見積情報を取得する
workitemEdit.requestQuoteInfo = function(entry_no, large_item_cd, consumption_tax) {
	$.ajax({
		url: '/quote_specific_get_list_for_entryform/' + entry_no + '?large_item_cd=' + large_item_cd,
		cache: false,
		dataType: 'json',
		success: function (quote_list) {
			workitemEdit.setQuoteInfo(quote_list, consumption_tax);
			// 請求情報から請求金額、入金金額合計を取得して表示
			workitemEdit.requestBillingTotal(entry_no);	
		}
	});

};
workitemEdit.setQuoteInfo = function (quote_list, consumption_tax) {
	if (quote_list != null) {
		var total_price = 0;
		var rows = quote_list.rows;
		if (rows.length > 0) {
			$("#entryForm #quote_no").val(rows[0].quote_no);
			var list = "";
			for (var i = 0;i <  rows.length;i++) {
				list += rows[i].test_middle_class_name + "\n";
				total_price += Number(rows[i].price);
			}
			$("#entryForm #test_middle_class_list").text(list);
			tax = total_price * (consumption_tax / 100);
			$("#entryForm #entry_amount_price").val(scheduleCommon.numFormatter(total_price + tax,11));
		}
	}
};
// 案件データをフォームにセットする
workitemEdit.setEntryForm = function (entry) {
	$("#entryForm #entry_no").val(entry.entry_no);					// 案件No
	$("#entryForm #quote_no").val(entry.quote_no);					// 見積番号
	$("#entryForm #inquiry_date").val(entry.inquiry_date);			// 問合せ日
	$("#entryForm #entry_status").val(entry.entry_status);			// 案件ステータス
	$("#entryForm #sales_person_id").val(entry.sales_person_id);	// 案件ステータス
//	$("#quote_issue_date").val(entry.quote_issue_date); // 見積書発行日
	$("#entryForm #agent_cd").val(entry.agent_cd);					// 代理店コード
	$("#entryForm #agent_name").val(entry.agent_name);				// 代理店名
	$("#entryForm #client_cd").val(entry.client_cd);				// 得意先コード
	var name_1 = entry.client_name_1;
	var name_2 = entry.client_name_2;
	$("#entryForm #client_name").val(name_1 );								// 得意先名1
	$("#entryForm #client_division_cd").val(entry.client_division_cd);		// 所属部署CD
	$("#entryForm #client_division_name").val(entry.client_division_name);	// 所属部署名
	$("#entryForm #client_division_memo").val(entry.client_division_memo);	// 所属部署メモ
	$("#entryForm #client_person_id").val(entry.client_person_id);			// 担当者ID
	$("#entryForm #client_person_name").val(entry.client_person_name);		// 担当者名
	$("#entryForm #client_person_memo").val(entry.client_person_memo);		// 担当者メモ

	$("#entryForm #test_large_class_cd").val(entry.test_large_class_cd);		// 試験大分類CD
	$("#entryForm #test_large_class_name").val(entry.test_large_class_name);	// 試験大分類名
	$("#entryForm #test_middle_class_cd").val(entry.test_middle_class_cd);		// 試験中分類CD
	$("#entryForm #test_middle_class_name").val(entry.test_middle_class_name);	// 試験中分類名
	$("#entryForm #entry_title").val(entry.entry_title);						// 案件名
	
	$("#entryForm #order_accepted_date").val(entry.order_accepted_date);	// 受注日付
	$("#entryForm #order_accept_check").val(entry.order_accept_check);		// 仮受注日チェック
	$("#entryForm #acounting_period_no").val(entry.acounting_period_no);	// 会計期No
	$("#entryForm #order_type").val(entry.order_type);						// 受託区分
	$("#entryForm #contract_type").val(entry.contract_type);				// 契約区分
	$("#entryForm #outsourcing_cd").val(entry.outsourcing_cd);				// 委託先CD
	$("#entryForm #outsourcing_name").val(entry.outsourcing_name);			// 委託先CD
	$("#entryForm #entry_amount_price_notax").val(entry.entry_amount_price_notax);		// 案件合計金額（税抜）
	$("#entryForm #entry_amount_tax").val(entry.entry_amount_tax);			// 消費税額
	$("#entryForm #entry_amount_price").val(entry.entry_amount_price);		// 案件合計金額（税込）
	$("#entryForm #entry_amount_billing").val(entry.entry_amount_billing);	// 案件請求合計金額
	$("#entryForm #entry_amount_deposit").val(entry.entry_amount_deposit); // 案件入金合計金額
	$("#entryForm #test_person_id").val(entry.test_person_id);				// 試験担当者ID
	
	$("#entryForm #report_limit_date").val(entry.report_limit_date);		// 報告書提出期限
	$("#entryForm #report_submit_date").val(entry.report_submit_date);		// 報告書提出日
	$("#entryForm #prompt_report_limit_date_1").val(entry.prompt_report_limit_date_1);		// 速報提出期限1
	$("#entryForm #prompt_report_submit_date_1").val(entry.prompt_report_submit_date_1);	// 速報提出日1
	$("#entryForm #prompt_report_limit_date_2").val(entry.prompt_report_limit_date_2);		// 速報提出期限2
	$("#entryForm #prompt_report_submit_date_2").val(entry.prompt_report_submit_date_2);	// 速報提出日2
	$("#entryForm #entry_consumption_tax").val(entry.consumption_tax);		// 消費税率
	$("#entryForm #entry_memo").val(entry.entry_memo);						// 備考
	if (entry.delete_check == 1) {
		$("#entryForm #delete_check").prop("checked", true);				// 削除フラグ
	} else {
		$("#entryForm #delete_check").prop("checked", false);				// 削除フラグ
	}
	$("#entryForm #delete_reason").val(entry.delete_reason);				// 削除理由
	$("#entryForm #input_check_date").val(entry.input_check_date);			// 入力日
	if (entry.input_check == 1) {
		$("#entryForm #input_check").prop("checked",true);					// 入力完了チェック
	} else {
		$("#entryForm #input_check").prop("checked", false);				// 入力完了チェック
	}
	$("#entryForm #input_operator_id").val(entry.input_operator_id);		// 入力者ID
	$("#entryForm #confirm_check_date").val(entry.confirm_check_date);		// 確認日
	if (entry.confirm_check == 1) {
		$("#entryForm #confirm_check").prop("checked",true);				// 確認完了チェック
	} else {
		$("#entryForm #confirm_check").prop("checked", false);				// 確認完了チェック
	}
	$("#entryForm #confirm_operator_id").val(entry.confirm_operator_id);	// 確認者ID
	$("#entryForm #created").val(entry.created);							// 作成日
	$("#entryForm #created_id").val(entry.created_id);						// 作成者ID
	$("#entryForm #updated").val(entry.updated);							// 更新日
	$("#entryForm #updated_id").val(entry.updated_id);						// 更新者ID
};
workitemEdit.clearEntry = function () {
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	var entry = {} ;
	entry.entry_no = "";			// 案件No
	entry.entry_title = "";			// 案件名
	entry.inquiry_date = today;		// 問合せ日
	entry.entry_status = "01";		// 案件ステータス
	entry.sales_person_id = "";		// 営業担当者ID
	entry.quote_no = "";			// 見積番号
	entry.quote_issue_date = "";	// 見積書発行日
	entry.agent_cd = "";			// 代理店コード
	entry.agent_name = "";			// 代理店名
	entry.client_cd = "";			// 得意先コード
	entry.client_name_1 = "";		// 得意先名
	entry.client_name_2 = "";		// 得意先名
	entry.client_address_1 = "";	// 住所
	entry.client_address_2 = "";	// 住所
	entry.client_division_cd = "";	// 担当者所属部署
	entry.client_division_name = "";// 担当者所属部署
	entry.client_person_id = "";	// 担当者
	entry.client_person_name = "";	// 担当者
	entry.order_accepted_date = ""; // 受注日付
	entry.order_accept_check = 0;	// 仮受注日チェック
	entry.acounting_period_no = 1;	// 会計期No
	entry.order_type = 0;			// 受託区分
	entry.contract_type = 1;		// 契約区分
	entry.outsourcing_cd = "";		// 委託先CD
	entry.entry_amount_price_notax = 0;	// 案件合計金額（税抜）
	entry.entry_amount_tax = 0;		// 消費税額
	entry.entry_amount_price = 0;	// 案件合計金額（税込）
	entry.entry_amount_billing = 0;	// 案件請求合計金額
	entry.entry_amount_deposit = 0; // 案件入金合計金額
	entry.test_person_id = "";		// 試験担当者ID
	entry.report_limit_date = "";				// 報告書提出期限
	entry.report_submit_date = "";				// 報告書提出日
	entry.prompt_report_limit_date_1 = "";		// 速報提出期限1
	entry.prompt_report_submit_date_1 = "";		// 速報提出日1
	entry.prompt_report_limit_date_2 = "";		// 速報提出期限2
	entry.prompt_report_submit_date_2 = "";		// 速報提出日2
	entry.consumption_tax = quoteInfo.drc_info.consumption_tax;	// 消費税率
	entry.entry_memo = "";			// メモ
	entry.delete_check = 0;			// 削除フラグ
	entry.delete_reason = "";		// 削除理由
	entry.input_check_date = today;	// 入力日
	entry.input_check = 0;			// 入力完了チェック
	entry.input_operator_id = $.cookie('userid');	// 入力者ID
	entry.confirm_check_date = "";	// 確認日
	entry.confirm_check = 0;		// 確認完了チェック
	entry.confirm_operator_id = ""; // 確認者ID
	entry.created = "";				// 作成日
	entry.created_id = "";			// 作成者ID
	entry.updated = "";				// 更新日
	entry.updated_id = "";			// 更新者ID
	return entry;
};
