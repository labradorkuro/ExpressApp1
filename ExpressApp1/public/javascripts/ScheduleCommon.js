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
