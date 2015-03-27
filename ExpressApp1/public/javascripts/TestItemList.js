//
// DRC殿試験案件スケジュール管理
// 試験分類リスト画面の処理
//

// 試験分類リスト処理
var test_itemList = test_itemList || {};
test_itemList.currentTestItemLarge = null;
test_itemList.currentTestItemMiddle = null;

// ボタンの表示・非表示（大分類用）
test_itemList.buttonEnabledForLarge = function(kind) {
	if (kind == 0) {
		$("#edit_test_item_large").css("display","none");
	} else if (kind == 1) {
		$("#edit_test_item_large").css("display","inline");
	}
};
// ボタンの表示・非表示（中分類用）
test_itemList.buttonEnabledForMiddle = function(kind) {
	if (kind == 0) {
		$("#add_test_item_middle").css("display","none");
		$("#edit_test_item_middle").css("display","none");
	} else if (kind == 1) {
		$("#edit_test_item_middle").css("display","none");
		$("#add_test_item_middle").css("display","inline");
	} else if (kind == 2) {
		$("#edit_test_item_middle").css("display","inline");
	}
};
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

// 試験大分類リストの生成
test_itemList.createTestLargeGrid = function () {
	var dc = $("#test_large_delete_check_disp:checked").val();
	var delchk = (dc) ? 1:0;
	jQuery("#test_item_list_large").jqGrid({
		url: '/test_item_get/' + 'large' + '?delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['項目CD','名称','備考','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'item_cd', index: 'item_cd', width: 80, align: "center" },
			{ name: 'item_name', index: 'item_name', width: 200, align: "center" },
			{ name: 'memo', index: 'memo', width: 200, align: "center" },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id', align: "center", formatter: scheduleCommon.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id', align: "center" , formatter: scheduleCommon.personFormatter},
		],
		height: "260px",
		rowNum: 10,
		rowList: [10],
		pager: '#test_item_list_large_pager',
		sortname: 'item_cd',
		multiSort:true,
		viewrecords: true,
		sortorder: "asc",
		caption: "試験大分類リスト",
		onSelectRow: test_itemList.onSelectLargeRow
	});
	jQuery("#test_item_list_large").jqGrid('navGrid', '#test_item_list_large_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
// リストで選択中の情報を取得する
test_itemList.onSelectLargeRow = function (rowid) {
	test_itemList.currentTestItemLarge = $("#test_item_list_large").getRowData(rowid);
	test_itemList.buttonEnabledForLarge(1);
	test_itemList.buttonEnabledForMiddle(1);
	$("#test_item_list_middle").GridUnload();
	test_itemList.createTestMiddleGrid(test_itemList.currentTestItemLarge.item_cd);
};

// 試験中分類リストの生成
test_itemList.createTestMiddleGrid = function (large_item_cd) {
	var dc = $("#test_middle_delete_check_disp:checked").val();
	var delchk = (dc) ? 1:0;
	jQuery("#test_item_list_middle").jqGrid({
		url: '/test_item_get/' + 'middle' + '?large_item_cd=' + large_item_cd + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['項目CD','名称','備考','作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'item_cd', index: 'item_cd', width: 80, align: "center" },
			{ name: 'item_name', index: 'item_name', width: 200, align: "center" },
			{ name: 'memo', index: 'memo', width: 200, align: "center" },
			{ name: 'created', index: 'created', width: 130, align: "center" },
			{ name: 'created_id', index: 'created_id', align: "center", formatter: scheduleCommon.personFormatter },
			{ name: 'updated', index: 'updated', width: 130, align: "center" },
			{ name: 'updated_id', index: 'updated_id' , align: "center", formatter: scheduleCommon.personFormatter},
		],
		height: "260px",
		rowNum: 10,
		rowList: [10],
		pager: '#test_item_list_middle_pager',
		sortname: 'item_cd',
		multiSort:true,
		viewrecords: true,
		sortorder: "asc",
		caption: "試験中分類リスト",
		onSelectRow: test_itemList.onSelectMiddleRow
	});
	jQuery("#test_item_list_middle").jqGrid('navGrid', '#test_item_list_middle_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
// リストで選択中の情報を取得する
test_itemList.onSelectMiddleRow = function (rowid) {
	test_itemList.currentTestItemMiddle = $("#test_item_list_middle").getRowData(rowid);
	test_itemList.buttonEnabledForMiddle(2);
};
// 選択中の大分類の取得
test_itemList.getSelectLargeItem = function() {
	var grid = $("#test_item_list_large");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};
// 選択中の中分類の取得
test_itemList.getSelectMiddleItem = function() {
	var grid = $("#test_item_list_middle");
	var id = grid.getGridParam('selrow');
	if (id != null) {
		return grid.getRowData(id);
	}
	return null;
};

// 編集用ダイアログの表示
test_itemList.openFormDialog = function (event) {
	var test_item = test_itemList.clearTest_item();
	test_itemList.setTest_itemForm(test_item);
	var large_item = test_itemList.getSelectLargeItem();
	var middle_item = test_itemList.getSelectMiddleItem();
	var title = "";
	if (event.target.id == "add_test_item_large") {
		// 大分類の追加
		title = "試験大分類";
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	} else if (event.target.id == "add_test_item_middle") {
		// 中分類の追加
		title = "試験中分類";
		if (large_item) {
			// 大分類CD
			$("#large_item_cd").val(large_item.item_cd);
		}
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	} else if (event.target.id == "edit_test_item_large") {
		// 大分類の編集
		title = "試験大分類";
		// 編集ボタンから呼ばれた時は選択中のデータを取得して表示する
		test_itemList.setTest_itemForm(large_item);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else if (event.target.id == "edit_test_item_middle") {
		// 中分類の編集
		title = "試験中分類";
		if (large_item) {
			// 大分類CD
			middle_item.large_item_cd = large_item.item_cd;
		}
		// 編集ボタンから呼ばれた時は選択中のデータを取得して表示する
		test_itemList.setTest_itemForm(middle_item);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	}
	$("#test_item_dialog").dialog("option",{title:title});
	$("#test_item_dialog").dialog("open");
};

//	データの保存
test_itemList.save = function () {
	var title = $("#test_item_dialog").dialog("option","title");
	// checkboxのチェック状態確認と値設定
	test_itemList.checkCheckbox();
	// formデータの取得
	var form = test_itemList.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/test_item_post', true);
	xhr.responseType = 'json';
	if (title == "試験大分類") {
		// 大分類
		xhr.onload = test_itemList.onloadSaveLarge;
	} else {
		// 中分類
		xhr.onload = test_itemList.onloadSaveMiddle;
	}
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
	form.append("large_item_cd",$("#large_item_cd").val());
	return form;
};

// データ保存後のコールバック
test_itemList.onloadSaveLarge = function (e) {
	if (this.status == 200) {
		var test_item = this.response;
		if (test_item.error_msg) {
			alert(test_item.error_msg);
		} else {
			$("#test_item_list_large").GridUnload();
			test_itemList.createTestLargeGrid();
			$("#test_item_list_middle").GridUnload();
			test_itemList.createTestMiddleGrid(test_item.large_item_cd);
			test_itemList.buttonEnabledForLarge(0);
			test_itemList.buttonEnabledForMiddle(0);
		}
	}
};
test_itemList.onloadSaveMiddle = function (e) {
	if (this.status == 200) {
		var test_item = this.response;
		if (test_item.error_msg) {
			alert(test_item.error_msg);
		} else {
			$("#test_item_list_middle").GridUnload();
			test_itemList.createTestMiddleGrid(test_item.large_item_cd);
		}
	}
};

// フォームにセットする
test_itemList.setTest_itemForm = function (test_item) {
	$("#large_item_cd").val(test_item.large_item_cd);	// 大分類項目CD
	$("#item_cd").val(test_item.item_cd);		// 項目CD
	$("#item_name").val(test_item.item_name);	// 項目名称
	$("#item_type").val(test_item.item_type);	// 分類区分
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
	test_item.large_item_CD = '';		// 項目CD
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

// 削除分の表示チェック
test_itemList.changeOptionLarge = function (event) {
	$("#test_item_list_large").GridUnload();
	test_itemList.createTestLargeGrid();
	$("#test_item_list_middle").GridUnload();
	test_itemList.createTestMiddleGrid(0);
	test_itemList.buttonEnabledForMiddle(0);
};
// 削除分の表示チェック
test_itemList.changeOptionMiddle = function (event) {
	$("#test_item_list_middle").GridUnload();
	var large = test_itemList.getSelectLargeItem();
	$("#test_item_list_middle").GridUnload();
	test_itemList.createTestMiddleGrid(large.item_cd);
	test_itemList.buttonEnabledForMiddle(1);
};

// 試験分類選択用ダイアログの生成
test_itemList.createTestItemSelectDialog = function () {
	$('#test_item_list_dialog').dialog({
		autoOpen: false,
		width: 900,
		height: 800,
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
	$("#test_item_list_large").GridUnload();
	test_itemList.createTestLargeGrid();
	$("#test_item_list_middle").GridUnload();
	test_itemList.createTestMiddleGrid(0);
	$("#test_item_list_dialog").dialog({
		buttons: {
			"選択": function () {
				test_itemList.selectLargeClass();
				test_itemList.selectMiddleClass();
				$(this).dialog('close');
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
	$("#test_item_list_dialog").dialog("open");
};

test_itemList.selectMiddleClass = function() {
	$("#test_middle_class_cd").val(test_itemList.currentTestItemMiddle.item_cd);
	$("#test_middle_class_name").val(test_itemList.currentTestItemMiddle.item_name);
	return true;
};

test_itemList.selectLargeClass = function() {
	$("#test_large_class_cd").val(test_itemList.currentTestItemLarge.item_cd);
	$("#test_large_class_name").val(test_itemList.currentTestItemLarge.item_name);
	return true;
};
