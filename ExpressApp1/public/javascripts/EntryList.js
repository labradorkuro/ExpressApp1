//
// DRC殿試験案件スケジュール管理
// 案件リスト画面の処理
//
$(function() {
	// 自社情報の取得
	quoteInfo.getMyInfo();
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo();
	// 案件リストのタブ生成
	$("#tabs").tabs();
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	entryList.createMessageDialog();
	//scheduleCommon.getDivisionInfo();
	// 編集用ダイアログの設定
	entryList.createEntryDialog();				// 案件入力用
	quoteInfo.createQuoteDialog();				// 見積明細用
	quoteInfo.createQuoteFormDialog();			// 見積書発行用
	entryList.createClientListDialog();			// 得意先選択用
	test_itemList.createTestItemSelectDialog();	// 試験分類選択用
	billingList.createBillingListDialog();		// 請求情報リスト用
	billingList.createBillingFormDialog();		// 請求情報編集選択用
	// 検索用オプションの初期化	
	$("#entry_status_01").prop("checked", true);
	$("#entry_status_02").prop("checked", true);
	$("#entry_status_03").prop("checked", true);
	$("#entry_status_04").prop("checked", true);
	$("#entry_status_05").prop("checked", true);
	// グリッドの生成
	entryList.createGrid();						// 案件リスト
	quoteInfo.createQuoteInfoGrid(0);			// 見積リスト
	quoteInfo.createQuoteSpecificGrid(0,0);		// 見積明細リスト
	test_itemList.createTestLargeGrid();		// 試験大分類リスト
	test_itemList.createTestMiddleGrid(0);		// 試験中分類リスト
	//billingList.createBillingListGrid();	// 請求情報リスト
	scheduleCommon.changeFontSize();
	// 案件追加ボタンイベント（登録・編集用画面の表示）
	$("#add_entry").bind('click' , {}, entryList.openEntryDialog);
	// 案件編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_entry").bind('click' , {}, entryList.openEntryDialog);
	$("#edit_entry").css("visibility","hidden");
	// 見積追加ボタンイベント（登録・編集用画面の表示）
	$("#add_quote").bind('click' ,  {entryList:entryList}, quoteInfo.openQuoteFormDialog);
	// 見積編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_quote").bind('click' , {entryList:entryList}, quoteInfo.openQuoteFormDialog);
	// 見積書発行用フォームを表示する
	//$("#print_quote").bind('click' , {}, quoteInfo.openQuoteFormDialog);
	// クライアント選択ダイアログを表示するイベント処理を登録する
	$("#client_name").bind('click' , {}, entryList.openClientListDialog);
	$("#billing_client_name").bind('click' , {}, entryList.openClientListDialog);
	// 試験中分類選択ダイアログを表示するイベント処理を登録する
	$("#test_middle_class_name").bind('click',{}, test_itemList.openTestItemSelectDialog);
	$("#test_large_class_name").bind('click',{}, test_itemList.openTestItemSelectDialog);

	// 請求情報ボタンイベント（登録・編集用画面の表示）
	$("#entry_billing").bind('click' , {entryList:entryList}, billingList.openBillingListDialog);
	$("#entry_billing").css("visibility","hidden");
	// 請求情報追加ボタンイベント（登録・編集用画面の表示）
	$("#add_billing").bind('click' , {}, billingList.openBillingFormDialog);
	// 請求先編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_billing").bind('click' , {}, billingList.openBillingFormDialog);

	quoteInfo.enableQuoteButtons(false,0);
	
	// 削除分を表示のチェックイベント
	$("#entry_delete_check_disp").bind('change', entryList.changeEntryOption);
	$("#quote_delete_check_disp").bind('change', quoteInfo.changeQuoteOption);
	
	$("#entry_status_01").bind('change', entryList.changeEntryOption);
	$("#entry_status_02").bind('change', entryList.changeEntryOption);
	$("#entry_status_03").bind('change', entryList.changeEntryOption);
	$("#entry_status_04").bind('change', entryList.changeEntryOption);
	$("#entry_status_05").bind('change', entryList.changeEntryOption);
	// 見積書関連のイベント処理登録
	quoteInfo.eventBind();
});

//
// 案件入力、リスト表示に関する処理
//
var entryList = entryList || {};
entryList.currentEntry = {};			// 案件リストで選択中の案件情報
entryList.currentEntryNo = 0;			// 案件リストで選択中の案件の番号
entryList.currentClientListTabNo = 0;	// 得意先リストで選択中のタブ番号
entryList.currentClient = {};			// 選択中の得意先情報

// 得意先リストのタブ生成と選択イベントの設定
entryList.createClientListTabs = function () {
	$("#tabs-client").tabs({
		activate: function (event, ui) {
			entryList.currentClientListTabNo = ui.newTab.index();
		}
	});
};
// メッセージ表示用ダイアログの生成
entryList.createMessageDialog = function () {
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
// 案件入力用ダイアログの生成
entryList.createEntryDialog = function () {
	$('#entry_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 840,
		title: '案件情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (entryList.saveEntry()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (entryList.saveEntry()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};


// クライアント選択用ダイアログの生成
entryList.createClientListDialog = function () {
	$('#client_list_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 600,
		title: '受注先選択',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"選択": function () {
				//if (selectFunc()) {
					$(this).dialog('close');
				//}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

entryList.createGrid = function () {
	var delchk = ($("#entry_delete_check_disp").prop("checked")) ? 1:0;
	var sts01 = ($("#entry_status_01").prop("checked")) ? '01':'0';
	var sts02 = ($("#entry_status_02").prop("checked")) ? '02':'0';
	var sts03 = ($("#entry_status_03").prop("checked")) ? '03':'0';
	var sts04 = ($("#entry_status_04").prop("checked")) ? '04':'0';
	var sts05 = ($("#entry_status_05").prop("checked")) ? '05':'0';
	// 案件リストのグリッド
	jQuery("#entry_list").jqGrid({
		url: '/entry_get/?delete_check=' + delchk + '&entry_status_01=' + sts01 + '&entry_status_02=' + sts02 + '&entry_status_03=' + sts03 + '&entry_status_04=' + sts04 + '&entry_status_05=' + sts05,
		altRows: true,
		datatype: "json",
		colNames: ['案件No','','クライアント名','','クライアント部署','','','','','','','','','','クライアント担当者','','試験タイトル','問合せ日', '案件ステータス', '営業担当者','見積番号'
				,'受注日','仮受注チェック','受託区分','', '試験大分類', '試験中分類','試験担当者','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'entry_no', index: 'entry_no', width: 80, align: "center" },
			{ name: 'client_cd', index: '', hidden:true },
			{ name: 'client_name_1', index: 'client_name_1', width: 200, align: "center" },
			{ name: 'client_division_cd', index: '', hidden:true },
			{ name: 'client_division_name', index: 'client_division_name', width: 200, align: "center" },
			{ name: 'client_address_1', index: '', hidden:true },
			{ name: 'client_address_2', index: '', hidden:true },
			{ name: 'client_division_address_1', index: '', hidden:true },
			{ name: 'client_division_address_2', index: '', hidden:true },
			{ name: 'client_tel_no', index: '', hidden:true },
			{ name: 'client_fax_no', index: '', hidden:true },
			{ name: 'client_division_tel_no', index: '', hidden:true },
			{ name: 'client_division_fax_no', index: '', hidden:true },
			{ name: 'client_person_id', index: '', hidden:true },
			{ name: 'client_person_name', index: 'client_person_name', width: 200, align: "center" },
			{ name: 'client_person_compellation', index: 'client_person_compellation', hidden:true},
			{ name: 'entry_title', index: 'entry_title', width: 200, align: "center" },
			{ name: 'inquiry_date', index: 'inquiry_date', width: 80, align: "center" },
			{ name: 'entry_status', index: 'entry_status', width: 100 ,formatter: entryList.statusFormatter},
			{ name: 'sales_person_id', index: 'sales_person_id', width: 100, align: "center", formatter: entryList.personFormatter },
			{ name: 'quoto_no', index: 'quoto_no', width: 80, align: "center" },
			{ name: 'order_accepted_date', index: 'order_accepted_date', width: 80, align: "center" },
			{ name: 'order_accept_check', index: 'order_accept_check', width: 80, align: "center" },
			{ name: 'order_type', index: 'order_type', width: 100, align: "center" },
			{ name: 'test_large_class_cd', index: 'test_large_class_name', hidden:true },
			{ name: 'test_large_class_name', index: 'test_large_class_name', width: 100, align: "center" },
			{ name: 'test_middle_class_name', index: 'test_middle_class_name', width: 100, align: "center" },
			{ name: 'test_person_id', index: 'test_person_id', width: 100, align: "center", formatter: entryList.personFormatter },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' , align: "center", formatter: entryList.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', align: "center", formatter: entryList.personFormatter  },
		],
		height:"230px",
		//width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10],
		pager: '#entry_pager',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "desc",
		caption: "案件リスト",
		onSelectRow:entryList.onSelectEntry
	});
	jQuery("#entry_list").jqGrid('navGrid', '#entry_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
entryList.createClientList = function() {
	// 得意先リスト画面生成
	clientList.init(false);
	// 得意先選択ダイアログ用のタブ生成
	clientList.createClientListTabs();
	// 得意先,部署、担当者グリッドの生成
	for (var i = 1; i <= 12; i++) {
		clientList.createClientListGrid(i);
		clientList.createClientDivisionListGrid(i, "0");
		clientList.createClientPersonListGrid(i, "0", "0");
	}
}

// 得意先選択ダイアログの選択ボタン押下イベント処理
entryList.selectClient = function () {
	$("#client_cd").val(clientList.currentClient.client_cd);
	$("#client_name").val(clientList.currentClient.name_1);
	$("#client_division_cd").val(clientList.currentClientDivision.division_cd);
	$("#client_division_name").val(clientList.currentClientDivision.name);
	$("#client_person_id").val(clientList.currentClientPerson.person_id);
	$("#client_person_name").val(clientList.currentClientPerson.name);
	return true;
};

entryList.personFormatter = function (cellval, options, rowObject) {
	var name = "";
	if (cellval === "drc_admin") {
		return "管理者";
	}
	for (var i in scheduleCommon.user_list) {
		if (cellval === scheduleCommon.user_list[i].uid) {
			name = scheduleCommon.user_list[i].name;
			break;
		}
	}
	return name;
};
// 拠点CD
entryList.base_cdFormatter = function (cellval, options, rowObject) {
	return scheduleCommon.getBase_cd(cellval);
};
// 案件ステータスのフォーマッター
entryList.statusFormatter = function (cellval, options, rowObject) {
	return scheduleCommon.getEntry_status(cellval);
};
// 編集用ダイアログの表示
entryList.openEntryDialog = function (event) {
	// フォームをクリアする
	var entry = entryList.clearEntry();
	entryList.setEntryForm(entry);
	$("#test_middle_class_list").text("");
	if ($(event.target).attr('id') == 'edit_entry') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		var no = entryList.getSelectEntry();
		entryList.requestEntryData(no);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}

	$("#entry_dialog").dialog("open");
};
// クライアント参照ダイアログ表示
entryList.openClientListDialog = function (event) {
	entryList.createClientList();
	$("#client_list_dialog").dialog({
		buttons: {
			"選択": function () {
				if (event.target.id == 'client_name') {
					if (entryList.selectClient()) {
						$(this).dialog('close');
						scheduleCommon.changeFontSize();
					}
				} else {
					if (billingList.selectClient()) {
						$(this).dialog('close');
						scheduleCommon.changeFontSize();
					}
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
				scheduleCommon.changeFontSize();
			}
		}
	});
	$("#client_list_dialog").dialog("open");
};
// 案件データの読込み
entryList.requestEntryData = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/entry_get/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = entryList.onloadEntryReq;
	xhr.send();
};
// 受注確定になっている見積情報を取得する
entryList.requestQuoteInfo = function(entry_no, large_item_cd) {
	$.ajax({
		url: '/quote_specific_get_list/' + entry_no + '?large_item_cd=' + large_item_cd,
		cache: false,
		dataType: 'json',
		success: function (quote_list) {
			entryList.setQuoteInfo(quote_list);
		}
	});

};
entryList.setQuoteInfo = function (quote_list) {
	if (quote_list != null) {
		var rows = quote_list.rows;
		if (rows.length > 0) {
			$("#quote_no").val(rows[0].quote_no);
			var list = "";
			for (var i = 0;i <  rows.length;i++) {
				list += rows[i].test_middle_class_name + "\n";
			}
			$("#test_middle_class_list").text(list);
		}
	}
};

// 案件データの保存
entryList.saveEntry = function () {
		// 入力値チェック
		if (!entryList.entryInputCheck()) {
			return false;
		}
		// checkboxのチェック状態確認と値設定
		entryList.checkCheckbox();
		// formデータの取得
		var form = entryList.getFormData();
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/entry_post', true);
		xhr.responseType = 'json';
		xhr.onload = entryList.onloadEntrySave;
		xhr.send(form);
		return true;
};

// checkboxのチェック状態確認と値設定
entryList.checkCheckbox = function () {
	if ($("#delete_check").prop("checked")) {
		$("#delete_check").val('1');
	}
	if ($("#input_check:checked").val()) {
		$("#input_check").val('1');
	}
	if ($("#confirm_check:checked").val()) {
		$("#confirm_check").val('1');
	}
};
entryList.entryInputCheck = function () {
	var result = false;
	var err = "";
	if (! $("#entryForm")[0].checkValidity) {
		return true;
	}
	// HTML5のバリデーションチェック
	if ($("#entryForm")[0].checkValidity()) {
		result = true;
	} else {
		var ctrls = $("#entryForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (! ctl.validity.valid) {
				if (ctl.id == "entry_title") {
					err = "試験タイトルの入力値を確認して下さい";
				} else if (ctl.id == "entry_amount_price") {
					err = "合計金額の入力値を確認して下さい";
					break;
				} else if (ctl.id == "entry_amount_billing") {
					err = "請求合計の入力値を確認して下さい";
					break;
				} else if (ctl.id == "entry_amount_deposit") {
					err = "入金合計の入力値を確認して下さい";
					break;
				} else if (ctl.id == "entry_memo") {
					err = "備考の文字数を確認して下さい";
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

// formデータの取得
entryList.getFormData = function () {
	var form = new FormData(document.querySelector("#entryForm"));

	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#delete_check").prop("checked")) {
		form.append('delete_check', '0');
	}
	if (!$("#input_check").prop("checked")) {
		form.append('input_check', '0');
	}
	if (!$("#confirm_check").prop("checked")) {
		form.append('confirm_check', '0');
	}
	return form;
};

// 案件データ保存後のコールバック
entryList.onloadEntrySave = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		$("#entry_list").GridUnload();
		entryList.createGrid();
	}
};
// 案件データ取得リクエストのコールバック
entryList.onloadEntryReq = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		// formに取得したデータを埋め込む
		entryList.setEntryForm(entry);
		$("#entry_memo_ref").text(entry.entry_memo);		
		// 見積情報の取得
		entryList.requestQuoteInfo(entry.entry_no, entry.test_large_class_cd);		
	}
};

// 案件データをフォームにセットする
entryList.setEntryForm = function (entry) {
	$("#entry_no").val(entry.entry_no);					// 案件No
	$("#quote_no").val(entry.quote_no);					// 見積番号
	$("#inquiry_date").val(entry.inquiry_date);			// 問合せ日
	$("#entry_status").val(entry.entry_status);			// 案件ステータス
	$("#sales_person_id").val(entry.sales_person_id);	// 案件ステータス
//	$("#quote_issue_date").val(entry.quote_issue_date); // 見積書発行日
	$("#agent_cd").val(entry.agent_cd);					// 代理店コード
	$("#client_cd").val(entry.client_cd);				// 得意先コード
	var name_1 = entry.client_name_1;
	var name_2 = entry.client_name_2;
	$("#client_name").val(name_1 );								// 得意先名1
	$("#client_division_cd").val(entry.client_division_cd);		// 所属部署CD
	$("#client_division_name").val(entry.client_division_name);	// 所属部署名
	$("#client_person_id").val(entry.client_person_id);			// 担当者ID
	$("#client_person_name").val(entry.client_person_name);		// 担当者名

	$("#test_large_class_cd").val(entry.test_large_class_cd);		// 試験大分類CD
	$("#test_large_class_name").val(entry.test_large_class_name);	// 試験大分類名
	$("#test_middle_class_cd").val(entry.test_middle_class_cd);		// 試験中分類CD
	$("#test_middle_class_name").val(entry.test_middle_class_name);	// 試験中分類名
	$("#entry_title").val(entry.entry_title);						// 案件名
	
	$("#order_accepted_date").val(entry.order_accepted_date);	// 受注日付
	$("#order_accept_check").val(entry.order_accept_check);		// 仮受注日チェック
	$("#acounting_period_no").val(entry.acounting_period_no);	// 会計期No
	$("#order_type").val(entry.order_type);						// 受託区分
	$("#contract_type").val(entry.contract_type);				// 契約区分
	$("#outsourcing_cd").val(entry.outsourcing_cd);				// 委託先CD
	$("#entry_amount_price").val(entry.entry_amount_price);		// 案件合計金額
	$("#entry_amount_billing").val(entry.entry_amount_billing);	// 案件請求合計金額
	$("#entry_amount_deposit").val(entry.entry_amount_deposit); // 案件入金合計金額
	$("#test_person_id").val(entry.test_person_id);				// 試験担当者ID
	
	$("#report_limit_date").val(entry.report_limit_date);		// 報告書提出期限
	$("#report_submit_date").val(entry.report_submit_date);		// 報告書提出日
	$("#prompt_report_limit_date_1").val(entry.prompt_report_limit_date_1);		// 速報提出期限1
	$("#prompt_report_submit_date_1").val(entry.prompt_report_submit_date_1);	// 速報提出日1
	$("#prompt_report_limit_date_2").val(entry.prompt_report_limit_date_2);		// 速報提出期限2
	$("#prompt_report_submit_date_2").val(entry.prompt_report_submit_date_2);	// 速報提出日2

	$("#entry_memo").val(entry.entry_memo);						// 備考
	if (entry.delete_check == 1) {
		$("#delete_check").prop("checked", true);				// 削除フラグ
	} else {
		$("#delete_check").prop("checked", false);				// 削除フラグ
	}
	$("#delete_reason").val(entry.delete_reason);				// 削除理由
	$("#input_check_date").val(entry.input_check_date);			// 入力日
	if (entry.input_check == 1) {
		$("#input_check").prop("checked",true);					// 入力完了チェック
	} else {
		$("#input_check").prop("checked", false);				// 入力完了チェック
	}
	$("#input_operator_id").val(entry.input_operator_id);		// 入力者ID
	$("#confirm_check_date").val(entry.confirm_check_date);		// 確認日
	if (entry.confirm_check == 1) {
		$("#confirm_check").prop("checked",true);				// 確認完了チェック
	} else {
		$("#confirm_check").prop("checked", false);				// 確認完了チェック
	}
	$("#confirm_operator_id").val(entry.confirm_operator_id);	// 確認者ID
	$("#created").val(entry.created);							// 作成日
	$("#created_id").val(entry.created_id);						// 作成者ID
	$("#updated").val(entry.updated);							// 更新日
	$("#updated_id").val(entry.updated_id);						// 更新者ID
};
entryList.clearEntry = function () {
	var entry = {} ;
	entry.entry_no = "";			// 案件No
	entry.entry_title = "";			// 案件名
	entry.inquiry_date = "";		// 問合せ日
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
	entry.entry_amount_price = 0;	// 案件合計金額
	entry.entry_amount_price = 0;	// 案件請求合計金額
	entry.entry_amount_billing = 0; // 案件入金合計金額
	entry.test_person_id = "";		// 試験担当者ID
	entry.report_limit_date = "";				// 報告書提出期限
	entry.report_submit_date = "";				// 報告書提出日
	entry.prompt_report_limit_date_1 = "";		// 速報提出期限1
	entry.prompt_report_submit_date_1 = "";		// 速報提出日1
	entry.prompt_report_limit_date_2 = "";		// 速報提出期限2
	entry.prompt_report_submit_date_2 = "";		// 速報提出日2
	entry.entry_memo = "";			// メモ
	entry.delete_check = 0;			// 削除フラグ
	entry.delete_reason = "";		// 削除理由
	entry.input_check_date = "";	// 入力日
	entry.input_check = 0;			// 入力完了チェック
	entry.input_operator_id = "";	// 入力者ID
	entry.confirm_check_date = "";	// 確認日
	entry.confirm_check = 0;		// 確認完了チェック
	entry.confirm_operator_id = ""; // 確認者ID
	entry.created = "";				// 作成日
	entry.created_id = "";			// 作成者ID
	entry.updated = "";				// 更新日
	entry.updated_id = "";			// 更新者ID
	return entry;
};

// 案件リストで選択中の案件番号を取得する
entryList.getSelectEntry = function () {
	var no = "";
	var id = $("#entry_list").getGridParam('selrow');
	if (id != null) {
		var row = $("#entry_list").getRowData(id);
		no = row.entry_no;
	}
	return no;
};

// 案件リストの選択イベント処理
entryList.onSelectEntry = function (rowid) {
	if (rowid != null) {
		var row = $("#entry_list").getRowData(rowid);
		var no = row.entry_no;
		quoteInfo.enableQuoteButtons(true,1);
		// グリッドの再表示
		$("#quote_list").GridUnload();
		quoteInfo.createQuoteInfoGrid(row.entry_no);
		$("#quote_specific_list").GridUnload();
		quoteInfo.createQuoteSpecificGrid(row.entry_no,0);
		entryList.currentEntryNo = row.entry_no;
		entryList.currentEntry = row;
		// 請求情報表示ボタンを表示する
		$("#entry_billing").css("visibility","visible");
		$("#edit_entry").css("visibility","visible");
		entryList.requestEntryData(row.entry_no);
	}

};

// 削除分の表示チェックイベント（案件）
entryList.changeEntryOption = function (event) {
	$("#entry_list").GridUnload();
	entryList.createGrid();
	$("#quote_list").GridUnload();
	quoteInfo.createQuoteInfoGrid(0);
	$("#quote_specific_list").GridUnload();
	quoteInfo.createQuoteSpecificGrid(0,0);

	$("#entry_billing").css("visibility","hidden");
	$("#edit_entry").css("visibility","hidden");
	quoteInfo.enableQuoteButtons(false,0);
};
