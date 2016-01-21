//
// DRC殿試験案件スケジュール管理
// 権限設定画面の処理
//
$(function () {
	$("#tabs").tabs();
	// 更新ボタンイベント
	$("#post_auth").bind('click' , {}, auth_form.postAuth);
	auth_form.getAuth();
	auth_form.createMessageDialog();
	$("input.auth_check").bind('change',auth_form.changeCheck);
});

// 動作設定画面処理
var auth_form = auth_form || {};

// 動作設定データの保存
auth_form.postAuth = function() {
	// formデータの取得
	var form = new FormData(document.querySelector("#authForm"));
	auth_form.getCheck(form);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/auth_post', true);
	xhr.responseType = 'json';
	xhr.onload = auth_form.onloadAuthSave;
	xhr.send(form);
};

// 権限設定のチェック状態から０，１，２の値を決定してフォームデータとして保存する
auth_form.getCheck = function(form) {
	for(var i = 1;i <= 13;i++) {
		var fno = "00" + i;
		fno = "f" + fno.slice(-2);
		for(var j = 1;j <= 6;j++) {
			var pno = "00" + j;
			pno = "p" + pno.slice(-2);
			if ($("#" + fno + "_" + pno + "_w").prop("checked"))  {
				form.append(fno + "_" + pno ,2);
			} else if ($("#" + fno + "_" + pno + "_r").prop("checked"))  {
				form.append(fno + "_" + pno ,1);
			} else {
				form.append(fno + "_" + pno,0);
			}	
		}
	}
	return form;
};
auth_form.onloadAuthSave = function() {
	$("#message_dialog").dialog("option", { title: "権限設定" });
	$("#message").text("更新されました。");
	$("#message_dialog").dialog("open");
};

// 動作設定の読込み
auth_form.getAuth = function() {
	var auth = $.get('/auth_get_all/', {});
	$.when(auth)
	.done(function (auth_response) {
		for(var i = 0;i < auth_response.length;i++) {
			var auth = auth_response[i];
			auth_form.setAuthValue(auth);
		}
	});
};
// 権限設定の値をもとに画面のチェックを付ける
auth_form.setAuthValue = function(auth) {
	if (auth.auth_value == 0) {
		$("#" + auth.code + "_" + auth.auth_no + "_r").prop("checked",false);
		$("#" + auth.code + "_" + auth.auth_no + "_w").prop("checked",false);
	} else if (auth.auth_value == 1) {
		$("#" + auth.code + "_" + auth.auth_no + "_r").prop("checked",true);
		$("#" + auth.code + "_" + auth.auth_no + "_w").prop("checked",false);
	} else if (auth.auth_value == 2) {
		$("#" + auth.code + "_" + auth.auth_no + "_r").prop("checked",true);
		$("#" + auth.code + "_" + auth.auth_no + "_w").prop("checked",true);
	}
};
// メッセージ表示用ダイアログ
auth_form.createMessageDialog = function () {
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
auth_form.changeCheck = function(event) {
	var id = event.target.id;
	var idx = id.indexOf("_w");
	if (idx > 0) {
		// 登録権限のチェックボックスの場合、登録権限を付けたら参照権限も付ける
		var ck = $("#" + id).prop("checked");
		if (ck) {
			id = id.substring(0,idx) + "_r";
			$("#" + id).prop("checked",true);
		}
	} 
};
