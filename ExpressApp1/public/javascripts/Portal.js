$(function () {
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
