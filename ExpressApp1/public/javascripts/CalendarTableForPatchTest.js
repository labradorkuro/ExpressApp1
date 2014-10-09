//
// パッチテストのカレンダー表示用テーブルの生成
//

var CalendarTableForPatchTest =  CalendarTableForPatchTest || {};
CalendarTableForPatchTest.schedule = null;
CalendarTableForPatchTest.days = ['日','月','火','水','木','金','土'];
CalendarTableForPatchTest.days_color = ['red','black','black','black','black','black','blue'];
CalendarTableForPatchTest.start_date_list = [null,null,null,null,null];
CalendarTableForPatchTest.end_date_list = [null,null,null,null,null];
CalendarTableForPatchTest.init = function (id, year, month) {
	// 指定された年月の日数を取得する
	var days = scheduleCommon.getDaysCount(year, month);
	// 月の初めの曜日を取得する
	var day = scheduleCommon.getDay(year, month, 1);
	// 週初めの日付を算出する
	var startDate = scheduleCommon.addDayCount(year, month, 1, ((day - 1) * -1));
	// テーブル生成
	var patch_tbl = $("<div class='cal_patch_base'></div>");
	var left_div = $("<div class='cal_patch_left_div'></div>");
	var right_div = $("<div class='cal_patch_right_div'></div>");
	$(patch_tbl).append(left_div);
	$(patch_tbl).append(right_div);
	$("#" + id).append(patch_tbl);
	
	// ヘッダー生成
	var left_row = $("<div class='cal_patch_left_row'></div>");
	var right_row = $("<div class='cal_patch_right_row'></div>");
	$(left_div).append(left_row);
	$(right_div).append(right_row);
	var patch_no = $("<div class='cal_patch_no'>No.</div>");
	var patch_week_div = $("<div class='cal_patch_week_div'></div>");
	//var patch_week = $("<div class='cal_patch_week'></div>");
	var patch_week_h1 = $("<div class='cal_patch_week_header_1'></div>");
	var patch_week_h2 = $("<div class='cal_patch_week_header_2'></div>");
	//var patch_memo  = $("<div class='cal_patch_memo' align='center'>備考</div>");
	$(left_row).append(patch_no);
	//$("#" + dd).append(patch_branch_title);
	// 1週間の日付表示
	for (var t = 0; t < 5; t++) {
		var week_u = $("<div class='cal_patch_week_header_up'></div>");
		var endDate = scheduleCommon.addDayCount(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), 4);
		$(week_u).append(scheduleCommon.getDateString(startDate, "{0}/{1}/{2}") + "(" + CalendarTableForPatchTest.days[startDate.getDay()] + ")" + "～" 
			+ scheduleCommon.getDateString(endDate, "{1}/{2}") + "(" + CalendarTableForPatchTest.days[endDate.getDay()] + ")");
		//$(week_u).css("left", 242 * t);
		$(patch_week_h1).append(week_u);
		// 開始日付と終了日付を保存する
		CalendarTableForPatchTest.start_date_list[t] = startDate;
		CalendarTableForPatchTest.end_date_list[t] = endDate;
		// 開始日付を次の週に進めておく
		startDate = scheduleCommon.addDayCount(startDate.getFullYear(), (startDate.getMonth() + 1), startDate.getDate() , 7);
	}
	// AMPMの表示
	for (var t = 0; t < 10; t++) {
		var week_l = $("<div class='cal_patch_week_header_low'></div>");
		if ((t % 2) === 0) {
			$(week_l).append("AM");
			$(week_l).css("background-color", "#ccffff");
		} else {
			$(week_l).append("PM");
			$(week_l).css("background-color", "#00ffcc");
		}
		
		//$(week_l).css("left", 121 * t);
		$(patch_week_h2).append(week_l);
	}
	$(patch_week_div).append(patch_week_h1);
	$(patch_week_div).append(patch_week_h2);
	
	//$(patch_week_div).append(patch_week);
	$(right_row).append(patch_week_div);
	//$("#" + dd).append(patch_memo);
	// 検体数分のカレンダー行を生成
	for (var i = 1; i <= 30; i++) {
		var left_row = $("<div class='cal_patch_left_row'></div>");
		var right_row = $("<div class='cal_patch_right_row'></div>");
		var day = scheduleCommon.getDay(year, month, i);
		var patch_no = $("<div class='cal_patch_no'></div>");
		var patch_week_div = $("<div class='cal_patch_week_div'></div>");
		//var patch_memo  = $("<div class='cal_patch_memo'></div>");
		
		// 検体番号の生成
		$(patch_no).append(i);
		var line = i % 2;
		$(left_row).append(patch_no);
		// スケジュール追加用エリア生成
		for (var t = 0; t < 10; t++) {
			var add_btn = $("<a class='cal_add_button'>+</a>");
			var week_l = $("<div class='cal_patch_week_day'></div>");
			var cc = t % 2;
//			if (line === 0) {
//				if (cc === 1) {
//					$(week_l).css("background-color", "#00ffcc");
//				} else {
//					$(week_l).css("background-color", "#ccffff");
//				}
//			}
			$(week_l).attr("id", "schedule_" + (i - 1) + "_" + t);
			$(add_btn).bind('click',
				 {
				start_date: CalendarTableForPatchTest.start_date_list[Math.floor(t / 2)], 
				end_date: CalendarTableForPatchTest.end_date_list[Math.floor(t / 2)],
				am_pm:cc, 
				patch_no: i
			}, CalendarTable.openDialog);
			$(week_l).append(add_btn);
			$(patch_week_div).append(week_l);
		}
		//$("#" + dd).append(patch_branch_title);
		$(right_row).append(patch_week_div);
		//$("#" + dd).append(patch_memo);
		$(left_div).append(left_row);
		$(right_div).append(right_row);
		
	}
};

CalendarTableForPatchTest.searchScheduleData = function () {
	
	$.ajax({
		url: '/schedule_get/term/' + GanttTable.dateSeparatorChange(ganttData.from, '-') + '/' + GanttTable.dateSeparatorChange(ganttData.to, '-') + '/' + ganttData.test_type,
		cache: false,
		dataType: 'json',
		success: function (entry_list) {
			//GanttTable.ganttData = ganttData;
			GanttTable.createEntryRows(ganttData, entry_list, left_div, right_div, dateCount);
		}
	});

};
