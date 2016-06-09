//
// DRC殿試験案件スケジュール管理
// 案件リスト画面の処理
//
$(function ()　{
    'use strict';
  // 権限チェック
  entryList.checkAuth();
	// 自社情報の取得
	quoteInfo.getMyInfo();
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo("");
	// 案件リストのタブ生成
	$("#tabs").tabs();
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	entryList.createMessageDialog();
	// 編集用ダイアログの設定
	entryList.createEntryDialog();				// 案件入力用
	quoteInfo.createQuoteFormDialog();			// 見積書発行用
	entryList.createClientListDialog();			// 得意先選択用
  entryList.createClientList(0);
	test_itemList.createTestItemSelectDialog();	// 試験分類選択用
	billingList.createBillingListDialog();		// 請求情報リスト用
	billingList.createBillingFormDialog();		// 請求情報編集選択用
	// 検索用オプションの初期化
	$("#entry_status_01").prop("checked", true);
	$("#entry_status_02").prop("checked", true);
	$("#entry_status_03").prop("checked", true);
	$("#entry_status_04").prop("checked", false);
	$("#entry_status_05").prop("checked", false);
  // 試験大分類リストの取得とセット
  entryList.getLargeItemList();
	// グリッドの生成
	//entryList.createGrid();						// 案件リストの生成はentryList.onGetLargeItemListへ移動した
	quoteInfo.createQuoteInfoGrid(0);			// 見積リスト
	quoteInfo.createQuoteSpecificGrid(0,0);		// 見積明細リスト
	test_itemList.createTestLargeGrid();		// 試験大分類リスト
	test_itemList.createTestMiddleGrid(0);		// 試験中分類リスト

	scheduleCommon.changeFontSize();
	// 案件追加ボタンイベント（登録・編集用画面の表示）
	$("#add_entry").bind('click' , {}, entryList.openEntryDialog);
	// 案件編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_entry").bind('click' , {}, entryList.openEntryDialog);
	$("#edit_entry").css("display","none");
	// 見積追加ボタンイベント（登録・編集用画面の表示）
	$("#add_quote").bind('click' ,  {entryList:entryList}, quoteInfo.openQuoteFormDialog);
	// 見積編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_quote").bind('click' , {entryList:entryList}, quoteInfo.openQuoteFormDialog);

	// クライアント選択ダイアログを表示するイベント処理を登録する
	$("#client_name").bind('click' , {}, entryList.openClientListDialog);
	$("#billing_client_name").bind('click' , {}, entryList.openClientListDialog);
	$("#billing_company_name_1").bind('click' , {}, entryList.openClientListDialog);	// 見積書画面
	$("#agent_name").bind('click' , {}, entryList.openClientListDialog);
	$("#outsourcing_name").bind('click' , {}, entryList.openItakusakiListDialog);	// 委託先

	// 試験中分類選択ダイアログを表示するイベント処理を登録する
	$("#test_middle_class_name").bind('click',{}, test_itemList.openTestItemSelectDialog);
	$("#test_large_class_name").bind('click',{}, test_itemList.openTestItemSelectDialog);

	// 請求情報ボタンイベント（登録・編集用画面の表示）
	$("#entry_billing").bind('click' , {entryList:entryList}, billingList.openBillingListDialog);
	$("#entry_billing").css("display","none");
	// 請求情報追加ボタンイベント（登録・編集用画面の表示）
	$("#add_billing").bind('click' , {}, billingList.openBillingFormDialog);
	// 請求先編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_billing").bind('click' , {}, billingList.openBillingFormDialog);
	$("#edit_billing").css("display","none");
	// 請求情報画面の参照ボタン(案件情報の参照）
	$("#ref_entry").bind('click' , {}, entryList.openEntryDialog);

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
	// 請求情報入力画面のイベント処理登録
	billingList.eventBind();
});

//
// 案件入力、リスト表示に関する処理
//
var entryList = entryList || {};

entryList.currentEntry = {};			// 案件リストで選択中の案件情報
entryList.currentEntryNo = 0;			// 案件リストで選択中の案件の番号
entryList.currentClientListTabNo = 0;	// 得意先リストで選択中のタブ番号
entryList.currentClient = {};			// 選択中の得意先情報
entryList.auth_entry_add = 0;			// 権限
entryList.auto_quote_add = 0;			// 権限
entryList.auth_entry_edit = 0;			// 権限
entryList.auto_quote_edit = 0;			// 権限

entryList.large_item_list = null;
// 権限チェック
entryList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f07") {
			entryList.auth_entry_add = auth.value;
			if (auth.value == 2) {
				$("#add_entry").css("display","inline");
			} else {
				$("#add_entry").css("display","none");
			}
		}
		if (auth.name == "f08") {
			entryList.auth_entry_edit = auth.value;
			if (auth.value == 2) {
				$("#edit_entry").css("display","inline");
			} else {
				$("#edit_entry").css("display","none");
			}
		}
		if (auth.name == "f09") {
			entryList.auth_quote_add = auth.value;
			if (auth.value == 2) {
				$("#add_quote").css("display","inline");
			} else {
				$("#add_quote").css("display","none");
			}
		}
		if (auth.name == "f10") {
			entryList.auth_quote_edit = auth.value;
			if (auth.value == 2) {
				$("#edit_quote").css("display","inline");
			} else {
				$("#edit_quote").css("display","none");
			}
		}
	}
};

// 案件リストの再ロード
entryList.reloadGrid = function() {
	entryList.refreshEntryGridAfter();	// グリッド初期化後の処理
	$("#entry_list").GridUnload();
	entryList.createGrid();
	$("#quote_list").GridUnload();
	quoteInfo.createQuoteInfoGrid(0);
	$("#quote_specific_list").GridUnload();
	quoteInfo.createQuoteSpecificGrid(0,0);

	entryList.refreshEntryGridAfter();	// グリッド初期化後の処理
	quoteInfo.enableQuoteButtons(false,0);
};

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
		width: 900,
		height: 900,
		title: '案件情報',
		closeOnEscape: false,
		modal: true,
        buttons:[
          {
              text: '複写',
              class:'btn-entry_copy',
              click: function() {
                  entryList.copyEntry();
              }
          },
          {
              text: '追加',
              class:'btn-entry_add',
              click: function() {
                  if (entryList.saveEntry()) {
                    $(this).dialog('close');
                  }
              }
          },
            {
                text: '更新',
                class:'btn-entry_update',
                click: function() {
                    //ボタンを押したときの処理
          					if (entryList.saveEntry()) {
          						$(this).dialog('close');
          					}
                }
            },
            {
                text: '閉じる',
                class:'btn-close',
                click: function() {
                    $(this).dialog('close');
                }
            }
		]
	});
};


// クライアント選択用ダイアログの生成
entryList.createClientListDialog = function () {
	$('#client_list_dialog').dialog({
		autoOpen: false,
		width: '90%',
		height: '900',
		title: '顧客リスト',
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
  // 試験大分類の絞り込み用チェックボックスの状態を取得
  var large_items = entryList.getLargeItem_check();
  var req_url = '/entry_get/?delete_check=' + delchk + '&entry_status_01=' + sts01
                                                    + '&entry_status_02=' + sts02
                                                    + '&entry_status_03=' + sts03
                                                    + '&entry_status_04=' + sts04
                                                    + '&entry_status_05=' + sts05;
  // 試験大分類の絞り込み
  for(var i = 0;i < large_items.length;i++) {
    var item = large_items[i];
    req_url += "&" + item.item_cd + "=" + item.value;
  }
	// 案件リストのグリッド
	jQuery("#entry_list").jqGrid({
		url: req_url,
		altRows: true,
		datatype: "json",
		colNames: ['請求区分','請求区分_1','未入金','報告書期限','report_submit_date','案件No', 'test_large_class_cd','試験大分類', '試験中分類','client_cd','クライアント名','client_division_cd','クライアント部署'
				,'client_address_1','client_address_2','client_division_address_1','client_division_address_2'
				,'client_tel_no','client_fax_no','client_division_tel_no','client_division_fax_no','client_person_id'
				,'クライアント担当者','client_person_compellation','代理店','試験タイトル','問合せ日', '案件ステータス', '営業担当者'
				,'受注日','仮受注チェック','受託区分','試験担当者','消費税率','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'pay_result', index: 'pay_result', width: 80, align: "center" ,sortable:true, formatter: entryList.payResultFormatter,searchoptions:{sopt:["eq","ne"]}},
			{ name: 'pay_result_1', hidden:true},
			{ name: 'pay_complete', index: 'pay_complete', width: 80, align: "center" ,sortable:true, formatter: entryList.payCompleteFormatter,searchoptions:{sopt:["eq","ne"]}},
			{ name: 'report_limit_date', index: 'report_limit_date', width: 120, align: "center" ,sortable:true, formatter: entryList.reportLimitFormatter},
			{ name: 'report_submit_date', index: '', hidden:true },
			{ name: 'entry_no', index: 'entry_no', width: 100, align: "center" ,sortable:true},
			{ name: 'test_large_class_cd', index: 'test_large_class_name', hidden:true },
			{ name: 'test_large_class_name', index: 'test_large_class_name', width: 160, align: "center" },
			{ name: 'test_middle_class_name', index: 'test_middle_class_name', width: 160, align: "center" },
			{ name: 'client_cd', index: '', hidden:true },
			{ name: 'client_name_1', index: 'client_name_1', width: 160, align: "center" ,sortable:true},
			{ name: 'client_division_cd', index: '', hidden:true },
			{ name: 'client_division_name', index: 'client_division_name', width: 160, align: "center" , hidden:true},
			{ name: 'client_address_1', index: '', hidden:true },
			{ name: 'client_address_2', index: '', hidden:true },
			{ name: 'client_division_address_1', index: '', hidden:true },
			{ name: 'client_division_address_2', index: '', hidden:true },
			{ name: 'client_tel_no', index: '', hidden:true },
			{ name: 'client_fax_no', index: '', hidden:true },
			{ name: 'client_division_tel_no', index: '', hidden:true },
			{ name: 'client_division_fax_no', index: '', hidden:true },
			{ name: 'client_person_id', index: '', hidden:true },
			{ name: 'client_person_name', index: 'client_person_name', width: 200, align: "center" , hidden:true},
			{ name: 'client_person_compellation', index: 'client_person_compellation', hidden:true},
      { name: 'agent_name_1', index: 'agent_name_1', width: 160, align: "center" ,sortable:true},
			{ name: 'entry_title', index: 'entry_title', width: 200, align: "center" },
			{ name: 'inquiry_date', index: 'inquiry_date', width: 80, align: "center" },
			{ name: 'entry_status', index: 'entry_status', width: 100 ,align: "center" ,formatter: entryList.statusFormatter,searchoptions:{sopt:["eq","ne"]}},
			{ name: 'sales_person_id', index: 'sales_person_id', width: 100, align: "center", formatter: scheduleCommon.personFormatter,search:false },
//			{ name: 'quoto_no', index: 'quoto_no', width: 80, align: "center" },
			{ name: 'order_accepted_date', index: 'order_accepted_date', width: 80, align: "center" , hidden:true},
			{ name: 'order_accept_check', index: 'order_accept_check', width: 80, align: "center" ,formatter: entryList.orderAcceptFormatter,searchoptions:{sopt:["eq","ne"]}},
			{ name: 'order_type', index: 'order_type', width: 100, align: "center" ,formatter:entryList.orderTypeFormatter, hidden:true},
			{ name: 'test_person_id', index: 'test_person_id', width: 100, align: "center", formatter: scheduleCommon.personFormatter, hidden:true },
			{ name: 'consumption_tax', index: '', hidden:true },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' , align: "center", formatter: scheduleCommon.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', align: "center", formatter: scheduleCommon.personFormatter  },
		],
		height:240,
		//width:960,
		shrinkToFit:false,
		rowNum: 10,
		rowList: [10,20,30,40,50],
		pager: '#entry_pager',
		sortname: 'entry_no',
		viewrecords: true,
		sortorder: "desc",
		caption: "案件リスト",
		onSelectRow:entryList.onSelectEntry,
    loadComplete:entryList.loadCompleteEntryList
	});
	jQuery("#entry_list").jqGrid('navGrid', '#entry_pager', { edit: false, add: false, del: false});
	scheduleCommon.changeFontSize();
};
// loadCompleイベント処理（表示行数に合わせてグリッドの高さを変える）
entryList.loadCompleteEntryList = function(data) {
  var rowNum = Number($("#entry_list").getGridParam('rowNum'));
  $("#entry_list").setGridHeight(rowNum * 24);
}
entryList.createClientList = function(func) {
	// 得意先リスト画面生成
	clientList.func = func;	// 2016.01.29 t.tanaka
	//clientList.init(true);
  clientList.checkAuth();
	// 得意先選択ダイアログ用のタブ生成
	clientList.createClientListTabs();
	// 得意先,部署、担当者グリッドの生成
	for (var i = 1; i <= 1; i++) {
		clientList.createClientListGrid(i);
		clientList.createClientDivisionListGrid(i, "0");
		clientList.createClientPersonListGrid(i, "0", "0");
	}
  // 編集用ダイアログの設定
	clientList.createClientDialog('client','得意先情報',clientList.saveClient);
	clientList.createClientDialog('client_division','部署情報',clientList.saveClientDivision);
	clientList.createClientDialog('client_person','担当者情報',clientList.saveClientPerson);
}

// 得意先選択ダイアログの選択ボタン押下イベント処理
entryList.selectClient = function () {
	$("#entry_client_cd").val(clientList.currentClient.client_cd);
	$("#client_name").val(clientList.currentClient.name_1);
	$("#client_division_cd").val(clientList.currentClientDivision.division_cd);
	$("#client_division_name").val(clientList.currentClientDivision.name);
	$("#client_division_memo").val(clientList.currentClientDivision.memo);
	$("#client_person_id").val(clientList.currentClientPerson.person_id);
	$("#client_person_name").val(clientList.currentClientPerson.name);
	$("#client_person_memo").val(clientList.currentClientPerson.memo);
	return true;
};
// 見積書画面でのあて先選択時のイベント処理
entryList.selectQuoteClient = function () {
	$("#billing_company_cd").val(clientList.currentClient.client_cd);
	$("#billing_company_name_1").val(clientList.currentClient.name_1);
	$("#billing_division").val(clientList.currentClientDivision.name);
	$("#billing_person").val(clientList.currentClientPerson.name);
	return true;
};

entryList.selectAgent = function () {
	$("#agent_cd").val(clientList.currentClient.client_cd);
	$("#agent_name").val(clientList.currentClient.name_1);
	$("#agent_division_cd").val(clientList.currentClientDivision.division_cd);
	$("#agent_division_name").val(clientList.currentClientDivision.name);
	$("#agent_division_memo").val(clientList.currentClientDivision.memo);
	$("#agent_person_id").val(clientList.currentClientPerson.person_id);
	$("#agent_person_name").val(clientList.currentClientPerson.name);
	$("#agent_person_memo").val(clientList.currentClientPerson.memo);
	return true;
};
entryList.selectOutsourcing = function () {
	$("#outsourcing_cd").val(clientList.currentClient.client_cd);
	$("#outsourcing_name").val(clientList.currentClient.name_1);
	return true;
};
// 請求可のフォーマッター
entryList.payResultFormatter = function (cellval, options, rowObject) {
	var result = "<label style='color:red;font-weight:bold;'>未登録</>";
	if (cellval != null) {
		switch(cellval) {
			case 0:result = "請求待ち";
			break;
			case 1:result = "請求可";
			break;
			case 2:result = "請求済";
			break;
			case 3:result = "入金済";
			break;
		}
		if (rowObject.pay_result_1 > 0) {	// 請求可があればそれを優先する
			result = "請求可";
		}
	}
	return result;
};
// 未入金のフォーマッター
entryList.payCompleteFormatter = function (cellval, options, rowObject) {
	var result = "";
	if ((cellval != null) && (cellval != "")) {
		// 入金確認済みになっていないか、または入金確認済でも入金額が請求額より少ない請求情報の件数を取得できた
		result = "<label style='color:red;font-weight:bold;'>有(" + cellval + ")</>";
	}
	return result;
};

// 報告遅延のフォーマッター
entryList.reportLimitFormatter = function (cellval, options, rowObject) {
	var result = "";
	if ((cellval != null) && (cellval != "")) {
		result = cellval;
		// 報告書期限設定あり
		var today = scheduleCommon.getToday("{0}/{1}/{2}");
		var count = scheduleCommon.calcDateCount(today, cellval);
		if (count <= 0) {
			// 提出期限を過ぎている
			if ((rowObject.report_submit_date == null) || (rowObject.report_submit_date == "")) {
				// 提出日が入力されていない
				result = "<label style='color:red;font-weight:bold;'>【遅延】 " + cellval + "</>";
			}
		}
	}
	return result;
};

// 案件ステータスのフォーマッター
entryList.statusFormatter = function (cellval, options, rowObject) {
	return scheduleCommon.getEntry_status(cellval);
};
// 仮受注チェックのフォーマッター
entryList.orderAcceptFormatter = function (cellval, options, rowObject) {
	if (cellval == 0)
		return "本登録";
	else
		return "仮登録";
};
// 受託区分チェックのフォーマッター
entryList.orderTypeFormatter = function (cellval, options, rowObject) {
	if (cellval == 1)
		return "社内実施";
	else if (cellval == 2)
		return "外部国内";
	else if (cellval == 3)
		return "外部海外";
};
// 編集用ダイアログの表示
entryList.openEntryDialog = function (event) {
	$("#entry_dialog").dialog({modal:true,title:"案件情報"});	// デフォルトはモーダル
	// フォームをクリアする
	var entry = entryList.clearEntry();
	entryList.setEntryForm(entry);
	$("#test_middle_class_list").val("");
	if ($(event.target).attr('id') == 'edit_entry') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		var no = entryList.getSelectEntry();
		entryList.requestEntryData(no);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		// 権限チェック
		if (entryList.auth_entry_edit == 2) {
      $(".ui-dialog-buttonpane button:contains('複写')").button("enable");
      $(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		} else {
			$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
      $(".ui-dialog-buttonpane button:contains('複写')").button("disable");
		}
	} else if ($(event.target).attr('id') == 'add_entry') {
		// 追加ボタンの処理
		// 権限チェック
		if (entryList.auth_entry_add == 2) {
			$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		} else {
			$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		}
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
    $(".ui-dialog-buttonpane button:contains('複写')").button("disable");
	} else if ($(event.target).attr('id') == 'ref_entry') {
		// 請求情報画面からの参照
		$("#entry_dialog").dialog({modal:false});	// 参照の時はモードレス
		var no = entryList.getSelectEntry();
		entryList.requestEntryData(no);
		$(".btn-entry_add").button("disable");
    $(".btn-entry_update").button("disable");
    $(".btn-entry_copy").button("disable");
	}

	$("#entry_dialog").dialog("open");
};
// クライアント参照ダイアログ表示
entryList.openClientListDialog = function (event) {
	// アイウエオ順のタブと中のグリッドの生成
	entryList.createClientList(0);
	$("#client_list_dialog").dialog({
		buttons: {
			"選択": function () {
				if (event.target.id == 'client_name') {
					if (entryList.selectClient()) {
						$(this).dialog('close');
					}
				} else if (event.target.id == 'billing_client_name') {
					if (billingList.selectClient()) {
						$(this).dialog('close');
					}
				} else if (event.target.id == 'billing_company_name_1') {
					// 見積書画面のあて先選択
					if (entryList.selectQuoteClient()) {
						$(this).dialog('close');
					}
				} else if (event.target.id == 'agent_name') {
					if (entryList.selectAgent()) {
						$(this).dialog('close');
					}
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
	$("#client_list_dialog").dialog("open");
};
// 委託先参照ダイアログ表示
entryList.openItakusakiListDialog = function (event) {
	// アイウエオ順のタブと中のグリッドの生成
	entryList.createClientList(1);
	$("#client_list_dialog").dialog({
		buttons: {
			"選択": function () {
					if (entryList.selectOutsourcing()) {
						$(this).dialog('close');
					}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
	$("#client_list_dialog").dialog("open");
};
// 案件データの読込み(案件番号指定）
entryList.requestEntryData = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/entry_get/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = entryList.onloadEntryReq;
	xhr.send();
};
entryList.requestBillingTotal = function (no) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/billing_get_total/' + no, true);
	xhr.responseType = 'json';
	xhr.onload = entryList.onloadBillingTotalReq;
	xhr.send();
};
// 受注確定になっている見積情報を取得する
entryList.requestQuoteInfo = function(entry_no, large_item_cd, consumption_tax) {
	$.ajax({
		url: '/quote_specific_get_list_for_entryform/' + entry_no + '?large_item_cd=' + large_item_cd,
		cache: false,
		dataType: 'json',
		success: function (quote_list) {
			entryList.setQuoteInfo(quote_list, consumption_tax);
			// 請求情報から請求金額、入金金額合計を取得して表示
			entryList.requestBillingTotal(entry_no);
		}
	});

};

// 受注確定の見積データをフォームにセットする
entryList.setQuoteInfo = function (quote_list, consumption_tax) {
  entryList.currentEntry.entry_amount_price_notax = 0;	// 金額（税抜）
  entryList.currentEntry.entry_amount_price = 0;	// 金額（税込）
	if (quote_list != null) {
		var total_price = 0;
		var rows = quote_list.rows;
		if (rows.length > 0) {
			// 見積番号
			$("#quote_no").val(rows[0].quote_no);
			var list = "";
			// 見積金額合計計算
			for (var i = 0;i <  rows.length;i++) {
				list += rows[i].test_middle_class_name + "\n";
				total_price += Number(rows[i].price);
			}
			// 中分類リスト
			$("#test_middle_class_list").val(list);
			// 消費税込の合計金額
			tax = total_price * (rows[0].consumption_tax / 100);
			$("#entry_amount_price_notax").val(scheduleCommon.numFormatter(total_price,11));	// 金額(税抜)
			$("#entry_amount_tax").val(scheduleCommon.numFormatter(tax,11));					// 消費税
			$("#entry_amount_price").val(scheduleCommon.numFormatter(total_price + tax,11));	// 合計(税込)
			$("#entry_consumption_tax").val(rows[0].consumption_tax);							// 消費税率
			entryList.currentEntry.entry_amount_price_notax = total_price;	// 金額（税抜）
			entryList.currentEntry.entry_amount_price = total_price + tax;	// 金額（税込）
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
// 複写
entryList.copyEntry = function () {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#entry_dialog").dialog({title:"案件情報のコピー"});	// デフォルトはモーダル
  $("#copy_entry_no").val($("#entry_no").val());					// 案件No
  $("#entry_no").val("");
	$("#quote_no").val("");					// 見積番号
	$("#inquiry_date").val(today);			// 問合せ日
	$("#entry_status").val("01");			// 案件ステータス
  $("#sales_person_id").val($.cookie('userid'));	// 入力者ID
  $("#report_limit_date").val("");		// 報告書提出期限
	$("#report_submit_date").val("");		// 報告書提出日
	$("#prompt_report_limit_date_1").val("");		// 速報提出期限1
	$("#prompt_report_submit_date_1").val("");	// 速報提出日1
	$("#prompt_report_limit_date_2").val("");		// 速報提出期限2
	$("#prompt_report_submit_date_2").val("");	// 速報提出日2
  $("#order_accepted_date").val(""); // 受注日付
	$("#order_accept_check").val(0);	// 仮受注日チェック
  $("#entry_memo").val("");        // 備考
  $("#input_check_date").val(today);			// 入力日
  $("#input_operator_id").val($.cookie('userid'));	// 入力者ID
  $(".btn-entry_add").button("enable");
  $(".ui-dialog-buttonpane button:contains('更新')").button("disable");
  //$(".btn-entry_update").button("disable");
  $(".btn-entry_copy").button("disable");
};

// checkboxのチェック状態確認と値設定
entryList.checkCheckbox = function () {
	$("#delete_check").val(0);
	$("#input_check").val(0);
	$("#confirm_check").val(0);
	if ($("#delete_check:checked").val()) { //prop("checked")) {
		$("#delete_check").val(1);
	}
	if ($("#input_check:checked").val()) {
		$("#input_check").val(1);
	}
	if ($("#confirm_check:checked").val()) {
		$("#confirm_check").val(1);
	}
};

// フォームの入力値チェック
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
					break;
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
		entryList.reloadGrid();
	}
};
// 案件データ取得リクエストのコールバック
entryList.onloadEntryReq = function (e) {
	if (this.status == 200) {
		var entry = this.response;
		// 消費税率
		if (entry.consumption_tax == "") {
			// デフォルトでシステム設定値を入れる
			entry.consumption_tax = quoteInfo.drc_info.consumption_tax;
		}
		quoteInfo.currentConsumption_tax = entry.consumption_tax;
		entryList.currentEntry = entry;  // 選択中の案件データを保存
    // 請求金額の情報を初期化しておく
    //entryList.currentEntry.billing_amount_total_notax = 0;  // 請求金額（税抜）
    //entryList.currentEntry.entry_amount_billing = 0;       // 請求金額（税込）
    entryList.currentEntry.entry_amount_price_notax = 0;	 // 金額（税抜）
    //entryList.currentEntry.entry_amount_price = 0;	       // 金額（税込）
    //entryList.currentEntry.entry_amount_deposit = 0;      // 入金済金額（税込）
		// formに取得したデータを埋め込む
		entryList.setEntryForm(entry);
		$("#entry_memo_ref").text(entry.entry_memo);
		// 見積情報の取得
		entryList.requestQuoteInfo(entry.entry_no, entry.test_large_class_cd, entry.consumption_tax);
	}
};
// 請求金額、入金額取得リクエストのコールバック
entryList.onloadBillingTotalReq = function (e) {
	if (this.status == 200) {
		var billing = this.response;
		if (billing.amount_total != null) {
			$("#entry_amount_billing").val(scheduleCommon.numFormatter(billing.amount_total,11));
		}
		if (billing.complete_total != null) {
			$("#entry_amount_deposit").val(scheduleCommon.numFormatter(billing.complete_total,11));
		}
	}
};

// 案件データをフォームにセットする
entryList.setEntryForm = function (entry) {
  $("#copy_entry_no").val("");					       // 複写元案件No
  $("#entry_no").val(entry.entry_no);					// 案件No
	$("#quote_no").val(entry.quote_no);					// 見積番号
	$("#inquiry_date").val(entry.inquiry_date);			// 問合せ日
	$("#entry_status").val(entry.entry_status);			// 案件ステータス
	$("#sales_person_id").val(entry.sales_person_id);	// 案件ステータス
//	$("#quote_issue_date").val(entry.quote_issue_date); // 見積書発行日
	$("#agent_cd").val(entry.agent_cd);					// 代理店コード
	$("#agent_name").val(entry.agent_name_1);				// 代理店名
	$("#agent_division_cd").val(entry.agent_division_cd);		// 所属部署CD
	$("#agent_division_name").val(entry.agent_division_name);	// 所属部署名
	$("#agent_division_memo").val(entry.agent_division_memo);	// 所属部署メモ
	$("#agent_person_id").val(entry.agent_person_id);			// 担当者ID
	$("#agent_person_name").val(entry.agent_person_name);		// 担当者名
	$("#agent_person_memo").val(entry.agent_person_memo);		// 担当者メモ

	$("#entry_client_cd").val(entry.client_cd);				// 得意先コード
	$("#client_name").val(entry.client_name_1);								// 得意先名1
	$("#client_division_cd").val(entry.client_division_cd);		// 所属部署CD
	$("#client_division_name").val(entry.client_division_name);	// 所属部署名
	$("#client_division_memo").val(entry.client_division_memo);	// 所属部署メモ
	$("#client_person_id").val(entry.client_person_id);			// 担当者ID
	$("#client_person_name").val(entry.client_person_name);		// 担当者名
	$("#client_person_memo").val(entry.client_person_memo);		// 担当者メモ

	$("#test_large_class_cd").val(entry.test_large_class_cd);		// 試験大分類CD
	$("#test_large_class_name").val(entry.test_large_class_name);	// 試験大分類名
	$("#test_middle_class_cd").val(entry.test_middle_class_cd);		// 試験中分類CD
	$("#test_middle_class_name").val(entry.test_middle_class_name);	// 試験中分類名
	$("#entry_title").val(entry.entry_title);						// 案件名

	$("#order_accepted_date").val(entry.order_accepted_date);	// 受注日付
	// 仮受注チェック
	if (entry.order_accept_check === 0) {
			$("#order_accept_check_0").prop('checked', true);
	} else if (entry.order_accept_check === 1) {
		$("#order_accept_check_1").prop('checked', true);
	}
	$("#acounting_period_no").val(entry.acounting_period_no);	// 会計期No
	// 受託区分
	if (entry.order_type === 1) {
		$("#order_type_01").prop('checked', true);
	} else if (entry.order_type === 2) {
		$("#order_type_02").prop('checked', true);
	} else if (entry.order_type === 3) {
		$("#order_type_03").prop('checked', true);
	}
	$("#contract_type").val(entry.contract_type);				// 契約区分
	$("#outsourcing_cd").val(entry.outsourcing_cd);				// 委託先CD
	$("#outsourcing_name").val(entry.outsourcing_name);			// 委託先CD
	$("#entry_amount_price_notax").val(entry.entry_amount_price_notax);		// 案件合計金額（税抜）
	$("#entry_amount_tax").val(entry.entry_amount_tax);			// 消費税額
	$("#entry_amount_price").val(entry.entry_amount_price);		// 案件合計金額（税込）
	$("#entry_amount_billing").val(entry.entry_amount_billing);	// 案件請求合計金額
	$("#entry_amount_deposit").val(entry.entry_amount_deposit); // 案件入金合計金額
	$("#test_person_id").val(entry.test_person_id);				// 試験担当者ID

	$("#report_limit_date").val(entry.report_limit_date);		// 報告書提出期限
	$("#report_submit_date").val(entry.report_submit_date);		// 報告書提出日
	$("#prompt_report_limit_date_1").val(entry.prompt_report_limit_date_1);		// 速報提出期限1
	$("#prompt_report_submit_date_1").val(entry.prompt_report_submit_date_1);	// 速報提出日1
	$("#prompt_report_limit_date_2").val(entry.prompt_report_limit_date_2);		// 速報提出期限2
	$("#prompt_report_submit_date_2").val(entry.prompt_report_submit_date_2);	// 速報提出日2
	$("#entry_consumption_tax").val(entry.consumption_tax);		// 消費税率
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
	entry.agent_name_1 = "";			// 代理店名
	entry.agent_name_2 = "";			// 代理店名
	entry.agent_address_1 = "";		// 代理店住所
	entry.agent_address_2 = "";		// 代理店住所
	entry.agent_division_cd = "";	// 代理店担当者所属部署
	entry.agent_division_name = "";	// 代理店担当者所属部署
	entry.agent_person_id = "";		// 代理店担当者
	entry.agent_person_name = "";	// 代理店担当者
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
		$("#entry_billing").css("display","inline");
		// 権限チェック
		if (entryList.auth_entry_edit >= 1) {
			$("#edit_entry").css("display","inline");
		}
		entryList.requestEntryData(row.entry_no);
	}

};

// 削除分の表示チェックイベント（案件）
entryList.changeEntryOption = function (event) {
	entryList.reloadGrid();
};
// グリッド初期化後の処理
entryList.refreshEntryGridAfter = function() {
	$("#entry_billing").css("display","none");
	$("#edit_entry").css("display","none");
	$("#entry_memo_ref").text("");
};
// 試験大分類リストの取得リクエスト
entryList.getLargeItemList = function() {
	$.ajax("/large_item_list_get" , {
		type: 'GET',
		dataType: 'json',
		contentType : 'application/json',
		success: entryList.onGetLargeItemList
		});
};
// 試験大分類リストの取得リクエストレスポンス
entryList.onGetLargeItemList = function(large_item_list) {
  $("#largeItem_check").empty();
  entryList.large_item_list = large_item_list;
	$.each(large_item_list.rows,function() {
    // 案件リストの絞り込み用にチェックボックスを追加する
		$("#largeItem_check").append($("<label class='search_option_check'><input type='checkbox' class='search_option_check' value="
        + this.item_cd + " id='largeItem_check_" + this.item_cd +"'>" + this.item_name + "</label>"));
        // 追加した要素の変更イベント登録
        $("#largeItem_check_" + this.item_cd).bind('change', entryList.changeEntryOption);
	});
  //entryList.largeItem_check_all();
  entryList.createGrid();						// 案件リスト

};
// 案件リストの絞り込み用チェックボックスを全部選択状態にする
entryList.largeItem_check_all = function() {
  $.each(entryList.large_item_list.rows,function() {
		$("#largeItem_check_" + this.item_cd).prop('checked', true);
	});

};
// 案件リストの絞り込み用チェックボックスの選択状態を取得する
entryList.getLargeItem_check = function() {
  var items=[];
  if (entryList.large_item_list != null) {
    $.each(entryList.large_item_list.rows,function() {
      var id = "largeItem_check_" + this.item_cd;
      var ck = ($("#" + id).prop("checked")) ? '1':'0';
      items.push({'item_cd':this.item_cd,'value':ck});
  	});
  }
  return items;
};
