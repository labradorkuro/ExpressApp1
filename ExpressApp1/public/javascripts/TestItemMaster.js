//
// DRC殿試験案件スケジュール管理
// 試験分類リスト画面の処理
//
$(function () {
	$("#tabs").tabs();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	// 編集用ダイアログの設定
	test_itemList.createFormDialog();
	test_itemList.createGrid();
	// 追加ボタンイベント（登録・編集用画面の表示）
	$("#add_test_item").bind('click' , {}, test_itemList.openFormDialog);
	// 編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_test_item").bind('click' , {}, test_itemList.openFormDialog);
	// 削除分を表示のチェックイベント
	$("#delete_check_disp").bind('change', test_itemList.changeOption);
});
