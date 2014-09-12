//
// 共通処理
var scheduleCommon = scheduleCommon || {};

// jqgridのフォントサイズを変える
scheduleCommon.changeFontSize = function(size){
    $('div.ui-jqgrid').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('height', size)
        .children('div').css('height', size);
    $('div.ui-jqgrid-pager').css('height', size);
    $('div.ui-jqgrid-pager').css('font-size', '1em');
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
scheduleCommon.getDateString = function(date,format_str) {
	var date_format = scheduleCommon.format(format_str,
			date.getFullYear(),
			date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1),
		    date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
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