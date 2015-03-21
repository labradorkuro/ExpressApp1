//
// DRC殿試験案件スケジュール管理
// 試験分類リスト画面の処理
//
$(function () {
	$("#tabs").tabs();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	// 社員マスタからリストを取得する
	scheduleCommon.getUserInfo();
	// 編集用ダイアログの設定
	test_itemList.createFormDialog();
	// 大分類リスト
	test_itemList.createTestLargeGrid();
	// 中分類リスト
	test_itemList.createTestMiddleGrid(0);
	// 追加ボタンイベント（登録・編集用画面の表示）
	$("#add_test_item_large").bind('click' , {}, test_itemList.openFormDialog);
	// 編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_test_item_large").bind('click' , {}, test_itemList.openFormDialog);
	// 削除分を表示のチェックイベント
	$("#test_large_delete_check_disp").bind('change', test_itemList.changeOptionLarge);
	test_itemList.buttonEnabledForLarge(0);

	// 追加ボタンイベント（登録・編集用画面の表示）
	$("#add_test_item_middle").bind('click' , {}, test_itemList.openFormDialog);
	// 編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_test_item_middle").bind('click' , {}, test_itemList.openFormDialog);
	// 削除分を表示のチェックイベント
	$("#test_middle_delete_check_disp").bind('change', test_itemList.changeOptionMiddle);
	test_itemList.buttonEnabledForMiddle(0);
});
