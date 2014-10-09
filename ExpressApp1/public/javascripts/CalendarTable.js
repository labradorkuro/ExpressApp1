//
// カレンダー表示用テーブルの生成
//

var CalendarTable =  CalendarTable || {};
CalendarTable.schedule = null;
CalendarTable.days = ['日','月','火','水','木','金','土'];
CalendarTable.days_color = ['red','black','black','black','black','black','blue'];

CalendarTable.init = function(id,year,month) {
	// 指定された年月の日数を取得する
	var days = scheduleCommon.getDaysCount(year,month);
	// ヘッダー生成
	var day_div = $("<div class='cal_day_base'></div>");
	var day_date = $("<div class='cal_date' align='center'>日</div>");
	var day_day  = $("<div class='cal_day' align='center'>曜日</div>");
	var day_times = $("<div class='cal_day_times'></div>");
	var day_memo  = $("<div class='cal_memo' align='center'>備考</div>");
	var dd = id + "_header";
	$(day_div).attr("id",dd);
	$("#" + id).append(day_div);
	$("#" + dd).append(day_date);
	$("#" + dd).append(day_day);
	// 時間表示
	for(var t = 0;t < 13;t++) {
		var day_times_u = $("<div class='cal_day_times_header_up' align='center'></div>");
		$(day_times_u).append(t + 8);
		$(day_times).append(day_times_u);
	}
	// 15分刻みの表示
	for(var t = 0;t < 52;t++) {
		var day_times_l = $("<div class='cal_day_times_header_low' align='center'></div>");
		$(day_times).append(day_times_l);
	}
	$("#" + dd).append(day_times);
	$("#" + dd).append(day_memo);
	// 日数分のカレンダー行を生成
	for(var i = 1; i <= days;i++) {
		var day = scheduleCommon.getDay(year,month,i);
		day_div = $("<div class='cal_day_base'></div>");
		day_date = $("<div class='cal_date' align='right'></div>");
		day_day  = $("<div class='cal_day' align='center'></div>");
		day_times = $("<div class='cal_day_times'" + " id='cal_day_times_" + i + "'></div>");
		day_memo  = $("<div class='cal_memo'></div>");
		
		dd = id + "_" + i;
		$(day_div).attr("id",dd);
		if ((i % 2) === 0) {
			$(day_div).css("background-color","#ecf9d2");
		} 
		$("#" + id).append(day_div);
		$(day_date).append(i);
		$(day_day).append(CalendarTable.days[day]);
		$(day_day).css("color",CalendarTable.days_color[day]);
		$("#" + dd).append(day_date);
		$("#" + dd).append(day_day);
		$("#" + dd).append(day_times);
		$("#" + dd).append(day_memo);
		$(day_times).click(CalendarTable.showEditDialog);
		
	}

};
CalendarTable.showEditDialog = function() {
	var id = $(this).attr("id");
	alert("click:" + id);
};

// 試験スケジュール編集ダイアログ表示
CalendarTable.openDialog = function (event) {
	// eventに渡されたデータをフォームにセットする
	$("#start_date").val(scheduleCommon.getDateString(event.data.start_date, "{0}/{1}/{2}"));
	$("#end_date").val(scheduleCommon.getDateString(event.data.end_date, "{0}/{1}/{2}"));
	$("#patch_no").val(event.data.patch_no);
	$("#am_pm").val(event.data.am_pm);
	$("#schedule_dialog").dialog("open");
};

// 試験スケジュールのDB追加
CalendarTable.addSchedule = function () {
};
