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
	$("#nyukin_yotei_button").bind("click",billingList.calc_nyukin_yotei_date)
};

// 入金予定日の計算
billingList.calc_nyukin_yotei_date = function() {
	// 請求先の支払いサイト情報を取得する
	var sight_info = {client_cd:0,shimebi:"",sight_id:0,kyujitsu_setting:0,memo:""};
	if (billingList.currentEntry.currentEntry.client_cd == "") {
		// クライアントが未設定の場合
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
	} else {
		nyukinYotei.getSightInfo(billingList.currentEntry.currentEntry.client_cd).then(function(data){
				if (data != "") {
					sight_info = data;
					billingList.set_nyukin_yotei_date(sight_info);
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
			});
	}
}

billingList.set_nyukin_yotei_date = function(sight_info) {
	// 請求日と締日を参照して、支払年月を決定する
	var seikyu_date = $("#pay_planning_date").val();
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
		width: 900,
		height: 600,
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
		colNames: ['案件番号','請求番号serial','請求番号','請求日', '入金予定日','税抜請求金額','消費税','請求金額合計','入金額', '入金日','請求区分','','請求先名','','請求先部署','','','','','','請求先担当者','請求先情報','備考','作成日','作成者','更新日','更新者','削除フラグ'],
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
			{ name: 'created', index: 'created', width: 120 }, // 作成日
			{ name: 'created_id', index: 'created_id', width: 120 }, // 作成者ID
			{ name: 'updated', index: 'updated', width: 120 }, // 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },			// 更新者ID
			{ name: 'delete_check', index: '', hidden:true },
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
		var client_info = billingList.getEntryClientInfo(billingList.currentEntry.currentEntry);
		billingList.openAddDialog(client_info);
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
billingList.openAddDialog = function(client_info) {
	billingList.status = "add";
	var billing = billingList.clearBilling();
	// 選択中の案件情報から得意先情報をコピーする（デフォルト設定として）
	billing = billingList.setDefaultClientData(billing);
	billing.client_info = client_info
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
	return billing;
}
// 案件情報から請求先情報を取得
billingList.getEntryClientInfo = function(client) {
	var address1 = billingList.getAddress1_for_entry(client);
	var address2 = billingList.getAddress2_for_entry(client);
	var tel = billingList.getTel_for_entry(client);
	var fax = billingList.getFax_for_entry(client);
	var client_info = "住所1 : " + address1 + " \n住所2 : " + address2
					+ " \ntel : " + tel + " \nfax : " + fax
	return client_info;
}
// 顧客マスタから請求先情報を取得
billingList.getClientInfo = function(client,division) {
	var address1 = billingList.getAddress1_for_client(client,division);
	var address2 = billingList.getAddress2_for_client(client,division);
	var tel = billingList.getTel_for_client(client,division);
	var fax = billingList.getFax_for_client(client,division);
	var client_info = "住所1 : " + address1 + " \n住所2 : " + address2
					+ " \ntel : " + tel + " \nfax : " + fax
	return client_info;
}
// 住所１取得（案件情報から取得）
billingList.getAddress1_for_entry = function(client) {
	var address1 = "";
	if ((client.client_address_1 != null) && (client.client_address_1 != "")) {
		address1 = client.client_address_1;
	}
	if ((client.client_division_address_1 != null) && (client.client_division_address_1 != "")) {
		address1 = client.client_division_address_1;
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
billingList.getAddress2_for_entry = function(client) {
	var address2 = "";
	if ((client.client_address_2 != null) && (client.client_address_2 != "")) {
		address2 = client.client_address_2;
	}
	if ((client.client_division_address_2 != null) && (client.client_division_address_2 != "")) {
		address2 = client.client_division_address_2;
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
billingList.getTel_for_entry = function(client) {
	var tel = "";
	if ((client.client_tel_no != null) && (client.client_tel_no != "")) {
		tel = client.client_tel_no;
	}
	if ((client.client_division_tel_no != null) && (client.client_division_tel_no != "")) {
		tel = client.client_division_tel_no;
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
billingList.getFax_for_entry = function(client) {
	var fax = "";
	if ((client.client_fax_no != null) && (client.client_fax_no != "")) {
		fax = client.client_fax_no;
	}
	if ((client.client_division_fax_no != null) && (client.client_division_fax_no != "")) {
		fax = client.client_division_fax_no;
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
			client_cd:'',
			client_name:'',
			client_division_cd:'',
			client_division_name:'',
			client_person_id:'',
			client_person_name:'',
			client_info: '',
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

	$("#billing_client_cd").val(billing.client_cd);
	$("#billing_client_name").val(billing.client_name);
	$("#billing_client_division_cd").val(billing.client_division_cd);
	$("#billing_client_division_name").val(billing.client_division_name);
	$("#billing_client_person_id").val(billing.client_person_id);
	$("#billing_client_person_name").val(billing.client_person_name);
	$("#billing_client_info").val(billing.client_info);
	$("#billing_memo").val(billing.memo);
	$("#billing_delete_check").prop("checked",Number(billing.delete_check));
};
billingList.getBillingDeleteCheckDispCheck = function () {
	var dc = $("#billing_delete_check_disp").prop("checked");
	var delchk = (dc) ? 1:0;
	return delchk;
};
// 得意先選択ダイアログの選択ボタン押下イベント処理
billingList.selectClient = function () {
	$("#billing_client_cd").val(clientList.currentClient.client_cd);
	$("#billing_client_name").val(clientList.currentClient.name_1);
	$("#billing_client_division_cd").val(clientList.currentClientDivision.division_cd);
	$("#billing_client_division_name").val(clientList.currentClientDivision.name);
	$("#billing_client_person_id").val(clientList.currentClientPerson.person_id);
	$("#billing_client_person_name").val(clientList.currentClientPerson.name);
	// 請求先情報ダイアログで請求先を変更した場合に「請求先情報に表示する内容も再取得して再表示する
	var client_info = billingList.getClientInfo(clientList.currentClient,clientList.currentClientDivision);
	$("#billing_client_info").val(client_info);
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
			entryList.reloadGrid();
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
