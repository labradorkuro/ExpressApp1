//
// 共通処理
var scheduleCommon = scheduleCommon || {};
scheduleCommon.base_cd = [{ base_cd: "00", base_name: "共通" },{ base_cd: "01", base_name: "本社" },{ base_cd: "02", base_name: "札幌" }];
scheduleCommon.entry_status = [{ entry_status: "01", status_name: "引合" },{ entry_status: "02", status_name: "見積" },{ entry_status: "03", status_name: "依頼" },{ entry_status: "04", status_name: "完了" },{ entry_status: "05", status_name: "失注" }];
scheduleCommon.user_list = new Array();

// ランダム文字列生成
scheduleCommon.string_random = function() {
	// 生成する文字列の長さ
	var l = 8;
	// 生成する文字列に含める文字セット
	var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var cl = c.length;
	var r = "";
	for(var i=0; i<l; i++){
	    r += c[Math.floor(Math.random()*cl)];
	}
	return r;
}
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
scheduleCommon.getUserInfo = function (ref) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/user_get/?rows=100&delete_check=0', true);
	xhr.responseType = 'json';
	if (ref == "_ref") {
		xhr.onload = scheduleCommon.onloadUserReqRef;
	} else {
		xhr.onload = scheduleCommon.onloadUserReq;
	}
	xhr.send();
};
scheduleCommon.onloadUserReq = function (e) {
	if (this.status == 200) {
		var users = this.response;
		// formに取得したデータを埋め込む
		$("#sales_person_id").empty();
		$("#test_person_id").empty();
		$("#input_operator_id").empty();
		$("#confirm_operator_id").empty();
		scheduleCommon.user_list = new Array();
		// 先頭に空行を入れる
		$("#sales_person_id").append("<option value=''></option>");
		$("#test_person_id").append("<option value=''></option>");
		$("#input_operator_id").append("<option value=''></option>");
		$("#confirm_operator_id").append("<option value=''></option>");
		for (var i in users.rows) {
			var user = users.rows[i].cell;
			scheduleCommon.user_list.push(user);
			$("#sales_person_id").append("<option value=" + user.uid + ">" + user.name);
			$("#test_person_id").append("<option value=" + user.uid + ">" + user.name);
			$("#input_operator_id").append("<option value=" + user.uid + ">" + user.name);
			$("#confirm_operator_id").append("<option value=" + user.uid + ">" + user.name);
		}
	}
};
scheduleCommon.onloadUserReqRef = function (e) {
	if (this.status == 200) {
		var users = this.response;
		// formに取得したデータを埋め込む
		$("#sales_person_id_ref").empty();
		$("#test_person_id_ref").empty();
		$("#input_operator_id_ref").empty();
		$("#confirm_operator_id_ref").empty();
		scheduleCommon.user_list = new Array();
		// 先頭に空行を入れる
		$("#sales_person_id_ref").append("<option value=''></option>");
		$("#test_person_id_ref").append("<option value=''></option>");
		$("#input_operator_id_ref").append("<option value=''></option>");
		$("#confirm_operator_id_ref").append("<option value=''></option>");
		for (var i in users.rows) {
			var user = users.rows[i].cell;
			scheduleCommon.user_list.push(user);
			$("#sales_person_id_ref").append("<option value=" + user.uid + ">" + user.name);
			$("#test_person_id_ref").append("<option value=" + user.uid + ">" + user.name);
			$("#input_operator_id_ref").append("<option value=" + user.uid + ">" + user.name);
			$("#confirm_operator_id_ref").append("<option value=" + user.uid + ">" + user.name);
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
// 拠点CD
scheduleCommon.base_cdFormatter = function (cellval, options, rowObject) {
	return scheduleCommon.getBase_cd(cellval);
};
// jqgridのユーザ表示用
scheduleCommon.personFormatter = function (cellval, options, rowObject) {
	var name = "";
	if (cellval === "drc_admin") {
		return "管理者";
	}
	for (var i in scheduleCommon.user_list) {
		if (cellval === scheduleCommon.user_list[i].uid) {
			name = scheduleCommon.user_list[i].name;
		}
			break;
		}
	return name;
};
scheduleCommon.pay_resultFormatter = function(cellval, options, rowObject) {
	if (cellval == 0) return "請求待ち";
	if (cellval == 1) return "請求可";
	if (cellval == 2) return "請求済";
	if (cellval == 3) return "入金確認済";

};
scheduleCommon.billing_kindFormatter = function(cellval, options, rowObject) {
	if (cellval == 0) return "クライアント";
	if (cellval == 1) return "代理店";
	if (cellval == 2) return "その他";
	return "";
};
// 試験場のフォーマッター
scheduleCommon.shikenjoFormatter = function (cellval, options, rowObject) {
	if (cellval == "大阪") return cellval;
	if (cellval == "札幌") return cellval;
	if (cellval == "東京") return cellval;

	if (cellval == 1)
		return "大阪";
	else if (cellval == 2)
		return "札幌";
	else if (cellval == 3)
		return "東京";
};

// jqgridのフォントサイズを変える
scheduleCommon.changeFontSize = function(s){
	var size = '1.1em';
	if (s) size = s;
	$('.ui-widget-header').css('color',"darkgreen");
    $('div.ui-jqgrid').css('font-size', size);
	$('div.ui-jqgrid-view').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('height', size).children('div').css('height', size);
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

// 201707_issue
// 指定された日数を加算した納期を取得する
// base_date:起算日
// period_term:日数
// period_unit:日数の単位 0:営業日、1:週
scheduleCommon.calcPeriod = function(base_date,period_term,cb) {
	// 加算した納期を取得する
	// 期間中に土日休日があるかチェックしてその分ずらす
	var period_date = scheduleCommon.checkWeekend(base_date,period_term);

	// 休日リストに登録されている休日が含まれるかチェックする
	$.get('/holiday_search_term?start_date=' + base_date + "&end_date=" + period_date,function(response) {
		response.forEach(function(holiday,index){
			var cnt = scheduleCommon.getDateCount(scheduleCommon.dateStringToDate(holiday.start_date),scheduleCommon.dateStringToDate( holiday.end_date));
			period_date = scheduleCommon.addDate(period_date, cnt);
		});
		// callback
		cb(period_date);
	});
　
}
// 週単位から日単位に変換
scheduleCommon.weekToDays = function(date_count) {
	return (5 * date_count);
}
// 与えられた期間中の曜日を調べて土日の場合はその分後ろへずらす
scheduleCommon.checkWeekend = function(start_date, count) {
	for(var i = 1;i <= count;i++) {
		var td = scheduleCommon.addDate(start_date, i);
		var day = td.getDay();
		if ((day == 0) || (day == 6)) {
			// 日曜日または土曜日
			count++;
		}
	}
	return scheduleCommon.addDate(start_date, count);
}

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
scheduleCommon.personFormatter = function (cellval, options, rowObject) {
	var name = "";
	if (cellval === "drc_admin") {
		return "管理者";
	}
	for (var i in scheduleCommon.user_list) {
		if (cellval === scheduleCommon.user_list[i].uid) {
			name = scheduleCommon.user_list[i].name;
			break;
		}
	}
	return name;
};
scheduleCommon.item_typeFormatter = function (cellval, options, rowObject) {
	var name = "";
	if (cellval === 1) {
		name = "大分類";
	} else if (cellval == 2) {
		name = "中分類";
	}
	return name;
};
// 納期の単位
scheduleCommon.period_unitFormatter = function (cellval, options, rowObject) {
	var name = "";
	if (cellval === 0) {
		name = "営業日";
	} else if (cellval == 1) {
		name = "週";
	}
	return name;
};
// 請求可のフォーマッター
scheduleCommon.payResultFormatter = function (cellval, options, rowObject) {
	var result = "<label style='color:red;font-weight:bold;'>未登録</>";
	if (cellval != null) {
		if (cellval == "請求待ち") return cellval;
		if (cellval == "請求可") return cellval;
		if (cellval == "請求済") return cellval;
		if (cellval == "入金済") return cellval;
		switch(cellval) {
			case 0:result = "請求待ち";
			break;
			case 1:result = "請求可";
			break;
			case 2:result = "請求済";
			break;
			case 3:result = "入金済";
			break;
		}
		if (rowObject.pay_result_1 > 0) {	// 請求可があればそれを優先する
			result = "請求可";
		}
	}
	return result;
};

scheduleCommon.numFormatterC = function(num) {
	if (num == null) return "";
	return scheduleCommon.numFormatter(Math.round(num),10);
}
// 数値のカンマ区切り
scheduleCommon.numFormatter = function(num,keta) {
	var sp = "";
	for(var i = 0;i < keta - 1;i++) sp += " ";
	return (sp + String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' )).slice(-keta);
}
// 数値（数字）チェック
scheduleCommon.isNumber = function(x) {
	if( typeof(x) != 'number' && typeof(x) != 'string' )
		return false;
	else
		return (x == parseFloat(x) && isFinite(x));
};
scheduleCommon.addYenMark = function(str) {
	var wk = "";
	var lastIndex = str.lastIndexOf(" ");
	var bf = str.substring(0,lastIndex - 1) + "\\";
	var af = str.substring(lastIndex + 1);
	return bf + af;
};
// ユーザ権限リストの取得 authにはF01:0,F02:0,F03:0,F04:0,F05:0,F06:0,F07:0,F08:0,F09:0,F10:0,F11:1,F12:1のように渡される
scheduleCommon.getAuthList = function(auth) {
	var auth_array = [];
	if (auth != null && auth != "") {
		var list = auth.split(",");
		for(var i in list) {
			var name_value = list[i].split(":");
			auth_array.push({name:name_value[0],value:Number(name_value[1])});
		}
	}
	return auth_array;
};


// 入力文字チェック（カナ）
scheduleCommon.checkKana = function(str) {
	var result = true;
	for(var cnt=0;cnt<str.length;cnt++){
		if(str[cnt].match(/^[ 　ァ-ヶー]*$/) == null){
			result = false;
			break;
		}
	}
	return result;
}
scheduleCommon.checkUserAgent = function(window) {
	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();

    if (userAgent.indexOf('msie') != -1) {
        //IE6～9（おそらく）
        if (appVersion.indexOf("msie 6.") != -1) {
            //IE6での処理
        }else if (appVersion.indexOf("msie 7.") != -1) {
            //IE7での処理
        }else if (appVersion.indexOf("msie 8.") != -1) {
            //IE8での処理
        }else if (appVersion.indexOf("msie 9.") != -1) {
            //IE9での処理
        }
		return "IE";
    }else if (userAgent.indexOf('chrome') != -1) {
        //Chrome/Opera（最新版）での処理
		return 'chrome';
    }else if (userAgent.indexOf('safari') != -1) {
        //Safariでの処理
		return 'safari';
    }else if (userAgent.indexOf('firefox') != -1) {
        //Firefoxでの処理
		return 'firefox';
    }
	return '';
}
scheduleCommon.setQuotation = function(str) {
	return "\"" + str + "\"";
}
// end
