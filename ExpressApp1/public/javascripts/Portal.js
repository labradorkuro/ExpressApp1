$(function () {
	portal.clearDisp();
	// ログインユーザの権限をCookieから取得して画面表示を制御する
	portal.checkAuth();
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 編集用ダイアログの設定
	portal.createPasswordDialog();
	portal.createMessageDialog();
	scheduleCommon.changeFontSize('1.0em');
	// パスワード変更ボタンイベント（登録・編集用画面の表示）
	$("#edit_password").bind('click' , {}, portal.openPasswordDialog);
	//$("#logout").bind('click' , {}, portal.logout);
});

// 事業部リスト処理
var portal = portal || {};

// 最低権限の表示に初期化する
portal.clearDisp = function() {
	$("#entry_menu").css('display','none');
	$("#admin_client_menu").css('display','none');
	$("#admin_division_menu").css('display','none');
	$("#admin_user_menu").css('display','none');
	$("#admin_testitem_menu").css('display','none');
	$("#admin_template_menu").css('display','none');
	$("#admin_config_menu").css('display','none');
	$("#admin_menu").css('display','none');
	$("#auth_menu").css('display','none');
	$("#auth_settings_menu").css('display','none');

};
// ユーザ権限をチェックして権限のないメニューを非表示にする
portal.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	var disp_count = 0;
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f01") {
			if (auth.value >= 1) {
				$("#admin_client_menu").css('display','inline');
				disp_count++;
			}
		} else if (auth.name == "f02") {
			if (auth.value >= 1) {
				$("#admin_division_menu").css('display','inline');
				disp_count++;
			}
		} else if (auth.name == "f03") {
			if (auth.value >= 1) {
				$("#admin_user_menu").css('display','inline');
				disp_count++;
			}
		} else if (auth.name == "f04") {
			if (auth.value >= 1) {
				$("#admin_testitem_menu").css('display','inline');
				disp_count++;
			}
		} else if (auth.name == "f05") {
			if (auth.value >= 1) {
				$("#admin_template_menu").css('display','inline');
				disp_count++;
			}
		} else if (auth.name == "f06") {
			if (auth.value >= 1) {
				$("#admin_config_menu").css('display','inline');
				disp_count++;
			}
		} else if ((auth.name == "f07") || (auth.name == "f08") || (auth.name == "f09") || (auth.name == "f10")){
			if (auth.value >= 1) {
				// 案件情報を非表示
				$("#entry_menu").css('display','block');
			}
		} else if (auth.name == "f13") {
			if (auth.value >= 1) {
				$("#auth_menu").css('display','block');
				$("#auth_settings_menu").css('display','inline');
			}
		}
	}
	// 管理メユーが一つでも表示なら、枠も表示
	if (disp_count >= 1) {
		$("#admin_menu").css('display','block');
	}
};
// ログアウト処理
portal.logout = function () {
	var form = {};
	$.post("/logout");
//	var xhr = new XMLHttpRequest();
//	xhr.open('POST', '/logout', true);
//	xhr.send(form);
};

// メッセージ表示用ダイアログの生成
portal.createMessageDialog = function () {
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

// パスワード変更用ダイアログの生成
portal.createPasswordDialog = function () {
	$('#password_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 250,
		title: 'パスワード変更',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"更新": function () {
				if (portal.savePassword()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
// 編集用ダイアログの表示
portal.openPasswordDialog = function (event) {
	
	var password = portal.clearPassword();
	portal.setPasswordForm(password);
	$("#password_dialog").dialog("open");
};
portal.clearPassword = function () {
	var password = { password: "", passowrd_confirm: "" };
	return password;
};
portal.setPasswordForm = function (password) {
	$("#password").val(password.password);
	$("#password_confirm").val(password.password_confirm);

};
//	社員情報データの保存
portal.savePassword = function () {
	if (!portal.inputCheck()) {
		return false;
	}
	// formデータの取得
	var form = portal.getFormData();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/password_post', true);
	xhr.responseType = 'json';
	xhr.onload = portal.onloadPasswordSave;
	xhr.send(form);
	return true;
};
portal.inputCheck = function () {
	var result = true;
	if ($("#password").val() == "") {
		// パスワード
		$("#message").text("パスワードが未入力です。");
		result = false;
	}
	else if ($("#password_confirm").val() == "") {
		// パスワード
		$("#message").text("パスワード確認用が未入力です。");
		result = false;
	}
	else if ($("#password").val() != $("#password_confirm").val()) {
		// 不一致
		$("#message").text("パスワードが不一致です。");
		result = false;
	}
	if (!result) {
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
	}
	return result;

};
// formデータの取得
portal.getFormData = function () {
	var form = new FormData(document.querySelector("#passwordForm"));
	return form;
};

// 保存後のコールバック
portal.onloadPasswordSave = function (e) {
	if (this.status == 200) {
		$("#message").text("パスワードが変更されました。");
		$("#message_dialog").dialog("option", { title: "パスワード変更" });
		$("#message_dialog").dialog("open");
	}
};
