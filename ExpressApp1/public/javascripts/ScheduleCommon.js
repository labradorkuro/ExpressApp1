//
// 共通処理
var scheduleCommon = scheduleCommon || {};
scheduleCommon.base_cd = [{ base_cd: "00", base_name: "共通" },{ base_cd: "01", base_name: "本社" },{ base_cd: "02", base_name: "札幌" }];
scheduleCommon.entry_status = [{ entry_status: "01", status_name: "引合" },{ entry_status: "02", status_name: "見積" },{ entry_status: "03", status_name: "依頼" },{ entry_status: "04", status_name: "失注" }];
scheduleCommon.user_list = new Array();

// 拠点コード
scheduleCommon.getBase_cd = function (base_cd) {
	for (var i in scheduleCommon.base_cd) {
		if (base_cd === scheduleCommon.base_cd[i].base_cd) {
			return scheduleCommon.base_cd[i].base_name;
		}
	}
	return "";
};
// 案件ステータス
scheduleCommon.getEntry_status = function (no) {
	for (var i in scheduleCommon.entry_status) {
		if (no === scheduleCommon.entry_status[i].entry_status) {
			return scheduleCommon.entry_status[i].status_name;
		}
	}
	return "";
};
// 社員マスタから情報取得
scheduleCommon.getUserInfo = function () {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/user_get/?rows=100&delete_check=0', true);
	xhr.responseType = 'json';
	xhr.onload = scheduleCommon.onloadUserReq;
	xhr.send();
};
scheduleCommon.onloadUserReq = function (e) {
	if (this.status == 200) {
		var users = this.response;
		// formに取得したデータを埋め込む
		$("#person_id").empty();
		$("#input_operator_id").empty();
		$("#confirm_operator_id").empty();
		scheduleCommon.user_list = new Array();
		for (var i in users.rows) {
			var user = users.rows[i].cell;
			scheduleCommon.user_list.push(user);
			$("#person_id").append("<option value=" + user.uid + ">" + user.name);
			$("#input_operator_id").append("<option value=" + user.uid + ">" + user.name);
			$("#confirm_operator_id").append("<option value=" + user.uid + ">" + user.name);
		}
	}
};
// 事業部マスタから情報取得
scheduleCommon.getDivisionInfo = function () {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/division_get/?rows=100', true);
	xhr.responseType = 'json';
	xhr.onload = scheduleCommon.onloadDivisionReq;
	xhr.send();
	
};
scheduleCommon.onloadDivisionReq = function (e) {
	if (this.status == 200) {
		var divisions = this.response;
		// formに取得したデータを埋め込む
		$("#division").empty();
		for (var i in divisions.rows) {
			var division = divisions.rows[i].cell;
			$("#division").append("<option value=" + division.division + ">" + division.division_name);
		}
	}

};

// jqgridのフォントサイズを変える
scheduleCommon.changeFontSize = function(size){
    $('div.ui-jqgrid').css('font-size', size);
	$('div.ui-jqgrid-view').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('height', size)
        .children('div').css('height', size);
//    $('div.ui-jqgrid-pager').css('height', size);
//    $('div.ui-jqgrid-pager').css('font-size', '1em');
	$('div.ui-jqgrid-pager').css('height', '1.6em');
	$('div.ui-jqgrid-pager').css('font-size', '1.2em');
    $('.ui-pg-input').css('height', '1.3em');
    $('.ui-pg-selbox').css('height', '1.3em');
};

// モーダルウィンドウを閉じる
scheduleCommon.closeModalWindow = function() {
	$(window.parent.document.getElementById("overlayer")).hide();
	$(window.parent.document.getElementById("graylayer")).hide();
};

// カレンダー
scheduleCommon.getToday = function (format_str) {
	var d = new Date();
	return scheduleCommon.getDateString(d, format_str);
/*
	var date_format = this.format(format_str,
			d.getFullYear(),
			d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1),
		    d.getDate() < 10 ? "0" + d.getDate() : d.getDate()
	);
	return date_format;
*/
};
scheduleCommon.getDateString = function (date, format_str) {
	var date_format = scheduleCommon.format(format_str,
			date.getFullYear(),
			date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1),
		    date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
	);
	return date_format;
};
scheduleCommon.getTimeString = function (date, format_str) {
	var date_format = scheduleCommon.format(format_str,
			date.getHours() < 10 ? "0" + date.getHours() : date.getHours(),
			date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
	);
	return date_format;
};
scheduleCommon.format = function (fmt, a) {
	var rep_fn = undefined;
	
	if (typeof a == "object") {
		rep_fn = function (m, k) { return a[ k ]; }
	}
	else {
		var args = arguments;
		rep_fn = function (m, k) { return args[ parseInt(k) + 1 ]; }
	}
	
	return fmt.replace(/\{(\w+)\}/g, rep_fn);
};
//
// 日付区切り文字変更
scheduleCommon.dateSeparatorChange = function (dateString, separator) {
	return dateString.replace(/[/]/g, separator);
};
// 月の日数を取得する
scheduleCommon.getDaysCount = function(year,month) {
	var d = new Date(year,month ,1 ,0,0,0,0);
	var dayOfMonth = d.getDate();
	d.setDate(dayOfMonth - 1);
	return d.getDate();
};
// 曜日を取得する
scheduleCommon.getDay = function(year,month,date) {
	var d = new Date(year,month - 1, date ,0,0,0,0);
	return d.getDay();
};
// 特定の日に日数を加算した日を取得する
scheduleCommon.addDayCount = function(year,month,date,count) {
	var d = new Date(year,month - 1 ,date ,0,0,0,0);
	var t = d.getTime();
	t = t + (count * 86400000);
	d.setTime(t);
	return d;
};
// 開始日付＋日数
scheduleCommon.addDate = function (start_date, count) {
	var t = start_date.getTime();
	t = t + (count * 86400000);
	var d = new Date();
	d.setTime(t);
	return d;
};
scheduleCommon.dateStringToDate = function (dateString) {
	var date = new Date(dateString);
	return date;
};

// 日数計算
scheduleCommon.calcDateCount = function (from, to) {
	var s = scheduleCommon.dateStringToDate(from);
	var e = scheduleCommon.dateStringToDate(to);
	var d = scheduleCommon.getDateCount(s, e);
	return d;
};

scheduleCommon.getDateCount = function (start, end) {
	if ((start == null) || (end == null)) {
		return 0;
	}
	var d = end.getTime() - start.getTime();
	d = Math.floor((d / (24 * 3600 * 1000)) + 1);
	return d;
};


// 前月
scheduleCommon.prevMonth = function (start_date, disp_span) {
	var startDate = start_date;
	var d = scheduleCommon.dateStringToDate(start_date);
	d = scheduleCommon.addDate(d, -(disp_span * 30));
	startDate = scheduleCommon.getDateString(d, "{0}/{1}/{2}");
	return startDate;
};
// 次月
scheduleCommon.nextMonth = function (start_date, disp_span) {
	var startDate = start_date;
	var d = scheduleCommon.dateStringToDate(start_date);
	d = scheduleCommon.addDate(d, (disp_span * 30));
	startDate = scheduleCommon.getDateString(d, "{0}/{1}/{2}");
	return startDate;
};
// 確認ダイアログの表示(JQuery)
scheduleCommon.showConfirmDialog = function(target, title, comment, okFunc) {
    var strTitle = title;
	var strComment = comment;
    // ダイアログのメッセージを設定
    $( target ).html( strComment );
    // ダイアログを作成
    $( target ).dialog({
        modal: true,
        title: strTitle,
        buttons: {
			"OK": okFunc,
			"キャンセル": function () {
				$(this).dialog("close");
			}
        }
    });
}
