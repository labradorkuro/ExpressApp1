//
// 請求情報に関する処理クラス
//
var billingList = billingList || {};

billingList.printCanvas = null;
billingList.currentEntry = null;
billingList.currentBilling = null;
billingList.status = "add"; // or "edit" 追加でフォームを開いたか、編集で開いたか（デフォルトの税計算をするかしないか）
billingList.billing_date = "";	// 納品日
billingList.current_seikyusho_no = "";

// イベント処理登録
billingList.eventBind = function() {
	// 税抜請求金額の変更
	$("#pay_amount").bind("change",billingList.calc_amount);
	// 消費税の変更
	$("#pay_amount_tax").bind("change",billingList.calc_amount);
	$("#calc_tax_button").bind("click",billingList.calc_tax);
	// 入金予定日計算ボタン
	$("#nyukin_yotei_button").bind("click",billingList.calc_nyukin_yotei_date);
	// 金額の変更
	$("#pay_complete").bind("change",billingList.calc_kingaku);
	$("#furikomi_ryo").bind("change",billingList.calc_kingaku);
	// 請求可ボタン
	$("#pay_result_1").bind("click",billingList.checked_pay_result);
};

// 請求区分が請求待ちから請求可になった時、その日の日付を納品日に設定する
billingList.checked_pay_result = function() {
	if (billingList.currentBilling.pay_result == "請求待ち") {
		var today = scheduleCommon.getToday("{0}/{1}/{2}");
		$("#nouhin_date").val(today);
	}
};
// 入金予定日の計算
billingList.calc_nyukin_yotei_date = function() {
	// 請求先の支払いサイト情報を取得する
	var sight_info = {client_cd:"",shimebi:"",sight_id:0,kyujitsu_setting:0,memo:""};
	// 請求先の選択状態を取得する
	var billing_kind = 0;
	if ($("#billing_kind_1").prop("checked")) {
		billing_kind = 0;
	}
	else if ($("#billing_kind_2").prop("checked")) {
		billing_kind = 1;
	}
	if (billing_kind == 0) {
		// クライアント選択時
		nyukinYotei.getSightInfo(billingList.currentEntry.currentEntry.client_cd).then(function(data){
			if (data != "") {
				sight_info = data;
				billingList.set_nyukin_yotei_date(sight_info);
			} else {
				$("#message").text("顧客の支払いサイト情報がありません。");
				$("#message_dialog").dialog("option", { title: "支払いサイト情報" });
				$("#message_dialog").dialog("open");
				return;
			}
		});
	} else {
		nyukinYotei.getSightInfo(billingList.currentEntry.currentEntry.agent_cd).then(function(data){
			if (data != "") {
				sight_info = data;
				billingList.set_nyukin_yotei_date(sight_info);
			} else {
				$("#message").text("顧客の支払いサイト情報がありません。");
				$("#message_dialog").dialog("option", { title: "支払いサイト情報" });
				$("#message_dialog").dialog("open");
				return;
			}
		});		
	}
}

billingList.set_nyukin_yotei_date = function(sight_info) {
	// 請求日と締日を参照して、支払年月を決定する
	var seikyu_date = $("#pay_planning_date").val();
	if (seikyu_date != "") {
		var shiharaibi = nyukinYotei.getShiharaibi(seikyu_date, sight_info);
		console.log("nyukinYotei.getShiharaibi:" + shiharaibi)
		// 入金予定日が営業日か判定し、休日の場合は前後に移動する
		// 土日チェック
		var date = nyukinYotei.checkHoliday_ss(scheduleCommon.dateStringToDate(shiharaibi),sight_info.kyujitsu_setting);
		console.log("nyukinYotei.checkHoliday_ss:" + date)
		// 休日マスタ検索
		nyukinYotei.checkHoliday_db(date).then(function(holiday){
			if (holiday.length) {
	//					var date = new Date();
				if (sight_info.kyujitsu_setting == 0) {
					date = new Date(holiday[0].start_date);
					date.setDate(date.getDate() - 1);
				} else {
					date = new Date(holiday[0].end_date);
					date.setDate(date.getDate() + 1);
				}
			}
			// 入金予定日を決定し、表示する
			$("#nyukin_yotei_date").val(scheduleCommon.getDateString(date,'{0}/{1}/{2}'));
		});	
	} else {
		$("#message").text("請求予定日を入力してください。");
		$("#message_dialog").dialog("option", { title: "請求情報" });
		$("#message_dialog").dialog("open");
	}
}

// 消費税の計算実行(ボタン押下）
billingList.calc_tax = function() {
	if (billingList.inputCheck()) {
		var amount = Number($("#pay_amount").val());
		var tax = Number($("#pay_amount_tax").val());
		// 請求情報を追加する場合、デフォルトの消費税計算をする
		tax = billingList.currentEntry.currentEntry.consumption_tax;
		tax = amount * (tax / 100);
		$("#pay_amount_tax").val(tax);
		var total = amount + tax;
		$("#pay_amount_total").val(total);
	}
};

// 請求金額合計の計算
billingList.calc_amount = function() {
	if (billingList.inputCheck()) {
		var amount = Number($("#pay_amount").val());
		var tax = Number($("#pay_amount_tax").val());
//	if (billingList.status == "add") {
//		// 請求情報を追加する場合、デフォルトの消費税計算をする
//		tax = billingList.currentEntry.currentEntry.consumption_tax;
//		tax = amount * (tax / 100);
//		$("#pay_amount_tax").val(tax);
//	}
		var total = amount + tax;
		$("#pay_amount_total").val(total);
	}
};
// 金額の計算
billingList.calc_kingaku = function() {
	if (billingList.inputCheck()) {
		var amount = Number($("#pay_complete").val());
		var furikomi_ryo = Number($("#furikomi_ryo").val());
		var total = amount + furikomi_ryo;
		$("#nyukin_total").val(total);
		// 請求残金額の計算と表示
		billingList.calcAmountZan(billingList.currentEntry.currentEntry.entry_amount_price,total);

	}
};

// 請求情報リストダイアログの生成
billingList.createBillingListDialog = function () {
	$('#billing_list_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 600,
		title: '請求情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 請求情報編集ダイアログの生成
billingList.createBillingFormDialog = function () {
	$('#billing_form_dialog').dialog({
		autoOpen: false,
		width: 960,
		height: 900,
		title: '請求情報の編集',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"請求書作成": function () {
				billingList.editPrintBilling();
//				if (billingList.printBillingInfo()) {
//					$(this).dialog('close');
//				}
			},
			"追加": function () {
				if (billingList.saveBillingInfo()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (billingList.saveBillingInfo()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 請求書編集画面
billingList.createBillingPrintEditDialog = function () {
	$('#billing_print_edit_dialog').dialog({
		autoOpen: false,
		width: 960,
		height: 600,
		title: '請求書編集',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"印刷プレビュー": function () {
				if (billingList.printBillingInfo()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 請求書印刷プレビュー画面
billingList.createBillingPrintPreviewDialog = function () {
	$('#billing_print_preview_dialog').dialog({
		autoOpen: false,
		width: 980,
		height: 800,
		title: '請求書印刷プレビュー',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"印刷": function () {
				billingList.saveBillingSVGFile();
				$(this).dialog('close');
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

// 請求情報リストの生成
billingList.createBillingListGrid = function () {
	$("#billing_delete_check_disp").bind('change', billingList.changeOption);
	// checkboxの状態取得
	var delchk = billingList.getBillingDeleteCheckDispCheck();
	var entry_no = $("#billing_entry_no").val();
	// 請求情報リストのグリッド
	jQuery("#billing_info_list").jqGrid({
		url: '/billing_info_get?entry_no=' + entry_no + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','請求番号serial','請求番号','請求書NO','納品日','請求日', '入金予定日','税抜請求金額'
			,'消費税','請求金額合計','入金額', '入金日','請求区分','請求先区分'
			,'','クライアント名','','クライアント部署','','','','','','クライアント担当者','クライアント情報','備考'
			,'','代理店名','','代理店部署','','','','','','代理店担当者','代理店情報','代理店備考'
			,'','その他名','','その他部署','','その他担当者','その他情報','その他備考'
			,'作成日','作成者','更新日','更新者','削除フラグ','','','','請求書備考'],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'billing_no', index: 'billing_no', hidden:true },
			{ name: 'billing_number', index: 'billing_number', width: 80, align: "center" },
			{ name: 'seikyusho_no', index: 'seikyusho_no', width: 120, align: "center" },
			{ name: 'nouhin_date', index: 'nouhin_date', width: 80, align: "center" },
			{ name: 'pay_planning_date', index: 'pay_planning_date', width: 80, align: "center" },
			{ name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 100, align: "center" },
			{ name: 'pay_amount', index: 'pay_amount', width: 120, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_amount_tax', index: 'pay_amount_tax', width: 80, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_amount_total', index: 'pay_amount_total', width: 120, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_complete', index: 'pay_complete', width: 80, align: "right" },
			{ name: 'pay_complete_date', index: 'pay_complete_date', width: 80, align: "center" },
			{ name: 'pay_result', index: 'pay_result', width: 80, align: "center" ,formatter:scheduleCommon.pay_resultFormatter},
			{ name: 'billing_kind', index: 'billing_kind', width: 100 , align: "center", formatter:scheduleCommon.billing_kindFormatter},
//			{ name: 'kentai', index: 'kentai', width: 200 , align: "center" },
			{ name: 'client_cd', index: '', hidden:true },
			{ name: 'client_name', index: 'client_name', width: 200 , align: "center" },
			{ name: 'client_division_cd', index: '', hidden:true },
			{ name: 'client_division_name', index: 'client_division_name', width: 200 , align: "center" },
			{ name: 'client_address_1', index: '', hidden:true },
			{ name: 'client_address_2', index: '', hidden:true },
			{ name: 'client_tel_no', index: '', hidden:true },
			{ name: 'client_fax_no', index: '', hidden:true },
			{ name: 'client_person_id', index: '', hidden:true },
			{ name: 'client_person_name', index: 'client_person_name', width: 120 , align: "center" },
			{ name: 'client_info', hidden:true},
			{ name: 'memo', index: 'memo', width: 100, align: "center" },
			{ name: 'agent_cd', index: '', hidden:true },
			{ name: 'agent_name', index: 'agent_name', width: 200 , align: "center" },
			{ name: 'agent_division_cd', index: '', hidden:true },
			{ name: 'agent_division_name', index: 'agent_division_name', width: 200 , align: "center" },
			{ name: 'agent_address_1', index: '', hidden:true },
			{ name: 'agent_address_2', index: '', hidden:true },
			{ name: 'agent_tel_no', index: '', hidden:true },
			{ name: 'agent_fax_no', index: '', hidden:true },
			{ name: 'agent_person_id', index: '', hidden:true },
			{ name: 'agent_person_name', index: 'agent_person_name', width: 120 , align: "center" },
			{ name: 'agent_info', hidden:true},
			{ name: 'agent_memo', index: 'agent_memo', width: 100, align: "center" },
			{ name: 'etc_cd', index: '', hidden:true },
			{ name: 'etc_name', index: 'etc_name', width: 200 , align: "center" },
			{ name: 'etc_division_cd', index: '', hidden:true },
			{ name: 'etc_division_name', index: 'etc_division_name', width: 200 , align: "center" },
			{ name: 'etc_person_id', index: '', hidden:true },
			{ name: 'etc_person_name', index: 'etc_person_name', width: 120 , align: "center" },
			{ name: 'etc_info', hidden:true},
			{ name: 'etc_memo', index: 'etc_memo', width: 100, align: "center" },
			{ name: 'created', index: 'created', width: 120 }, // 作成日
			{ name: 'created_id', index: 'created_id', width: 120 }, // 作成者ID
			{ name: 'updated', index: 'updated', width: 120 }, // 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },			// 更新者ID
			{ name: 'delete_check', index: '', hidden:true },
			{ name: 'furikomi_ryo', index:'', hidden:true},
			{ name: 'nyukin_total', index:'', hidden:true},
			{ name: 'nyukin_yotei_p', index:'', hidden:true},
			{ name: 'seikyusho_memo', index:'', hidden:true}
		],
		height: "230px",
		//width:"800",
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10],
		pager: '#billing_info_list_pager',
		sortname: 'billing_number',
		viewrecords: true,
		sortorder: "asc",
		caption: "請求情報",
		onSelectRow: billingList.onSelectBillingList,
		loadComplete:billingList.loadComplete
	});
	jQuery("#billing_info_list").jqGrid('navGrid', '#billing_info_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
billingList.loadComplete = function(data) {
		$("#edit_billing").css("display","none");
}
// 請求先選択イベント
billingList.onSelectBillingList = function (rowid) {
	billingList.currentBilling = $("#billing_info_list").getRowData(rowid);
	if (entryList.auth_entry_edit == 2) {
		$("#edit_billing").css("display","inline");
	} else {
		$("#edit_billing").css("display","none");
	}
};
// 請求情報リストダイアログの表示
billingList.openBillingListDialog = function (event) {
	billingList.currentEntry = event.data.entryList;					// 選択中の案件情報
	$("#billing_entry_no").val(event.data.entryList.currentEntryNo);
	$("#kentai").val(event.data.entryList.currentEntry.kentai_name);
	$("#billing_info_list").GridUnload();
	billingList.createBillingListGrid();
	if (entryList.auth_entry_add == 2) {
		$("#add_billing").css("display","inline");
	} else {
		$("#add_billing").css("display","none");
	}

	$("#billing_list_dialog").dialog("open");
};

// 請求情報編集用ダイアログの表示
billingList.openBillingFormDialog = function (event) {
	// フォームをクリアする
	billingList.clearPayResult();	// 請求区分のチェックをクリアする
	var billing = billingList.clearBilling();
	billingList.setBillingForm(billing);
	if ($(event.target).attr('id') == 'edit_billing') {
		// 編集ボタンから開いた場合
		billingList.openEditDialog();
	} else {
		// 追加ボタンから開いた場合
		// 請求先情報に表示する内容を取得する
		var client_info = billingList.getEntryClientInfo(billingList.currentEntry.currentEntry,0);
		var agent_info = billingList.getEntryClientInfo(billingList.currentEntry.currentEntry,1);
		billingList.openAddDialog(client_info,agent_info);
	}
	// 請求金額合計を取得する
	billingList.requestBillingTotal(billingList.currentEntry.currentEntry.entry_no);
};

// 編集用にダイアログを表示する
billingList.openEditDialog = function() {
	billingList.status = "edit";
	//billingList.currentBilling.client_info = client_info;
	var billing = billingList.currentBilling;
	billing.pay_amount = billing.pay_amount.trim().replace(/,/g,'');
	billing.pay_amount_tax = billing.pay_amount_tax.trim().replace(/,/g,'');
	billing.pay_amount_total = billing.pay_amount_total.trim().replace(/,/g,'');
	billingList.setBillingForm(billing);
	$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
	// 権限チェック
	if (entryList.auth_entry_edit == 2) {
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('更新')").button("diable");
	}
};

// 追加用にダイアログを表示する
billingList.openAddDialog = function(client_info,agent_info) {
	billingList.status = "add";
	var billing = billingList.clearBilling();
	// 選択中の案件情報から得意先情報をコピーする（デフォルト設定として）
	billing = billingList.setDefaultClientData(billing);
	billing.client_info = client_info;
	billing.agent_info = agent_info;
	billingList.setBillingForm(billing);
	// 権限チェック
	if (entryList.auth_entry_add == 2) {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
	}
	$(".ui-dialog-buttonpane button:contains('更新')").button("disable");

}

// 請求書編集ダイアログの表示
billingList.openBillingPrintEditDialog = function (event) {

	$("#billing_print_edit_dialog").dialog("open");
};
// 請求書プレビューダイアログの表示
billingList.openBillingPrintPreviewDialog = function (event) {

	$("#billing_print_preview_dialog").dialog("open");
};


// 選択中の案件情報から得意先情報をコピーする（デフォルト設定として）
billingList.setDefaultClientData = function(billing) {
	billing.client_cd = billingList.currentEntry.currentEntry.client_cd;
	billing.client_name = billingList.currentEntry.currentEntry.client_name_1;
	billing.client_division_cd = billingList.currentEntry.currentEntry.client_division_cd;
	billing.client_division_name = billingList.currentEntry.currentEntry.client_division_name;
	billing.client_person_id = billingList.currentEntry.currentEntry.client_person_id;
	billing.client_person_name = billingList.currentEntry.currentEntry.client_person_name;

	billing.agent_cd = billingList.currentEntry.currentEntry.agent_cd;
	billing.agent_name = billingList.currentEntry.currentEntry.agent_name_1;
	billing.agent_division_cd = billingList.currentEntry.currentEntry.agent_division_cd;
	billing.agent_division_name = billingList.currentEntry.currentEntry.agent_division_name;
	billing.agent_person_id = billingList.currentEntry.currentEntry.agent_person_id;
	billing.agent_person_name = billingList.currentEntry.currentEntry.agent_person_name;
	return billing;
}
// 案件情報から請求先情報を取得
// kind:0 クライアント情報、kind:1 代理店情報
billingList.getEntryClientInfo = function(client,kind) {
	var zipcode = billingList.getZipcode_for_entry(client,kind);
	var address1 = billingList.getAddress1_for_entry(client,kind);
	var address2 = billingList.getAddress2_for_entry(client,kind);
	var tel = billingList.getTel_for_entry(client,kind);
	var fax = billingList.getFax_for_entry(client,kind);
	var client_info = "〒 " + zipcode + "\n住所1 : " + address1 + " \n住所2 : " + address2
					+ " \ntel : " + tel + " \nfax : " + fax
	return client_info;
}
// 顧客マスタから請求先情報を取得
billingList.getClientInfo = function(client,division) {
	var zipcode = billingList.getZipcode_for_client(client,division);
	var address1 = billingList.getAddress1_for_client(client,division);
	var address2 = billingList.getAddress2_for_client(client,division);
	var tel = billingList.getTel_for_client(client,division);
	var fax = billingList.getFax_for_client(client,division);
	var client_info = "〒 " + zipcode + "\n住所1 : " + address1 + " \n住所2 : " + address2
					+ " \ntel : " + tel + " \nfax : " + fax
	return client_info;
}

// 郵便番号取得（案件情報から取得）
// kind:0 クライアント情報、kind:1 代理店情報
billingList.getZipcode_for_entry = function(client,kind) {
	var zipcode = "";
	if (kind == 0) {
		if ((client.client_zipcode != null) && (client.client_zipcode != "")) {
			zipcode = client.client_zipcode;
		}
		if ((client.client_division_zipcode != null) && (client.client_division_zipcode != "")) {
			zipcode = client.client_division_zipcode;
		}	
	} else if (kind == 1) {
		if ((client.agent_zipcode != null) && (client.agent_zipcode != "")) {
			zipcode = client.agent_zipcode;
		}
		if ((client.agent_division_zipcode != null) && (client.agent_division_zipcode != "")) {
			zipcode = client.agent_division_zipcode;
		}
	}
	return zipcode;
}

// 郵便番号取得（顧客マスタから取得）
billingList.getZipcode_for_client = function(client,division) {
	var zipcode = "";
	if ((client.client_zipcode != null) && (client.client_zipcode != "")) {
		zipcode = client.client_zipcode;
	}
	if ((division.client_division_zipcode != null) && (division.client_division_zipcode != "")) {
		zipcode = division.client_division_zipcode;
	}
	return zipcode;
}

// 住所１取得（案件情報から取得）
// kind:0 クライアント情報、kind:1 代理店情報
billingList.getAddress1_for_entry = function(client,kind) {
	var address1 = "";
	if (kind == 0) {
		if ((client.client_address_1 != null) && (client.client_address_1 != "")) {
			address1 = client.client_address_1;
		}
		if ((client.client_division_address_1 != null) && (client.client_division_address_1 != "")) {
			address1 = client.client_division_address_1;
		}	
	} else if (kind == 1) {
		if ((client.agent_address_1 != null) && (client.agent_address_1 != "")) {
			address1 = client.agent_address_1;
		}
		if ((client.agent_division_address_1 != null) && (client.agent_division_address_1 != "")) {
			address1 = client.agent_division_address_1;
		}
		}
	return address1;
}

// 住所１取得（顧客マスタから取得）
billingList.getAddress1_for_client = function(client,division) {
	var address1 = "";
	if ((client.address_1 != null) && (client.address_1 != "")) {
		address1 = client.address_1;
	}
	if ((division.address_1 != null) && (division.address_1 != "")) {
		address1 = division.address_1;
	}
	return address1;
}

// 住所2取得(案件情報から取得)
// kind:0 クライアント情報、kind:1 代理店情報
billingList.getAddress2_for_entry = function(client,kind) {
	var address2 = "";
	if (kind == 0) {
		if ((client.client_address_2 != null) && (client.client_address_2 != "")) {
			address2 = client.client_address_2;
		}
		if ((client.client_division_address_2 != null) && (client.client_division_address_2 != "")) {
			address2 = client.client_division_address_2;
		}
	} else if (kind == 1) {
		if ((client.agent_address_2 != null) && (client.agent_address_2 != "")) {
			address2 = client.agent_address_2;
		}
		if ((client.agent_division_address_2 != null) && (client.agent_division_address_2 != "")) {
			address2 = client.agent_division_address_2;
		}
	}
	return address2;
}
// 住所2取得(顧客マスタから取得)
billingList.getAddress2_for_client = function(client,division) {
	var address2 = "";
	if ((client.address_2 != null) && (client.address_2 != "")) {
		address2 = client.address_2;
	}
	if ((division.address_2 != null) && (division.address_2 != "")) {
		address2 = division.address_2;
	}
	return address2;
}

// 電話番号取得(案件情報から取得)
// kind:0 クライアント情報、kind:1 代理店情報
billingList.getTel_for_entry = function(client, kind) {
	var tel = "";
	if (kind == 0) {
		if ((client.client_tel_no != null) && (client.client_tel_no != "")) {
			tel = client.client_tel_no;
		}
		if ((client.client_division_tel_no != null) && (client.client_division_tel_no != "")) {
			tel = client.client_division_tel_no;
		}
	} else if (kind == 1) {
		if ((client.agent_tel_no != null) && (client.agent_tel_no != "")) {
			tel = client.agent_tel_no;
		}
		if ((client.agent_division_tel_no != null) && (client.agent_division_tel_no != "")) {
			tel = client.agent_division_tel_no;
		}
	}
	return tel;
}
// 電話番号取得(顧客マスタから取得)
billingList.getTel_for_client = function(client,division) {
	var tel = "";
	if ((client.tel_no != null) && (client.tel_no != "")) {
		tel = client.tel_no;
	}
	if ((division.tel_no != null) && (division.tel_no != "")) {
		tel = division.tel_no;
	}
	return tel;
}

// FAX番号取得(案件情報から取得)
// kind:0 クライアント情報、kind:1 代理店情報
billingList.getFax_for_entry = function(client,kind) {
	var fax = "";
	if (kind == 0) {
		if ((client.client_fax_no != null) && (client.client_fax_no != "")) {
			fax = client.client_fax_no;
		}
		if ((client.client_division_fax_no != null) && (client.client_division_fax_no != "")) {
			fax = client.client_division_fax_no;
		}
	} else if (kind == 1) {
		if ((client.agent_fax_no != null) && (client.agent_fax_no != "")) {
			fax = client.agent_fax_no;
		}
		if ((client.agent_division_fax_no != null) && (client.agent_division_fax_no != "")) {
			fax = client.agent_division_fax_no;
		}
	}
	return fax;
}
// FAX番号取得(顧客マスタから取得)
billingList.getFax_for_client = function(client,division) {
	var fax = "";
	if ((client.fax_no != null) && (client.fax_no != "")) {
		fax = client.fax_no;
	}
	if ((division.fax_no != null) && (division.fax_no != "")) {
		fax = division.fax_no;
	}
	return fax;
}

// 請求情報のクリア
billingList.clearBilling = function() {
	var billing = {
			billing_no:'',
			billing_number:'',
			nouhin_date:'',
			pay_planning_date:'',
			nyukin_yotei_date:'',
			pay_complete_date:'',
			pay_amount:0,
			pay_amount_tax:0,
			pay_amount_total:0,
			pay_complete:0,
			pay_result:"請求待ち",
			memo:'',
			billing_kind:"クライアント",
			client_cd:'',
			client_name:'',
			client_division_cd:'',
			client_division_name:'',
			client_person_id:'',
			client_person_name:'',
			client_info: '',
			agent_cd:'',
			agent_name:'',
			agent_division_cd:'',
			agent_division_name:'',
			agent_person_id:'',
			agent_person_name:'',
			agent_info: '',
			agent_memo:'',
			etc_cd:'',
			etc_name:'',
			etc_division_cd:'',
			etc_division_name:'',
			etc_person_id:'',
			etc_person_name:'',
			etc_info: '',
			etc_memo:'',
			furikomi_ryo:0,
			nyukin_total:0,
			nyukin_yotei_p:"false",
			delete_check:0,
			seikyusho_no:'',
			seikyusho_memo:''
	};
	return billing;
};
billingList.clearPayResult = function() {
	$("#pay_result_0").prop("checked",true);
	$("#pay_result_1").prop("checked",false);
	$("#pay_result_2").prop("checked",false);
	$("#pay_result_3").prop("checked",false);
};
// 請求情報をフォームにセットする
billingList.setBillingForm = function(billing) {
	$("#billing_no").val(billing.billing_no);
	$("#billing_number").val(billing.billing_number);
	$("#seikyusho_no").val(billing.seikyusho_no);
	$("#nouhin_date").val(billing.nouhin_date);
	$("#pay_planning_date").val(billing.pay_planning_date);
	$("#nyukin_yotei_date").val(billing.nyukin_yotei_date);
	$("#pay_complete_date").val(billing.pay_complete_date);
	$("#pay_amount").val(billing.pay_amount);
	$("#pay_amount_tax").val(billing.pay_amount_tax);
	$("#pay_amount_total").val(billing.pay_amount_total);
	$("#pay_complete").val(billing.pay_complete);
	$("#furikomi_ryo").val(billing.furikomi_ryo);
	$("#nyukin_total").val(billing.nyukin_total);
//	$("#pay_result").val(billing.pay_result);

	$("#seikyu_date").text("請求日");
	if (billing.pay_result == "請求可") {
		$("#pay_result_1").prop("checked",true);
		$("#seikyu_date").text("請求予定日");
	} else if (billing.pay_result == "請求済") {
		$("#pay_result_2").prop("checked",true);
	} else if (billing.pay_result == "入金確認済") {
		$("#pay_result_3").prop("checked",true);
	} else if (billing.pay_result == "請求待ち") {
		$("#pay_result_0").prop("checked",true);
		$("#seikyu_date").text("請求予定日");
	}
	if (billing.nyukin_yotei_p == "true") {
		$("#nyukin_yotei_p").prop("checked",true);
	} else {
		$("#nyukin_yotei_p").prop("checked",false);
	}
	$("#billing_kind_1").prop("checked",true);
	if (billing.billing_kind == "クライアント") {
		$("#billing_kind_1").prop("checked",true);
	} else if (billing.billing_kind == "代理店") {
		$("#billing_kind_2").prop("checked",true);
	} else if (billing.billing_kind == "その他") {
		$("#billing_kind_3").prop("checked",true);
	}
	// 検体名
	//$("#kentai").val(billing.kentai);
	// クライアント情報
	$("#billing_client_cd").val(billing.client_cd);
	$("#billing_client_name").val(billing.client_name);
	$("#billing_client_division_cd").val(billing.client_division_cd);
	$("#billing_client_division_name").val(billing.client_division_name);
	$("#billing_client_person_id").val(billing.client_person_id);
	$("#billing_client_person_name").val(billing.client_person_name);
	$("#billing_client_info").val(billing.client_info);
	$("#billing_memo").val(billing.memo);
	//　代理店情報
	$("#billing_agent_cd").val(billing.agent_cd);
	$("#billing_agent_name").val(billing.agent_name);
	$("#billing_agent_division_cd").val(billing.agent_division_cd);
	$("#billing_agent_division_name").val(billing.agent_division_name);
	$("#billing_agent_person_id").val(billing.agent_person_id);
	$("#billing_agent_person_name").val(billing.agent_person_name);
	$("#billing_agent_info").val(billing.agent_info);
	$("#billing_agent_memo").val(billing.agent_memo);
	//　その他請求先情報
	$("#billing_etc_cd").val(billing.etc_cd);
	$("#billing_etc_name").val(billing.etc_name);
	$("#billing_etc_division_cd").val(billing.etc_division_cd);
	$("#billing_etc_division_name").val(billing.etc_division_name);
	$("#billing_etc_person_id").val(billing.etc_person_id);
	$("#billing_etc_person_name").val(billing.etc_person_name);
	$("#billing_etc_info").val(billing.etc_info);
	$("#billing_etc_memo").val(billing.etc_memo);
	$("#seikyusho_memo").val(billing.seikyusho_memo);

	$("#billing_delete_check").prop("checked",Number(billing.delete_check));
};
billingList.getBillingDeleteCheckDispCheck = function () {
	var dc = $("#billing_delete_check_disp").prop("checked");
	var delchk = (dc) ? 1:0;
	return delchk;
};
// 得意先選択ダイアログの選択ボタン押下イベント処理
billingList.selectClient = function (kind) {
	if (kind == 0) {
		$("#billing_client_cd").val(clientList.currentClient.client_cd);
		$("#billing_client_name").val(clientList.currentClient.name_1);
		$("#billing_client_division_cd").val(clientList.currentClientDivision.division_cd);
		$("#billing_client_division_name").val(clientList.currentClientDivision.name);
		$("#billing_client_person_id").val(clientList.currentClientPerson.person_id);
		$("#billing_client_person_name").val(clientList.currentClientPerson.name);
		// 請求先情報ダイアログで請求先を変更した場合に「請求先情報に表示する内容も再取得して再表示する
		var client_info = billingList.getClientInfo(clientList.currentClient,clientList.currentClientDivision);
		$("#billing_client_info").val(client_info);
	} else {
		$("#billing_agent_cd").val(clientList.currentClient.client_cd);
		$("#billing_agent_name").val(clientList.currentClient.name_1);
		$("#billing_agent_division_cd").val(clientList.currentClientDivision.division_cd);
		$("#billing_agent_division_name").val(clientList.currentClientDivision.name);
		$("#billing_agent_person_id").val(clientList.currentClientPerson.person_id);
		$("#billing_agent_person_name").val(clientList.currentClientPerson.name);
		// 請求先情報ダイアログで請求先を変更した場合に「請求先情報に表示する内容も再取得して再表示する
		var agent_info = billingList.getClientInfo(clientList.currentClient,clientList.currentClientDivision);
		$("#billing_agent_info").val(agent_info);
			
	}
	return true;
};
//	請求情報データの保存
billingList.saveBillingInfo = function () {
	// checkboxのチェック状態確認と値設定
	billingList.checkCheckbox();
	if (billingList.inputCheck()) {
		// formデータの取得
		var form = billingList.getFormData();
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/billing_info_post', true);
		xhr.responseType = 'json';
		xhr.onload = billingList.onloadBillingSave;
		xhr.send(form);
		return true;
	} else {
		return false;
	}
};
billingList.checkCheckbox = function () {
	if ($("#billing_delete_check:checked").val()) {
		$("#billing_delete_check").val('1');
	}
	if ($("#nyukin_yotei_p:checked").val()) {
		$("#nyukin_yotei_p").val('1');
	}
};

// formデータの取得
billingList.getFormData = function () {
	var form = new FormData(document.querySelector("#billingInfoForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#billing_delete_check:checked").val()) {
		form.append('delete_check', '0');
	}
	return form;
};

// データ保存後のコールバック
billingList.onloadBillingSave = function (e) {
	if (this.status == 200) {
		var billing = this.response;
		if (billing.error_msg) {
			alert(billing.error_msg);
		} else {
			$("#billing_info_list").GridUnload();
			billingList.createBillingListGrid();
			// 案件リストの再ロード
			//entryList.reloadGrid();
			// 案件リストの請求区分と未入金の情報の表示を更新する
			billingList.requestBillingForEntryUpdate(billingList.currentEntry.currentEntry.entry_no);
		}
	}
};
billingList.changeOption = function (event) {
	$("#billing_info_list").GridUnload();
	billingList.createBillingListGrid();
};
// フォームの入力値チェック
billingList.inputCheck = function () {
	var result = false;
	var err = "";
	if (! $("#billingInfoForm")[0].checkValidity) {
		return true;
	}
	// HTML5のバリデーションチェック
	if ($("#billingInfoForm")[0].checkValidity()) {
		result = true;
	} else {
		var ctrls = $("#billingInfoForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (! ctl.validity.valid) {
				if (ctl.id == "pay_amount") {
					err = "金額(税抜)の入力値を確認して下さい";
					break;
				} else if (ctl.id == "pay_amount_tax") {
					err = "消費税の入力値を確認して下さい";
					break;
				} else if (ctl.id == "pay_amount_total") {
					err = "合計(税込)の入力値を確認して下さい";
					break;
				} else if (ctl.id == "pay_amount_complete") {
					err = "入金額の入力値を確認して下さい";
					break;
				}
			}
		}
	}
	if (!result) {
		$("#message").text(err);
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;
};

// 請求金額、入金額取得リクエスト
billingList.requestBillingTotal = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/billing_get_total/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = billingList.onloadBillingTotalReq;
	xhr.send();
};
// 請求金額、入金額取得リクエストのコールバック
billingList.onloadBillingTotalReq = function (e) {
	if (this.status == 200) {
		var amount_zan = 0;
		var billing = this.response;
		if (Number(billingList.currentEntry.currentEntry.entry_amount_price_notax) > 0) {
			amount_zan = (Number(billingList.currentEntry.currentEntry.entry_amount_price_notax) - Number(billing.amount_total_notax));
		}
		$("#pay_amount_zan").val(scheduleCommon.numFormatter(amount_zan,11));
		$("#billing_form_dialog").dialog("open");
	}
};
// 請求残金額の計算と表示
billingList.calcAmountZan = function(entry_amount_price,nyukin_total) {
	var amount_zan = 0;
	if (nyukin_total == null) nyukin_total = 0;
	if (entry_amount_price > 0) {
		amount_zan = (entry_amount_price - nyukin_total);
	}
};

// 請求情報の更新時の案件リストの表示更新（請求区分と未入金情報）
billingList.requestBillingForEntryUpdate = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/billing_for_entry_grid_update/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = billingList.onloadBillingReqForEntryGridUpdate;
	xhr.send();
};
billingList.onloadBillingReqForEntryGridUpdate = function (e) {
	if (this.status == 200) {
		var billing = this.response;
		// 案件リストの表示更新
		entryList.updateGrid_BillingInfo(billing);
	}
};
billingList.clearMeisaiEdit = function() {
	for(var i = 0;i < 5;i++) {
		$("#hinmei_" + (i + 1)).val("");
		$("#kosuu_" + (i + 1)).val("");	// 数量
		$("#tani_" + (i + 1)).val("");		// 単位
		$("#tanka_" + (i + 1)).val("");		// 単価
		$("#kingaku_" + (i + 1)).val("");		// 金額
	}
}
// 請求書編集画面のデータ作成
billingList.editPrintBilling = function() {
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	$("#shimekiri_date").val(today);
	$("#seikyusho_no_edit").val(billingList.currentBilling.seikyusho_no);
	$("#seikyu_gaku").val(scheduleCommon.numFormatter($("#pay_amount_total").val(),12));
	var seikyu_gaku = Number($("#pay_amount_total").val());
	// 
	var entry_no = billingList.currentEntry.currentEntry.entry_no;
	billingList.clearMeisaiEdit();
	// 見積情報
	$.ajax({type:'get',url:'/quote_specific_get_list_for_entryform/' + entry_no }).done(function(quote){
		var sum = 0;
		var rows = quote.rows;
		for(var i = 0;i < rows.length;i++) {
			$("#hinmei_" + (i + 1)).val(rows[i].test_middle_class_name);
			$("#kosuu_" + (i + 1)).val(rows[i].quantity);	// 数量
			$("#tani_" + (i + 1)).val(rows[i].unit);		// 単位
			$("#tanka_" + (i + 1)).val(scheduleCommon.numFormatter(rows[i].unit_price,12));		// 単価
			$("#kingaku_" + (i + 1)).val(scheduleCommon.numFormatter(rows[i].price,12));		// 金額
			sum = sum + Number(rows[i].price);
		}
		var tax = sum * (quoteInfo.currentConsumption_tax / 100)
		if (seikyu_gaku != (sum + tax)) {
			// 請求額と明細合計が違う時は(分割請求の場合)、明細の個数と金額をクリアする
			for(var i = 0;i < rows.length;i++) {
				$("#hinmei_" + (i + 1)).val(rows[i].test_middle_class_name);
				$("#kosuu_" + (i + 1)).val("");	// 数量
				$("#tani_" + (i + 1)).val("");		// 単位
				$("#tanka_" + (i + 1)).val("");		// 単価
				$("#kingaku_" + (i + 1)).val("");		// 金額
			}
			tax = seikyu_gaku * (quoteInfo.currentConsumption_tax / 100);
			$("#zei_gaku").val(scheduleCommon.numFormatterC(tax,12));
		} else {
			$("#zei_gaku").val(scheduleCommon.numFormatterC(tax,12));
		}
		billingList.openBillingPrintEditDialog();
	});
	// 合計計算用
	$(".billing_summary_target").bind('input',{}, billingList.calcSummary);
	$(".billing_calc_price").bind('input',{}, billingList.calcPrice);
	
}

// 請求書編集画面の金額再計算
billingList.calcPrice = function(event) {
	var unit_price = 0;
	var quantity = 0;
	var no = "1";
	if (event.target.id.indexOf("tanka_") == 0) {
		no = event.target.id.split("_")[1];
		unit_price = Number(event.target.value.replace(/,/g,''));
		quantity = $("#kosuu_" + no).val();
	} else if (event.target.id.indexOf("kosuu_") == 0) {
		no = event.target.id.split("_")[1];
		quantity = event.target.value;
		unit_price = Number($("#tanka_" + no).val().replace(/,/g,''));
	}
	var price = 0;
	var price = unit_price * quantity;
	$("#kingaku_" + no).val(scheduleCommon.numFormatterC(price,12));
	billingList.calcSummary();

};

// 請求書編集画面の請求額再計算
billingList.calcSummary = function(event) {
	var sum = 0;
	for(var i = 1;i <= 5;i++) {
		if ($("#kingaku_" + i).val() != "") {
			var price = Number($("#kingaku_" + i).val().replace(/,/g,''));
			sum = sum + price;
		}
	}
	var tax = sum * (quoteInfo.currentConsumption_tax / 100)
	$("#seikyu_gaku").val(scheduleCommon.numFormatterC(sum + tax,12));
	$("#zei_gaku").val(scheduleCommon.numFormatterC(tax,12));
}
// 請求書印刷
billingList.printBillingInfo = function() {
	// 自社データ取得
	// 請求先の選択状態を取得する
	var c_cd = 0;
	if ($("#billing_kind_1").prop("checked")) {
		c_cd = $("#billing_client_cd").val();
	}
	else if ($("#billing_kind_2").prop("checked")) {
		c_cd = $("#billing_agent_cd").val();
	}
	// 請求先の支払いサイト情報を取得して振込口座情報を取得する
	billingList.getSightInfo(c_cd);
	// データ送信
};

// 支払いサイト情報から振込口座情報を得る
billingList.getSightInfo = function(cd) {
	// 請求先情報の取得
	$.ajax({type:'get',url:'/client_get?client_cd=' + cd }).done(function(client){
		if (client.client_cd == cd) {
			// 請求先の支払いサイト情報を取得する
			var sight_info = {client_cd:"",shimebi:"",sight_id:0,kyujitsu_setting:0,bank_id:0,memo:""};
			nyukinYotei.getSightInfo(cd).done(function(data){
				if (data != "") {
					if ((data.bank_id == 0) || (data.bank_id == null)) {
						// 振込口座設定がない時は既定の口座を印刷する
						$.ajax({type:'get',url:'/default_get'}).done(function(bank_info) {
							client.bank_info = bank_info;
							billingList.printBilling(client);
						})
						.fail(function(){
							$("#message").text("振込口座情報が取得できません。");
							$("#message_dialog").dialog("option", { title: "振込口座情報" });
							$("#message_dialog").dialog("open");
						});
					} else {
						client.sight_info = data;
						// 振込口座情報の取得
						$.ajax({type:'get',url:'/bank_find?bank_id=' + data.bank_id}).done(function(bank_info) {
							client.bank_info = bank_info;
							billingList.printBilling(client);
						})
						.fail(function(){
							$("#message").text("振込口座情報が取得できません。");
							$("#message_dialog").dialog("option", { title: "振込口座情報" });
							$("#message_dialog").dialog("open");
						});	
					}
				} else {
					// 振込口座設定がない時は既定の口座を印刷する
					$.ajax({type:'get',url:'/default_get'}).done(function(bank_info) {
						client.bank_info = bank_info;
						billingList.printBilling(client);
					})
					.fail(function(){
						$("#message").text("振込口座情報が取得できません。");
						$("#message_dialog").dialog("option", { title: "振込口座情報" });
						$("#message_dialog").dialog("open");
					});
//					$("#message").text("顧客の支払いサイト情報がありません。");
//					$("#message_dialog").dialog("option", { title: "支払いサイト情報" });
//					$("#message_dialog").dialog("open");
				}
			})
			.fail(function(){
				$("#message").text("支払いサイト情報が取得できません。");
				$("#message_dialog").dialog("option", { title: "支払いサイト情報" });
				$("#message_dialog").dialog("open");
			});
		} 
	})
	.fail(function() {
		$("#message").text("顧客情報がありません。");
		$("#message_dialog").dialog("option", { title: "顧客マスタ情報" });
		$("#message_dialog").dialog("open");
	});
};
billingList.printBilling = function(billing_info) {
	var data = billingList.printDataSetup(billing_info);
	data.seikyusho_no = billingList.currentBilling.seikyusho_no;
	data.seikyusho_memo = billingList.currentBilling.seikyusho_memo;
	data.kentai = $("#kentai").val();
	billingList.current_seikyusho_no = billingList.currentBilling.seikyusho_no;
	if (billingList.currentBilling.seikyusho_no == "") {
		$.ajax({type:'get',url:'/billing_no_get/' }).done(function(billing_no){
			// 請求書NOセット
			data.seikyusho_no = billing_no.billing_no;
			billingList.current_seikyusho_no = billing_no.billing_no;
			// 明細データの取得
			billingList.getBillingMeisai(data);
		});
	} else {
		// 明細データの取得
		billingList.getBillingMeisai(data);
	}
 };
// 請求書印刷、明細データの取得
billingList.getBillingMeisai = function(data) {
	var rows = new Array();
	for(var i = 1;i <= 5;i++) {
		if ($("#hinmei_" + i).val() != "") {
			rows.push({'test_middle_class_name': $("#hinmei_" + i).val(),
			'quantity': $("#kosuu_" + i).val(),
			'unit': $("#tani_" + i).val(),
			'unit_price': $("#tanka_" + i).val().replace(/,/g,''),
			'price': $("#kingaku_" + i).val().replace(/,/g,'')});
		}
	}	
	data.rows = rows;
	// 印刷レイアウト作成
	billingList.createSVG(data);	
};
// 請求書用データの生成
billingList.printDataSetup = function (billing_info) {
	// 印刷用データ
	var data = {					
		title: '請　　求　　書',
		no: 'No.',
		date_template: '　　年　　　　月　　　　日',
		billing_issue_date: billing_info.nouhin_date,
		drc_zipcode: quoteInfo.drc_info.zipcode,
		drc_address1: quoteInfo.drc_info.address1,
		drc_address2: quoteInfo.drc_info.address2,
		drc_tel: quoteInfo.drc_info.telno,
		drc_fax: quoteInfo.drc_info.faxno,
		drc_name:quoteInfo.drc_info.name,
		drc_bank:'振込銀行',
		drc_bank_name:billing_info.bank_info.bank_name,
		drc_bank_branch:billing_info.bank_info.branch_name,
		drc_bank_kouza_kind:billing_info.bank_info.kouza_kind,
		drc_bank_kouza_no:billing_info.bank_info.kouza_no,
		drc_bank_meigi:billing_info.bank_info.meigi_name,
		discription:'毎度ありがとうございます。下記の通り御請求申し上げます。',
		header_1:'前回御請求額',
		header_2:'御 入 金 額',
		header_3:'繰 越 金 額',
		header_4:'御 買 上 額',
		header_5:'今回御請求額',
		meisai_1:'請求日',
		meisai_2:'伝票No.',
		meisai_3:'品　　　　　　　　名',
		meisai_4:'数　　　量',
		meisai_5:'単位',
		meisai_6:'単　　価',
		meisai_7:'金　　　額',
		memo:'備　考',
		kentai_title:'検体名',
		rows: []
	};
	// 明細データの生成
	data.client_info = billing_info;
	return data;
};
billingList.getBillingDateForPrint = function(dateStr) {
	var y = dateStr.substring(0,4);
	var m = dateStr.substring(5,7);
	var d = dateStr.substring(8,10);
	return(y + "　　　　" + m + "　　　" + d);
}
// 請求書の作成
billingList.createSVG = function (data) {
	var blue_define = '#1e90ff';
	canvas = new fabric.Canvas('billing_canvas', { backgroundColor : "#ffffff" });
	canvas.setHeight(1400);
	canvas.setWidth(960);

	var top = 10;
	var font_size = 28;
	quoteInfo.setTextColor(blue_define);
	// タイトル
	quoteInfo.outputText(canvas, data.title, font_size, 480, top);
	top += font_size;
	font_size = 12;
	// Code
	//quoteInfo.outputText(canvas, data.code, font_size, 50, top);
	// No.
	quoteInfo.outputText(canvas, data.no, font_size, 750, top);
	quoteInfo.setTextColor("#000000");
	quoteInfo.outputText(canvas, data.seikyusho_no, font_size, 785, top);
	quoteInfo.setTextColor(blue_define);

	top += font_size;
	canvas.add(new fabric.Line([750,top + 4,900,top + 4],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	// date
	font_size = 12;
	quoteInfo.outputText(canvas, data.date_template, font_size, 500, top);
	quoteInfo.setTextColor("#000000");
	quoteInfo.outputText(canvas, billingList.getBillingDateForPrint($("#shimekiri_date").val()), font_size, 480, top);
	// 請求先情報
	font_size = 16;
	var left = 80;
	top = 20;
	if (data.client_info.zipcode != "") {
		quoteInfo.outputText(canvas, "〒" + data.client_info.zipcode, font_size, left, top);
	}
	top += font_size + font_size + 6;
	if (data.client_info.address_1 != "") {
		quoteInfo.outputText(canvas, data.client_info.address_1, font_size, left, top);
	}
	top += font_size + 6;
	if (data.client_info.name_1 != "") {
		quoteInfo.outputText(canvas, data.client_info.name_1, font_size, left, top);
	}
	top += font_size + 6;
	if (data.client_info.name_2 != "") {
		quoteInfo.outputText(canvas, data.client_info.name_2, font_size, left, top);
	}
	top += font_size + font_size + 6;
	if (data.client_info.tel_no != "") {
		quoteInfo.outputText(canvas, "TEL:" + data.client_info.tel_no, font_size, left, top);
	}
	if (data.client_info.fax_no != "") {
		quoteInfo.outputText(canvas, "FAX:" + data.client_info.fax_no, font_size, left + 200, top);
	}
	// 自社情報
	left = 480;
	top = 85;
	font_size = 16;
	quoteInfo.outputText(canvas, data.drc_name, font_size, left, top);
	top += font_size + 10;
	quoteInfo.outputText(canvas, data.drc_zipcode, font_size, left, top);
	top += font_size + 6;
	//font_size = 14;
	quoteInfo.outputText(canvas, data.drc_address1, font_size, left, top);
	top += font_size + 6;
	quoteInfo.outputText(canvas, data.drc_address2, font_size, left, top);
	top += font_size + 6;
	quoteInfo.outputTextMono(canvas, data.drc_tel + "    " + data.drc_fax, font_size, left, top);
	// 振込口座情報
	top += font_size + 6;
	quoteInfo.outputText(canvas, data.drc_bank, font_size, left, top);
	top += font_size + 6;
	quoteInfo.outputText(canvas, data.drc_bank_name + "　　" + data.drc_bank_branch + "支店", font_size, left, top);
	top += font_size + 6;
	if (data.drc_bank_kouza_kind == 0) {
		quoteInfo.outputText(canvas, "普通預金　" + data.drc_bank_kouza_no + "　　" + data.drc_bank_meigi, font_size, left, top);
	} else {
		quoteInfo.outputText(canvas, "当座預金　" + data.drc_bank_kouza_no + "　　" + data.drc_bank_meigi, font_size, left, top);
	}

	top += (font_size * 3) + 6;
	// 毎度ありがとうございます。
	quoteInfo.setTextColor(blue_define);
	font_size = 14;
	quoteInfo.outputText(canvas, data.discription, font_size, 50, top);
	top += font_size + 6;
	// ヘッダー
	left = 40;
	var w = 740;
	h = 22;
	var top_wk = top + (font_size * 3);
	// 枠
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h, fill:'none',stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top + 22, left : left, width : w, height : 50, fill:'none',stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top, left : 640, width : 140, height : h, fill: blue_define, stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	// 印鑑枠
	canvas.add(new fabric.Rect({ top : top ,left : 800, width : 62, height : 72, fill:'none',stroke: blue_define,opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top ,left : 862, width : 62, height : 72, fill:'none',stroke: blue_define,opacity: 0.7 }));
	// 縦線
	canvas.add(new fabric.Line([190,top,190,top + 72],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([340,top,340,top + 72],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([490,top,490,top + 72],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([640,top,640,top + 72],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	font_size = 14;
	quoteInfo.outputText(canvas, data.header_1, font_size, 75, top);	// 前回御請求額
	quoteInfo.outputText(canvas, data.header_2, font_size, 225, top);	// 御入金額
	quoteInfo.outputText(canvas, data.header_3, font_size, 375, top);	// 繰越金額
	quoteInfo.outputText(canvas, data.header_4, font_size, 525, top);	// 御買上額
	quoteInfo.setTextColor("#ffffff");
	quoteInfo.outputText(canvas, data.header_5, font_size, 670, top);	// 今回御請求額
	// 明細
	// 枠
	top += 80;
	left = 40;
	w = 882;
	h = 720;
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : h, fill:'none',stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	canvas.add(new fabric.Rect({ top : top, left : left, width : w, height : font_size + 10, fill:blue_define,stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	// 検体名枠
	font_size = 12;
	canvas.add(new fabric.Rect({ top : top + h, left : left, width : w, height : 80, fill:'none',stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	quoteInfo.setTextColor(blue_define);
	quoteInfo.outputText(canvas, data.kentai_title, font_size, 45, top + h + 5);	// 備考
	quoteInfo.setTextColor("#000000");
	quoteInfo.outputText(canvas, data.kentai, font_size, 45, top + h + 20);
	quoteInfo.setTextColor(blue_define);
	// 備考枠
	canvas.add(new fabric.Rect({ top : top + h + 80, left : left, width : w, height : 80, fill:'none',stroke: blue_define, strokeWidth: 2,opacity: 0.7 }));
	quoteInfo.setTextColor(blue_define);
	quoteInfo.outputText(canvas, data.memo, font_size, 45, top + h + 80 + 5);	// 備考
	quoteInfo.setTextColor("#000000");
	quoteInfo.outputText(canvas, data.seikyusho_memo, font_size, 45, top + h + 80 + 20);
	quoteInfo.setTextColor(blue_define);
	font_size = 14;
	// 縦線
	//canvas.add(new fabric.Line([165,top,165,top + h],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	//canvas.add(new fabric.Line([230,top,230,top + h],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([545,top,545,top + h],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([640,top,640,top + h],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([690,top,690,top + h],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	canvas.add(new fabric.Line([790,top,790,top + h],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
	quoteInfo.setTextColor("#ffffff");
	//quoteInfo.outputText(canvas, data.meisai_1, font_size, 75, top);	// 伝票日付
	//quoteInfo.outputText(canvas, data.meisai_2, font_size, 175, top);	// 伝票No.
	quoteInfo.outputText(canvas, data.meisai_3, font_size, 240, top);	// 品名
	quoteInfo.outputText(canvas, data.meisai_4, font_size, 555, top);	// 数量
	quoteInfo.outputText(canvas, data.meisai_5, font_size, 650, top);	// 単位
	quoteInfo.outputText(canvas, data.meisai_6, font_size, 710, top);	// 単価
	quoteInfo.outputText(canvas, data.meisai_7, font_size, 810, top);	// 金額
	top += font_size + 12;
	quoteInfo.setTextColor("#000000");
	// 明細データ
	if (data.rows.length > 0) {
		var price_total = 0;
		var tax_total = 0;
		for(i = 0;i < data.rows.length;i++) {
			//quoteInfo.outputText(canvas, data.rows[i].seikyubi, font_size, 50, top);		// 単位
			quoteInfo.multiLines_2(canvas, top, 75, font_size, data.rows[i].test_middle_class_name);	// 品名
			if (data.rows[i].quantity > 0)
				quoteInfo.outputTextMonoRight(canvas, scheduleCommon.numFormatterN(data.rows[i].quantity), font_size, 630, top);	// 数量
			quoteInfo.outputText(canvas, data.rows[i].unit, font_size, 650, top);		// 単位
			if (data.rows[i].quantity > 0)
				quoteInfo.outputTextMonoRight(canvas, scheduleCommon.numFormatterN(data.rows[i].unit_price), font_size, 780, top);		// 単価
			if (data.rows[i].quantity > 0)
				quoteInfo.outputTextMonoRight(canvas, scheduleCommon.numFormatterN(data.rows[i].price), font_size, 910, top);		// 金額
			top += font_size + 12;
			var tax = data.rows[i].price * (quoteInfo.currentConsumption_tax / 100);
//			quoteInfo.outputText(canvas, "  消費税等 " + quoteInfo.currentConsumption_tax + ".0%", font_size, 240, top);
//			quoteInfo.outputTextMono(canvas,  scheduleCommon.numFormatter(tax, 12), font_size, 830, top);
			price_total += Number(data.rows[i].price) + Number(tax);
			tax_total += Number(tax);
		}
		top += font_size  + 20;
		canvas.add(new fabric.Line([815,top,915,top],{fill: blue_define, stroke: blue_define, strokeWidth: 1, opacity: 1 }));
		top += font_size  + 12;
		quoteInfo.outputText(canvas, "  【合　　　　計】 " , font_size, 75, top);
		quoteInfo.outputTextMonoRight(canvas,  scheduleCommon.numFormatterN(price_total), font_size, 910, top);
		top += font_size  + 12;
		quoteInfo.outputText(canvas, "  （内消費税等 " + quoteInfo.currentConsumption_tax + ".0%)"  , font_size, 75, top);
		quoteInfo.outputTextMonoRight(canvas,  "(" + scheduleCommon.numFormatter(tax_total) +")", font_size, 910, top);
		var konkai = scheduleCommon.addYenMark($("#seikyu_gaku").val());
		// 御買上額
		quoteInfo.outputTextMono(canvas, konkai, font_size, 550, top_wk);
		// 今回請求額
		quoteInfo.outputTextMono(canvas, konkai, font_size, 680, top_wk);
				
	}
	billingList.printCanvas = canvas;
	document.body.style.cursor = "default";
	// プレビュー画面表示
	billingList.openBillingPrintPreviewDialog();
	return true;
};
// 請求書印刷用SVG生成
billingList.saveBillingSVGFile = function() {
	var svg = billingList.printCanvas.toSVG();
	var blob = new Blob([svg], {type: "text/plain;charset=utf-8"});
	saveAs(blob,"billing.svg");
	billingList.printCanvas.setHeight(0);
	billingList.printCanvas.setWidth(0);
	document.body.style.cursor = "default";
	billingList.updateBillingInfo();
}
// 請求書NoをDBに保存する
billingList.updateBillingInfo = function() {

	$.ajax({type:'post',url:'/seikyusho_no_update' 
		,data:{entry_no:billingList.currentBilling.entry_no
			,billing_no:billingList.currentBilling.billing_no
			,pay_result:2
			,seikyusho_no:billingList.current_seikyusho_no}}).done(function(){
				$("#seikyusho_no_edit").val(billingList.current_seikyusho_no);
	});

}

