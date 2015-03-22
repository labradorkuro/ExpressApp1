//
// 請求情報に関する処理クラス
//
var billingList = billingList || {};

billingList.currentEntry = null;
billingList.currentBilling = null;
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
		height: 400,
		title: '請求情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				billingList.saveBillingInfo();
				$(this).dialog('close');
			},
			"更新": function () {
				billingList.saveBillingInfo();
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
	// 得意先リストのグリッド
	jQuery("#billing_info_list").jqGrid({
		url: '/billing_info_get?entry_no=' + entry_no + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['案件番号','請求番号','請求日', '請求金額', '入金日','請求区分','','請求先名','','請求先部署','','','','','','請求先担当者','備考','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'billing_no', index: 'billing_no', width: 80, align: "center" },
			{ name: 'pay_planning_date', index: 'pay_planning_date', width: 80, align: "center" },
			{ name: 'pay_amount', index: 'pay_amount', width: 80, align: "right" },
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
//			{ name: 'client_info', index: 'client_info', width: 200, align: "left"},
			{ name: 'memo', index: 'memo', width: 100, align: "center" },
			{ name: 'created', index: 'created', width: 120 }, // 作成日
			{ name: 'created_id', index: 'created_id', width: 120 }, // 作成者ID
			{ name: 'updated', index: 'updated', width: 120 }, // 更新日
			{ name: 'updated_id', index: 'updated_id', width: 120 },			// 更新者ID
		],
		height: "230px",
		//width:"800",
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10],
		pager: '#billing_info_list_pager',
		sortname: 'billing_no',
		viewrecords: true,
		sortorder: "asc",
		caption: "得意先リスト",
		onSelectRow: billingList.onSelectBillingList
	});
	jQuery("#billing_info_list").jqGrid('navGrid', '#billing_info_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
// 請求先選択イベント
billingList.onSelectBillingList = function (rowid) {
	billingList.currentBilling = $("#billing_info_list").getRowData(rowid);	
};
// 請求情報リストダイアログの表示
billingList.openBillingListDialog = function (event) {
	billingList.currentEntry = event.data.entryList;					// 選択中の案件情報
	$("#billing_entry_no").val(event.data.entryList.currentEntryNo);
	$("#billing_info_list").GridUnload();
	billingList.createBillingListGrid();

	$("#billing_list_dialog").dialog("open");
};
// 請求情報編集用ダイアログの表示
billingList.openBillingFormDialog = function (event) {
	// フォームをクリアする
	var billing = billingList.clearBilling();
	billingList.setBillingForm(billing);
	var address1 = billingList.currentEntry.currentEntry.client_address_1;
	if (billingList.currentEntry.currentEntry.client_division_address_1 != "") {
		address1 = billingList.currentEntry.currentEntry.client_division_address_1;
	}
	var address2 = billingList.currentEntry.currentEntry.client_address_2;
	if (billingList.currentEntry.currentEntry.client_division_address_2 != "") {
		address2 = billingList.currentEntry.currentEntry.client_division_address_2;
	}
	var tel =billingList.currentEntry.currentEntry.client_tel_no;
	if (billingList.currentEntry.currentEntry.client_division_tel_no != "") {
		tel = billingList.currentEntry.currentEntry.client_division_tel_no;
	}
	var fax =billingList.currentEntry.currentEntry.client_fax_no;
	if (billingList.currentEntry.currentEntry.client_division_fax_no != "") {
		fax = billingList.currentEntry.currentEntry.client_division_fax_no;
	}
	var client_info = "住所1" + address1 + " \n住所2" + address2
					+ " \ntel:" + tel + " \nfax:" + fax
	if ($(event.target).attr('id') == 'edit_billing') {
		// 編集ボタンから開いた場合
		billingList.currentBilling.client_info = client_info;
		billingList.setBillingForm(billingList.currentBilling);	
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		// 追加ボタンから開いた場合
		var billing = {
			billing_no:'',
			pay_planning_date:'',
			pay_complete_date:'',
			pay_amount:0,
			pay_result:0,
			memo:'',
			// 選択中の案件情報から得意先情報をコピーする（デフォルト設定として）
			client_cd:billingList.currentEntry.currentEntry.client_cd,
			client_name:billingList.currentEntry.currentEntry.client_name_1,
			client_division_cd:billingList.currentEntry.currentEntry.client_division_cd,
			client_division_name:billingList.currentEntry.currentEntry.client_division_name,
			client_person_id:billingList.currentEntry.currentEntry.client_person_id,
			client_person_name:billingList.currentEntry.currentEntry.client_person_name,
			client_info: client_info
		}
		billingList.setBillingForm(billing);		
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}

	$("#billing_form_dialog").dialog("open");
};
// 請求情報のクリア
billingList.clearBilling = function() {
	var billing = {};
	return billing;
};
// 請求情報をフォームにセットする
billingList.setBillingForm = function(billing) {
	$("#billing_no").val(billing.billing_no);

	$("#pay_planning_date").val(billing.pay_planning_date);
	$("#pay_complete_date").val(billing.pay_complete_date);
	$("#pay_amount").val(billing.pay_amount);
	$("#pay_result").val(billing.pay_result);
	$("#billing_client_cd").val(billing.client_cd);
	$("#billing_client_name").val(billing.client_name);
	$("#billing_client_division_cd").val(billing.client_division_cd);
	$("#billing_client_division_name").val(billing.client_division_name);
	$("#billing_client_person_id").val(billing.client_person_id);
	$("#billing_client_person_name").val(billing.client_person_name);
	$("#billing_client_info").val(billing.client_info);
	$("#billing_memo").val(billing.memo);
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
	return true;
};
//	請求情報データの保存
billingList.saveBillingInfo = function () {
	// checkboxのチェック状態確認と値設定
	billingList.checkCheckbox();
	// formデータの取得
	var form = billingList.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/billing_info_post', true);
	xhr.responseType = 'json';
	xhr.onload = billingList.onloadBillingSave;
	xhr.send(form);
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

// 社員データ保存後のコールバック
billingList.onloadBillingSave = function (e) {
	if (this.status == 200) {
		var user = this.response;
		if (user.error_msg) {
			alert(user.error_msg);
		} else {
			$("#billing_info_list").GridUnload();
			billingList.createBillingListGrid();
		}
	}
};
billingList.changeOption = function (event) {
	$("#billing_info_list").GridUnload();
	billingList.createBillingListGrid();
};
