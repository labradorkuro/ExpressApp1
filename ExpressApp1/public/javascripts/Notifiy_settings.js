$(function () {
	$("#tabs").tabs();
  // 更新ボタンイベント
	$("#post_notifiy_settings").bind('click' , {}, notifiy.post_notifiy_settings);
  notifiy.getSettings();
});

var notifiy = notifiy || {}

notifiy.post_notifiy_settings = function() {
  // formデータの取得
	var form = new FormData(document.querySelector("#notifiy_settings_Form"));
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/notifiy_settings_post', true);
	xhr.responseType = 'json';
	xhr.onload = notifiy.onloadSave;
	xhr.send(form);

};

notifiy.onloadSave = function() {

}
// 動作設定の読込み
notifiy.getSettings = function() {
	var q = $.get('/notifiy_settings_get/1', {});
	$.when(q)
  .done(function (response) {
		for(var i = 0;i < response.length;i++) {
			var setting = response[i];
			notifiy.setSettings(setting);
		}
	});
};

notifiy.setSettings = function(setting) {
  $("#notifiy_id").val(setting.notifiy_id);
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
