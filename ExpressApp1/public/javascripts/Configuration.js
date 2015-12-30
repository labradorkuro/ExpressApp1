//
// DRC殿試験案件スケジュール管理
// 動作設定画面の処理
//
$(function () {

	$("#tabs").tabs();
	// 更新ボタンイベント
	$("#post_config").bind('click' , {}, config_form.postConfig);
	config_form.getConfig();
	config_form.createMessageDialog();
	config_form.checkAuth();
});

// 動作設定画面処理
var config_form = config_form || {};

// 権限チェック
config_form.checkAuth = function() {
	$("#post_config").css('display','none');
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f06") {
			if (auth.value == 2) {
				$("#post_config").css('display','inline');
			}
		}
	}
};
// 動作設定データの保存
config_form.postConfig = function() {
	// formデータの取得
	var form = new FormData(document.querySelector("#configForm"));
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/config_post/1', true);
	xhr.responseType = 'json';
	xhr.onload = config_form.onloadConfigSave;
	xhr.send(form);
};
config_form.onloadConfigSave = function() {
	$("#message_dialog").dialog("option", { title: "動作設定" });
	$("#message").text("更新されました。");
	$("#message_dialog").dialog("open");
};

// 動作設定の読込み
config_form.getConfig = function() {
	var config = $.get('/config_get/1', {});
	$.when(config)
	.done(function (config_response) {
//		configuration = config_response;
		$("#drc_name").val(config_response.drc_name);
		$("#drc_zipcode").val(config_response.drc_zipcode);
		$("#drc_address1").val(config_response.drc_address1);
		$("#drc_address2").val(config_response.drc_address2);
		$("#drc_telno").val(config_response.drc_telno);
		$("#drc_faxno").val(config_response.drc_faxno);
		$("#consumption_tax").val(config_response.consumption_tax);
		$("#quote_form_memo_define_1").val(config_response.quote_form_memo_define_1);
		$("#quote_form_memo_define_2").val(config_response.quote_form_memo_define_2);
		$("#quote_form_memo_define_3").val(config_response.quote_form_memo_define_3);
	});
};
// メッセージ表示用ダイアログ
config_form.createMessageDialog = function () {
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
