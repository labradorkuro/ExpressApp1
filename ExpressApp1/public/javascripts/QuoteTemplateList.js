//
// DRC殿試験案件スケジュール管理
// 見積テンプレート管理画面の処理
//

// 見積テンプレート管理
var quote_template_list = quote_template_list || {};
quote_template_list.current_large_item = "";

// 権限チェック
quote_template_list.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f04") {
			if (auth.value == 2) {
				$("div.toolbar").css("display","block");
			} else {
				$("div.toolbar").css("display","none");
			}
		}
	}
};

// 見積テンプレート名ダイアログの生成
quote_template_list.createTemplateNameFormDialog = function () {
	$('#quote_template_name_dialog').dialog({
		autoOpen: false,
		width: 500,
		height: 300,
		title: '見積テンプレート',
		closeOnEscape: false,
		modal: true,
		buttons: {
			//"追加": function () {
			//	if (quote_template_list.saveName()) {
			//		$(this).dialog('close');
			//	}
			//},
			"更新": function () {
				if (quote_template_list.saveName()) {
					quote_template_list.reloadTemplateGrid();
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 見積テンプレート明細ダイアログの生成
quote_template_list.createMeisaiFormDialog = function () {
	$('#quote_template_dialog').dialog({
		autoOpen: false,
		width: 500,
		height: 300,
		title: '見積テンプレート明細',
		closeOnEscape: false,
		modal: true,
		buttons: {
			//"追加": function () {
			//	if (quote_template_list.save()) {
			//		$(this).dialog('close');
			//		quote_template_list.reloadMeisaiList();
			//	}
			//},
			"更新": function () {
				if (quote_template_list.save()) {
					$(this).dialog('close');
					quote_template_list.reloadMeisaiList();
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 明細リストの再ロード
quote_template_list.reloadMeisaiList = function() {
	var rowid = $("#quote_template_meisai").getGridParam('selrow');
	var template = $("#quote_template_meisai").getRowData(rowid);
	if (template != null) {
		quote_template_list.createTemplateMeisaiGrid(quote_template_list.current_large_item.item_cd,template.template_id)
	}
}
quote_template_list.reloadTemplateGrid = function() {
	var rowid = $("#test_item_list_large").getGridParam('selrow');
	var template = $("#test_item_list_large").getRowData(rowid);
	quote_template_list.createTemplateGrid(template.item_cd);

}
// テンプレート名の編集ダイアログ表示
quote_template_list.openTemplateNameFormDialog = function() {
	$('#template_id_namedlg').val('');
	$('#new_template_id').val('');
	$('#test_large_class_cd_namedlg').val('');
	var rowid = $("#quote_template_list").getGridParam('selrow');
	var template = $("#quote_template_meisai").getRowData(rowid);
	$('#template_id_namedlg').val(template.template_id);
	$('#test_large_class_cd_namedlg').val(quote_template_list.current_large_item.item_cd);

	$('#quote_template_name_dialog').dialog('open');
}
// テンプレートの編集ダイアログ表示
quote_template_list.openMeisaiFormDialog = function() {
	quote_template_list.clearMeisaiForm();
	var rowid = $("#quote_template_meisai").getGridParam('selrow');
	var template = $("#quote_template_meisai").getRowData(rowid);
	if (template != null) {
		$('#id').val(template.id);
		$('#template_id').val(template.template_id);
		$('#test_large_class_cd').val(quote_template_list.current_large_item.item_cd);
		$('#test_middle_class_cd').val(template.test_middle_class_cd);
		$('#test_middle_class_name').val(template.test_middle_class_name);
		$('#period_term').val(template.period_term);
		$('#period_unit').val(template.period_unit);
		$('#quantity').val(template.quantity);
		$('#unit').val(template.unit);
		$('#unit_price').val(template.unit_price);
		$('#price').val(template.price);
		$('#memo').val(template.memo);
		$('#delete_check_disp').val(template.delete_check);
		if (template.summary_check == 'しない')
			$('#summary_check_0').prop('checked',true);
		else
			$('#summary_check_1').prop('checked',true);
		}

	$('#quote_template_dialog').dialog('open');
};
quote_template_list.clearMeisaiForm = function() {
	$('#id').val('');
	$('#template_id').val('');
	$('#test_large_class_cd').val('');
	$('#test_middle_class_cd').val('');
	$('#test_middle_class_name').val('');
	$('#period_term').val('');
	$('#period_unit').val('');
	$('#quantity').val(0);
	$('#unit').val('');
	$('#unit_price').val(0);
	$('#price').val(0);
	$('#memo').val('');
	$('#delete_check_disp').val(0);
	$('#summary_check_0').prop('checked',false);

}
// 試験大分類リストの生成
quote_template_list.createTestLargeGrid = function () {
	var delchk = 0;
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
		onSelectRow: quote_template_list.onSelectLargeRow
	});
	jQuery("#test_item_list_large").jqGrid('navGrid', '#test_item_list_large_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
quote_template_list.onSelectLargeRow = function (rowid) {
	quote_template_list.current_large_item = $("#test_item_list_large").getRowData(rowid);
	$("#quote_template_list").GridUnload();
	quote_template_list.createTemplateGrid(quote_template_list.current_large_item.item_cd);
	quote_template_list.reloadMeisaiList();
};
// テンプレートIDのリスト
quote_template_list.createTemplateGrid = function(large_cd) {
	$("#quote_template_list").GridUnload();
	var dc = $("#quote_template_delete_check_disp:checked").val();
	var delchk = (dc) ? 1:0;
	jQuery("#quote_template_list").jqGrid({
		url: '/quote_template_get' + '?large_cd=' +  large_cd + '&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['','テンプレート名',''],
		colModel: [
			{ name: 'id', index: 'id', hidden:true },
			{ name: 'template_id', index: 'template_id', width: 800, align: "center" },
			{ name: 'template_name_delete_check', index: 'template_name_delete_check', hidden:true }
		],
		//height: "460px",
		rowNum: 10,
		rowList: [10,20,30],
		pager: '#quote_template_list_pager',
		sortname: 'template_id',
		multiSort:true,
		viewrecords: true,
		sortorder: "asc",
		caption: "見積テンプレートリスト",
		onSelectRow:quote_template_list.selectTemplate
	});
	jQuery("#quote_template_list").jqGrid('navGrid', '#quote_template_list_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};
// テンプレート選択
quote_template_list.selectTemplate = function (rowid) {
	var template = $("#quote_template_list").getRowData(rowid);
	$("#quote_template_meisai").GridUnload();
	// 明細の表示
	quote_template_list.createTemplateMeisaiGrid(quote_template_list.current_large_item.item_cd,template.template_id);
};

// テンプレート明細リスト
quote_template_list.createTemplateMeisaiGrid = function(large_cd,template_id) {
	$("#quote_template_meisai").GridUnload();
	var dc = $("#quote_template_delete_check_disp:checked").val();
	var delchk = (dc) ? 1:0;
	jQuery("#quote_template_meisai").jqGrid({
		url: '/quote_template_meisai_get' + '?large_cd=' +  large_cd + '&template_id=' + template_id +'&delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['id','テンプレート名','試験中分類CD','名称','','','数量','単位','単価','金額','集計','備考',''],
		colModel: [
			{ name: 'id', index: 'id', hidden:true },
			{ name: 'template_id', index: 'template_id', width: 140, align: "center" },
			{ name: 'test_middle_class_cd', index: 'test_middle_class_cd', hidden:true },
			{ name: 'test_middle_class_name', index: 'test_middle_class_name', width: 200, align: "center" },
			{ name: 'period_term', index: 'period_term', hidden:true },
			{ name: 'period_unit', index: 'period_unit', hidden:true },
			{ name: 'quantity', index: 'quantity', width: 80, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'unit', index: 'unit', width: 80, align: "center" },
			{ name: 'unit_price', index: 'unit_price', width: 80, align: "right" ,formatter:scheduleCommon.numFormatterC},
			{ name: 'price', index: 'price', width: 100, align: "right",formatter:scheduleCommon.numFormatterC },
			{ name: 'summary_check', index: 'summary_check', width: 80, align: "center" , formatter:scheduleCommon.summaryCheckFormatter },
			{ name: 'memo', index: 'memo', width: 200, align: "center" },
			{ name: 'template_meisai_delete_check', index: 'template_meisai_delete_check', hidden:true }
		],
		//height: "460px",
		rowNum: 10,
		rowList: [10,20,30],
		pager: '#quote_template_meisai_pager',
		sortname: 'id',
		multiSort:true,
		viewrecords: true,
		sortorder: "asc",
		caption: "見積テンプレートリスト",
		onSelectRow:quote_template_list.selectTemplateMeisai,
		loadComplete:quote_template_list.meisaiLoadComplete
	});
	jQuery("#quote_template_meisai").jqGrid('navGrid', '#quote_template_meisai_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
};

// テンプレート選択
quote_template_list.selectTemplateMeisai = function (event) {
};
quote_template_list.meisaiLoadComplete = function(event) {
	var rowNum = Number($("#quote_template_list").getGridParam('rowNum'));
	$("#quote_template_meisai").setGridHeight(rowNum * 25);
}
// テンプレート名の更新
quote_template_list.saveName = function(){
	var xhr = new XMLHttpRequest();
	var data = new FormData(document.querySelector("#quoteTemplateNameForm"));
	var delchk = ($("#delete_check_disp").prop("checked")) ? 1:0;
	data.append("delete_check",delchk);

	xhr.open('POST', '/quote_template_name_post', true);
	xhr.responseType = 'json';
	xhr.send(data);
	return true;
};
// テンプレートの更新
quote_template_list.save = function(){
	var xhr = new XMLHttpRequest();
	var data = new FormData(document.querySelector("#quoteTemplateListForm"));
	var delchk = ($("#delete_check_disp").prop("checked")) ? 1:0;
	data.append("delete_check",delchk);
	if($('#summary_check_1').prop('checked')) {
		data.append("summary_check","1");
	} else {
		data.append("summary_check","0");
	}

	xhr.open('POST', '/quote_template_post', true);
	xhr.responseType = 'json';
	xhr.send(data);
	return true;
};

$(function () {
	$("#tabs").tabs();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	$("div.toolbar").css("display","none");
	// 権限チェック
	quote_template_list.checkAuth();
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo();
	// 編集用ダイアログの設定
	quote_template_list.createTemplateNameFormDialog();
	quote_template_list.createMeisaiFormDialog();
	// メッセージ用ダイアログの設定
	//quote_template_list.createMessageDialog();
	// 追加ボタンイベント（登録・編集用画面の表示）
//	$("#add_quote_template").bind('click' , {}, quote_template_list.openFormDialog);
	// 編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_quote_template").bind('click' , {}, quote_template_list.openMeisaiFormDialog);
	$("#edit_quote_template_name").bind('click' , {}, quote_template_list.openTemplateNameFormDialog);
	// 削除分を表示のチェックイベント
	$("#quote_template_delete_check_disp").bind('change', quote_template_list.createTemplateGrid);

	quote_template_list.createTestLargeGrid();
});
