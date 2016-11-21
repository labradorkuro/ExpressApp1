$(function () {
	$("#tabs").tabs();
  // 更新ボタンイベント
	$("#post_notify_settings").bind('click' , {}, notify.post_notify_settings);
  notify.getSettings();
	notify.createMessageDialog();
});

var notify = notify || {}

notify.post_notify_settings = function() {
  // formデータの取得
	var form = new FormData(document.querySelector("#notify_settings_Form"));
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/notify_settings_post', true);
	xhr.responseType = 'json';
	xhr.onload = notify.onloadSave;
	xhr.send(form);

};

notify.onloadSave = function() {
	$("#message").text('更新されました');
	$("#message_dialog").dialog("option", { title: "通知メール設定" });
	$("#message_dialog").dialog("open");

}
// 動作設定の読込み
notify.getSettings = function() {
	var q = $.get('/notify_settings_get/1', {});
	$.when(q)
  .done(function (response) {
		for(var i = 0;i < response.length;i++) {
			var setting = response[i];
			notify.setSettings(setting);
		}
	});
};

notify.setSettings = function(setting) {
  $("#notify_id").val(setting.notify_id);
  $("#event_name_1").val(setting.event_name_1);
  $("#send_address_1").val(setting.send_address_1);
  $("#mail_title_1").val(setting.mail_title_1);
  $("#mail_body_1").val(setting.mail_body_1);
  $("#event_name_2").val(setting.event_name_2);
  $("#send_address_2").val(setting.send_address_2);
  $("#mail_title_2").val(setting.mail_title_2);
  $("#mail_body_2").val(setting.mail_body_2);
  $("#smtp_server").val(setting.smtp_server);
  $("#smtp_port").val(setting.smtp_port);
  $("#userid").val(setting.userid);
  $("#password").val(setting.password);
}
// メッセージ表示用ダイアログの生成
notify.createMessageDialog = function () {
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
