//
// 請求情報に関する処理クラス
//
var billingList = billingList || {};

billingList.currentEntry = null;
billingList.currentBilling = null;
billingList.status = "add"; // or "edit" 追加でフォームを開いたか、編集で開いたか（デフォルトの税計算をするかしないか）

// イベント処理登録
billingList.eventBind = function() {
	// 税抜請求金額の変更
	$("#pay_amount").bind("change",billingList.calc_amount);
	// 消費税の変更
	$("#pay_amount_tax").bind("change",billingList.calc_amount);
	$("#calc_tax_button").bind("click",billingList.calc_tax);
	// 入金予定日計算ボタン
	$("#nyukin_yotei_button").bind("click",billingList.calc_nyukin_yotei_date);
};

// 入金予定日の計算
billingList.calc_nyukin_yotei_date = function() {
	// 請求先の支払いサイト情報を取得する
	var sight_info = {client_cd:0,shimebi:"",sight_id:0,kyujitsu_setting:0,memo:""};
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
		// 入金予定日が営業日か判定し、休日の場合は前後に移動する
		// 土日チェック
		var date = nyukinYotei.checkHoliday_ss(shiharaibi,sight_info.kyujitsu_setting);
	
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
		colNames: ['案件番号','請求番号serial','請求番号','請求日', '入金予定日','税抜請求金額'
			,'消費税','請求金額合計','入金額', '入金日','請求区分','請求先区分'
			,'','クライアント名','','クライアント部署','','','','','','クライアント担当者','クライアント情報','備考'
			,'','代理店名','','代理店部署','','','','','','代理店担当者','代理店情報','代理店備考'
			,'','その他名','','その他部署','','その他担当者','その他情報','その他備考'
			,'作成日','作成者','更新日','更新者','削除フラグ','','',''],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'billing_no', index: 'billing_no', hidden:true },
			{ name: 'billing_number', index: 'billing_number', width: 80, align: "center" },
			{ name: 'pay_planning_date', index: 'pay_planning_date', width: 80, align: "center" },
			{ name: 'nyukin_yotei_date', index: 'nyukin_yotei_date', width: 100, align: "center" },
			{ name: 'pay_amount', index: 'pay_amount', width: 120, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_amount_tax', index: 'pay_amount_tax', width: 80, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_amount_total', index: 'pay_amount_total', width: 120, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'pay_complete', index: 'pay_complete', width: 80, align: "right" },
			{ name: 'pay_complete_date', index: 'pay_complete_date', width: 80, align: "center" },
			{ name: 'pay_result', index: 'pay_result', width: 80, align: "center" ,formatter:scheduleCommon.pay_resultFormatter},
			{ name: 'billing_kind', index: 'billing_kind', width: 100 , align: "center", formatter:scheduleCommon.billing_kindFormatter},
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
			{ name: 'nyukin_yotei_p', index:'', hidden:true}
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
			delete_check:0
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
		if (billingList.currentEntry.currentEntry.entry_amount_price_notax > 0) {
			amount_zan = (billingList.currentEntry.currentEntry.entry_amount_price_notax - billing.amount_total_notax);
		}
		$("#pay_amount_zan").val(scheduleCommon.numFormatter(amount_zan,11));
		$("#billing_form_dialog").dialog("open");
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
