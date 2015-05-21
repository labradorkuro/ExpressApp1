//
// DRC殿試験案件スケジュール管理
// 得意先マスタの登録、編集の処理
//
$(function () {
	$("#tabs").tabs();
	// 権限チェック
	clientList.checkAuth();
	// メッセージダイアログ生成
	clientList.createMessageDialog();
	//clientList.init(true);　// 権限チェック処理の中へ移動
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
	// 日付選択用設定
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
});
