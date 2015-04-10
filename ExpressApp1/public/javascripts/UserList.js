//
// DRC殿試験案件スケジュール管理
// 社員情報リスト画面の処理
//
$(function () {
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	$("#tabs").tabs();
	$("div.toolbar").css("display","none");
	userList.checkAuth();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });
	// 必要な情報をDBから取得する
	scheduleCommon.getDivisionInfo();
	// 編集用ダイアログの設定
	userList.createUserDialog();
	userList.createGrid();
	userList.createMessageDialog();
	// 社員情報追加ボタンイベント（登録・編集用画面の表示）
	$("#add_user").bind('click' , {}, userList.openUserDialog);
	// 社員情報編集ボタンイベント（登録・編集用画面の表示）
	$("#edit_user").bind('click' , {}, userList.openUserDialog);
	$("#edit_user").css("display","none");
	// 削除分を表示のチェックイベント
	$("#delete_check_disp").bind('change', userList.changeOption);
});

// 社員情報リスト処理
var userList = userList || {};
// 権限チェック
userList.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f03") {
			if (auth.value == 2) {
				$("div.toolbar").css("display","block");
			} else {
				$("div.toolbar").css("display","none");
			}
		}
	}
};

// 社員情報入力用ダイアログの生成
userList.createUserDialog = function () {
	$('#user_dialog').dialog({
		autoOpen: false,
		width: 800,
		height: 360,
		title: '社員情報',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				if (userList.saveUser()) {
					$(this).dialog('close');
				}
			},
			"更新": function () {
				if (userList.saveUser()) {
					$(this).dialog('close');
				}
			},
			"閉じる": function () {
				$(this).dialog('close');
			}
		}
	});
};
userList.createGrid = function () {
	var dc = $("#delete_check_disp:checked").val();
	var delchk = (dc) ? 1:0;
	// 社員リストのグリッド
	jQuery("#user_list").jqGrid({
		url: '/user_get/?delete_check=' + delchk,
		altRows: true,
		datatype: "json",
		colNames: ['社員ID','名前','社員番号', '役職名', '拠点','事業部','内線番号','入社日'
				　,'作成日','作成者','更新日','更新者'],
		colModel: [
			{ name: 'uid', index: 'uid', width: 120, align: "center" },
			{ name: 'name', index: 'name', width: 200, align: "center" },
			{ name: 'u_no', index: 'u_no', width: 80, align: "center" },
			{ name: 'title', index: 'title', width: 100, align: "center" },
			{ name: 'base_cd', index: 'base_cd', width: 80, align: "center" ,formatter:scheduleCommon.base_cdFormatter},
			{ name: 'division_name', index: 'division_name', width: 200, align: "center" },
			{ name: 'telno', index: 'telno', width: 80, align: "center" },
			{ name: 'start_date', index: 'start_date', width: 80, align: "center" },
			{ name: 'created', index: 'created', width: 150, align: "center"},
			{ name: 'created_id', index: 'created_id'  ,width: 80,formatter: scheduleCommon.personFormatter, align: "center"},
			{ name: 'updated', index: 'updated', width: 150, align: "center"},
			{ name: 'updated_id', index: 'updated_id' ,width: 80,formatter: scheduleCommon.personFormatter, align: "center"},
		],
		height: "260px",
		rowNum: 10,
		rowList: [10],
		pager: '#user_pager',
		sortname: 'uid',
		viewrecords: true,
		sortorder: "asc",
		caption: "社員リスト",
		onSelectRow: userList.onSelectUser
	});
	jQuery("#user_list").jqGrid('navGrid', '#user_pager', { edit: false, add: false, del: false });
	scheduleCommon.changeFontSize();
	$("#edit_user").css("display","none");
};
userList.onSelectUser = function(event) {
	$("#edit_user").css("display","inline");
};
// 編集用ダイアログの表示
userList.openUserDialog = function (event) {
	
	var user = userList.clearUser();
	userList.setUserForm(user);
	if ($(event.target).attr('id') == 'edit_user') {
		// 編集ボタンから呼ばれた時は選択中の案件のデータを取得して表示する
		var no = userList.getSelectUser();
		userList.requestUserData(no);
		$("#uid").prop("readonly",true);
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
	} else {
		$("#uid").prop("readonly",false);
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
	}
	$("#user_dialog").dialog("open");
};
// 社員情報データの読込み
userList.requestUserData = function (uid) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/user_get/' + uid, true);
	xhr.responseType = 'json';
	xhr.onload = userList.onloadUserReq;
	xhr.send();
};
//	社員情報データの保存
userList.saveUser = function () {
	var result = false; 
	// checkboxのチェック状態確認と値設定
	userList.checkCheckbox();
	if (userList.inputCheck()) {
		// formデータの取得
		var form = userList.getFormData();
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/user_post', true);
		xhr.responseType = 'json';
		xhr.onload = userList.onloadUserSave;
		xhr.send(form);
		result = true;
	}
	return result;
};

// checkboxのチェック状態確認と値設定
userList.checkCheckbox = function () {
	if ($("#delete_check:checked").val()) {
		$("#delete_check").val('1');
	}
};
// formデータの取得
userList.getFormData = function () {
	var form = new FormData(document.querySelector("#userForm"));
	// checkboxのチェックがないとFormDataで値が取得されないので値を追加する
	if (!$("#delete_check:checked").val()) {
		form.append('delete_check', '0');
	}
	return form;
};

// 社員データ保存後のコールバック
userList.onloadUserSave = function (e) {
	if (this.status == 200) {
		var user = this.response;
		if (user.error_msg) {
			alert(user.error_msg);
		} else {
			$("#user_list").GridUnload();
			userList.createGrid();
			$("#message").text("保存されました");
			$("#message_dialog").dialog("option", { title: "社員情報" });
			$("#message_dialog").dialog("open");
		}
	}
};
// 社員データ取得リクエストのコールバック
userList.onloadUserReq = function (e) {
	if (this.status == 200) {
		var user = this.response;
		// formに取得したデータを埋め込む
		userList.setUserForm(user);
	}
};

// 社員データをフォームにセットする
userList.setUserForm = function (user) {
	$("#uid").val(user.uid);	// 社員ID
	$("#name").val(user.name);	// 氏名
	$("#u_no").val(user.u_no);	// 社員番号
	$("#start_date").val(user.start_date);	// 入社日
	$("#base_cd").val(user.base_cd);		// 拠点CD
	$("#division").val(user.division);		// 事業部ID
	$("#telno").val(user.telno); // 内線
	$("#title").val(user.title); // 役職名
	$("#auth_no").val(user.auth_no); // 権限設定
	// 削除フラグ
	if (user.delete_check == 1) {
		$("#delete_check").attr("checked", true);
	} else {
		$("#delete_check").attr("checked", false);
	}
	//$("#delete_check").val(user.delete_check);	// 削除フラグ
	$("#created").val(user.created);			// 作成日
	$("#created_id").val(user.created_id);	// 作成者ID
	$("#updated").val(user.updated);		// 更新日
	$("#updated_id").val(user.updated_id);	// 更新者ID
};
userList.clearUser = function () {
	var user = {};
	user.uid = '';	// 社員ID
	user.name = '';	// 氏名
	user.u_no = '';	// 社員番号
	user.start_date = '';	// 入社日
	user.base_cd = '';		// 拠点CD
	user.division = '';		// 事業部ID
	user.telno = ''; // 内線
	user.title = ''; // 役職名
	user.auth_no = 'p05';	// 権限設定
	user.delete_check = '';	// 削除フラグ
	user.created = "";		// 作成日
	user.created_id = "";   // 作成者ID
	user.updated = "";		// 更新日
	user.updated_id = "";	// 更新者ID
	return user;
};

// 社員リストで選択中の社員IDを取得する
userList.getSelectUser = function () {
	var uid = "";
	var id = $("#user_list").getGridParam('selrow');
	if (id != null) {
		var row = $("#user_list").getRowData(id);
		uid = row.uid;
	}
	return uid;
};

userList.changeOption = function (event) {
	$("#user_list").GridUnload();
	userList.createGrid();
};

userList.inputCheck = function () {
	var err = "";
	if ($("#userForm").checkValidity) {
	} else {
		var ctrls = $("#userForm input");
		for(var i = 0; i < ctrls.length;i++) {
			var ctl = ctrls[i];
			if (ctl.validity.valueMissing) {
				if (ctl.id == "uid") {
					err = "社員IDが未入力です";
					break;
				} else if (ctl.id == "name") {
					err = "名前が未入力です";
					break;
				}
			} else if (!ctl.validity.valid) {
				if (ctl.id == "uid") {
					err = "社員IDの入力値を確認して下さい";
					break;
				} else if (ctl.id == "u_no") {
					err = "社員番号の入力値を確認して下さい";
					break;
				}
			}
		}
	}
	if (err != "") {
		$("#message").text(err);
		$("#message_dialog").dialog("option", { title: "入力エラー" });
		$("#message_dialog").dialog("open");
		return false;
	} else {
		return true;
	
	}

};

// メッセージ表示用ダイアログの生成
userList.createMessageDialog = function () {
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
