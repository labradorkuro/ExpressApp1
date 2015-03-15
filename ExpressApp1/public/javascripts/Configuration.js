//
// DRC殿試験案件スケジュール管理
// 動作設定画面の処理
//
$(function () {
	$("#tabs").tabs();
	// 更新ボタンイベント
	$("#post_config").bind('click' , {}, config_form.postConfig);
	config_form.getConfig();
});

// 動作設定画面処理
var config_form = config_form || {};

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
};

// 動作設定の読込み
config_form.getConfig = function() {
	var config = $.get('/config_get/1', {});
	$.when(config)
	.done(function (config_response) {
//		configuration = config_response;
		$("#drc_name").val(config_response.drc_name);
		$("#drc_address1").val(config_response.drc_address1);
		$("#drc_address2").val(config_response.drc_address2);
		$("#drc_telno").val(config_response.drc_telno);
		$("#drc_faxno").val(config_response.drc_faxno);
		$("#consumption_tax").val(config_response.consumption_tax);
		
	});
};
