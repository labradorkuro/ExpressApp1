//
// DRC殿試験案件スケジュール管理
// 試験分類リスト画面の処理
//

// 試験分類リスト処理
var test_itemList = test_itemList || {};
test_itemList.currentTestItem = null;

// 試験分類入力用ダイアログの生成
test_itemList.createFormDialog = function () {
	$('#test_item_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 360,
		title: '試験分類登録',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				test_itemList.save();
				$(this).dialog('close');
			},
			"更新": function () {
				test_itemList.save();
				$(this).dialog('close');
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};

test_itemList.createGrid = function () {
	var dc = $("#delete_check_disp:checked").val();
	var delchk = (dc) ? 1:0;
	// 社員リストのグリッド
	jQuery("#test_item_list").jqGrid({
		url: '/test_item_get/?delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['項目CD','名称','分類区分','備考','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'item_cd', index: 'item_cd', width: 80, align: "center" },
			{ name: 'item_name', index: 'item_name', width: 200, align: "center" },
			{ name: 'item_type', index: 'item_type', width: 80 , align: "center",formatter: scheduleCommon.item_typeFormatter},
			{ name: 'memo', index: 'memo', width: 200, align: "center" },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id' },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id' },
		],
		height: "260px",
		rowNum: 10,
		rowList: [10],
		pager: '#test_item_list_pager',
		sortname: 'item_type,item_cd',
		multiSort:true,
		viewrecords: true,
		sortorder: "asc",
		caption: "試験分類リスト",
		onSelectRow: test_itemList.onSelectRow
	});
	jQuery("#test_item_list").jqGrid('navGrid', '#test_item_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};

// 編集用ダイアログの表示
test_itemList.openFormDialog = function (event) {
	
	var test_item = test_itemList.clearTest_item();
	test_itemList.setTest_itemForm(test_item);
	if ($(event.target).attr('id') == 'edit_test_item') {
		// 編集ボタンから呼ばれた時は選択中のデータを取得して表示する
		test_itemList.setTest_itemForm(test_itemList.currentTestItem);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}
	$("#test_item_dialog").dialog("open");
};

//	データの保存
test_itemList.save = function () {
	// checkboxのチェック状態確認と値設定
	test_itemList.checkCheckbox();
	// formデータの取得
	var form = test_itemList.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/test_item_post', true);
	xhr.responseType = 'json';
	xhr.onload = test_itemList.onloadSave;
	xhr.send(form);
};

// checkboxのチェック状態確認と値設定
test_itemList.checkCheckbox = function () {
	if ($("#delete_check:checked").val()) {
		$("#delete_check").val('1');
	}
};
// formデータの取得
test_itemList.getFormData = function () {
	var form = new FormData(document.querySelector("#test_itemForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#delete_check:checked").val()) {
		form.append('delete_check', '0');
	}
	return form;
};

// データ保存後のコールバック
test_itemList.onloadSave = function (e) {
	if (this.status == 200) {
		var test_item = this.response;
		if (test_item.error_msg) {
			alert(test_item.error_msg);
		} else {
			$("#test_item_list").GridUnload();
			test_itemList.createGrid();
		}
	}
};

// フォームにセットする
test_itemList.setTest_itemForm = function (test_item) {
	$("#item_cd").val(test_item.item_cd);		// 項目CD
	$("#item_name").val(test_item.item_name);	// 項目名称
	$("#item_type").val(test_item.item_type);	// 分類区分
	if ((test_item.item_type == 1) || (test_item.item_type == "大分類")){
		$("#item_type_1").prop("checked",true);	// 分類区分
	} else {
		$("#item_type_2").prop("checked",true);	// 分類区分
	}
	$("#memo").val(test_item.memo);				// 備考
	// 削除フラグ
	if (test_item.delete_check == 1) {
		$("#delete_check").attr("checked", true);
	} else {
		$("#delete_check").attr("checked", false);
	}
};
test_itemList.clearTest_item = function () {
	var test_item = {};
	test_item.item_CD = '';		// 項目CD
	test_item.item_name = '';	// 項目名称
	test_item.item_type = 2;	// 分類区分
	test_item.memo = '';		// 備考
	test_item.delete_check = '';	// 削除フラグ
	test_item.created = "";		// 作成日
	test_item.created_id = "";   // 作成者ID
	test_item.updated = "";		// 更新日
	test_item.updated_id = "";	// 更新者ID
	return test_item;
};

// リストで選択中の情報を取得する
test_itemList.onSelectRow = function (rowid) {
	test_itemList.currentTestItem = $("#test_item_list").getRowData(rowid);
};

test_itemList.changeOption = function (event) {
	$("#test_item_list").GridUnload();
	test_itemList.createGrid();
};

// 試験分類選択用ダイアログの生成
test_itemList.createTestItemSelectDialog = function () {
	$('#test_item_list_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 600,
		title: '試験分類選択',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"選択": function () {
				$(this).dialog('close');
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 試験分類参照ダイアログ表示
test_itemList.openTestItemSelectDialog = function (event) {
	$("#test_item_list_dialog").dialog({
		buttons: {
			"選択": function () {
				if (event.target.id == 'test_middle_class_name') {
					if (test_itemList.selectMiddleClass()) {
						$(this).dialog('close');
					}
				} else {
					if (test_itemList.selectLargeClass()) {
						$(this).dialog('close');
					}
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
	$("#test_item_list_dialog").dialog("open");
};

test_itemList.selectMiddleClass = function() {
	$("#test_middle_class_cd").val(test_itemList.currentTestItem.item_cd);
	$("#test_middle_class_name").val(test_itemList.currentTestItem.item_name);
	return true;
};

test_itemList.selectLargeClass = function() {
	$("#test_large_class_cd").val(test_itemList.currentTestItem.item_cd);
	$("#test_large_class_name").val(test_itemList.currentTestItem.item_name);
	return true;
};
