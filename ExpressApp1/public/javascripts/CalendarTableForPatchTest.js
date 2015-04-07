//
// パッチテストのカレンダー表示用テーブルの生成
//

var CalendarTableForPatchTest =  CalendarTableForPatchTest || {};
CalendarTableForPatchTest.schedule = null;
CalendarTableForPatchTest.base_cd = null;
CalendarTableForPatchTest.days = ['日','月','火','水','木','金','土'];
CalendarTableForPatchTest.days_color = ['red','black','black','black','black','black','blue'];
CalendarTableForPatchTest.start_date_list = [null,null,null,null,null];
CalendarTableForPatchTest.end_date_list = [null,null,null,null,null];
CalendarTableForPatchTest.init = function () {
	var ymd = CalendarTable.start_date.split("/");
	var year = ymd[0];
	var month = ymd[1];
	$("#" + CalendarTable.current_div).empty();
	
	// 指定された年月の日数を取得する
	var days = scheduleCommon.getDaysCount(year, month);
	// 月の初めの曜日を取得する
	var day = scheduleCommon.getDay(year, month, 1);
	// 週初めの日付を算出する
	var startDate = scheduleCommon.addDayCount(year, month, 1, ((day - 1) * -1));
	// テーブル生成
	var width = $("#" + CalendarTable.current_div).width();
	var height = $("#" + CalendarTable.current_div).height();
	var left_width = 40;
	var right_width = width - left_width - 20;
	var patch_tbl = $("<div class='cal_patch_base'></div>");
	var patch_tbl_header = $("<div class='cal_patch_header'></div>");
	var patch_tbl_body = $("<div class='cal_patch_body'></div>");
	var left_div = $("<div class='cal_patch_left_div'></div>");
	var right_div = $("<div class='cal_patch_right_div'></div>");
	$(left_div).css("width", left_width + "px");
	$(right_div).css("width", right_width + "px");
	$(patch_tbl_body).css("height", height - 80 + "px");
	$(patch_tbl).append(patch_tbl_header);
	$(patch_tbl).append(patch_tbl_body);
	$(patch_tbl_header).append(left_div);
	$(patch_tbl_header).append(right_div);
	$("#" + CalendarTable.current_div).append(patch_tbl);
	
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
	var w1 = Math.floor(right_width / 10) - 2;
	for (var t = 0; t < 5; t++) {
		var week_u = $("<div class='cal_patch_week_header_up'></div>");
		var endDate = scheduleCommon.addDayCount(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), 4);
		$(week_u).append(scheduleCommon.getDateString(startDate, "{0}/{1}/{2}") + "(" + CalendarTableForPatchTest.days[startDate.getDay()] + ")" + "～" 
			+ scheduleCommon.getDateString(endDate, "{1}/{2}") + "(" + CalendarTableForPatchTest.days[endDate.getDay()] + ")");
		$(week_u).css("width", (w1 * 2) + "px");
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
		$(week_l).css("width", w1 + "px");
		$(patch_week_h2).append(week_l);
	}
	$(patch_week_div).append(patch_week_h1);
	$(patch_week_div).append(patch_week_h2);
	
	//$(patch_week_div).append(patch_week);
	$(right_row).append(patch_week_div);
	//$("#" + dd).append(patch_memo);
	// 検体数分のカレンダー行を生成
	CalendarTableForPatchTest.createCalendar(patch_tbl_body, year, month, width, right_width);
	// 試験スケジュールデータの検索と表示（他の試験と共通）
	CalendarTable.searchScheduleData(CalendarTableForPatchTest.start_date_list[0], CalendarTableForPatchTest.end_date_list[4], CalendarTable.current_base_cd,"02", CalendarTableForPatchTest.addScheduleData);
};

// スケジュールデータを表示用テーブルに追加する
CalendarTableForPatchTest.addScheduleData = function (schedule_list) {
	if (schedule_list != null) {
		var rows = schedule_list.rows;
		for (var i in rows) {
			var sch = $("<div class='schedule_data'></div>");
			$(sch).attr("id", rows[i].schedule_id);
			$(sch).append(rows[i].entry_title + " " + rows[i].test_item);
			var sd = scheduleCommon.dateSeparatorChange(rows[i].start_date,"-");
			var am_pm = rows[i].am_pm;
			var patch_no = rows[i].patch_no;
			// スケジュールを表示する要素のIDを生成する
			var id = "#schedule_" + rows[i].base_cd + "_" + sd + "_" + am_pm + "_" + patch_no;
			$(id).append(sch);
			var data = {
				schedule_id: rows[i].schedule_id,
				entry_no: rows[i].entry_no,
				entry_title: rows[i].entry_title,
				quote_detail_no: rows[i].quote_detail_no,
				test_item: rows[i].test_item,
				start_date: rows[i].start_date, 
				end_date: rows[i].end_date,
				am_pm: rows[i].am_pm, 
				patch_no: rows[i].patch_no,
				test_type: "02",	// 安全性試験
				base_cd: rows[i].base_cd
			};
			$(sch).data('schedule', data);
			// 権限チェック
			if (CalendarTable.auth == 2) {
				// ダイアログ表示イベント登録
				$(sch).bind('click', CalendarTable.openDialog);
				// ドラッグ可能化
				$(sch).draggable({ zIndex: 1000});
			}

		}
	}
};
// スケジュールを表示するテーブルを生成する
CalendarTableForPatchTest.createCalendar = function (patch_tbl_body, year, month, width, right_width) {
	var left_width = 40;
	//var right_width = width - left_width;
	var left_div = $("<div class='cal_patch_left_div'></div>");
	var right_div = $("<div class='cal_patch_right_div'></div>");
	$(left_div).css("width", left_width + "px");
	$(right_div).css("width", right_width + "px");
	// 検体数分のカレンダー行を生成
	for (var i = 1; i <= 30; i++) {
		var left_row = $("<div class='cal_patch_left_row'></div>");
		var right_row = $("<div class='cal_patch_right_row'></div>");
		var day = scheduleCommon.getDay(year, month, i);
		var patch_no = $("<div class='cal_patch_no'></div>");
		var patch_week_div = $("<div class='cal_patch_week_div'></div>");
		//var patch_memo  = $("<div class='cal_patch_memo'></div>");
		$(left_div).append(left_row);
		$(right_div).append(right_row);
			
		// 検体番号の生成
		$(patch_no).append(i);
		var line = i % 2;
		$(left_row).append(patch_no);
		// スケジュール追加用エリア生成
		var w1 = Math.floor(right_width / 10) - 2;
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
			var start = scheduleCommon.getDateString(CalendarTableForPatchTest.start_date_list[Math.floor(t / 2)], "{0}-{1}-{2}");
			var end = scheduleCommon.getDateString(CalendarTableForPatchTest.end_date_list[Math.floor(t / 2)], "{0}-{1}-{2}");
			// divの情報（No、日付など）
			var info = { patch_no: i, base_cd: CalendarTable.current_base_cd, start_date: start, end_date:end,am_pm: cc };
			$(week_l).attr("id", "schedule_" + CalendarTable.current_base_cd + "_" + start + "_" + cc + "_" + i);
			$(week_l).css("width", w1 + "px");
			$(week_l).data('info', info);
			// 追加用ボタンのイベント処理登録
			start = scheduleCommon.getDateString(CalendarTableForPatchTest.start_date_list[Math.floor(t / 2)], "{0}/{1}/{2}");
			end = scheduleCommon.getDateString(CalendarTableForPatchTest.end_date_list[Math.floor(t / 2)], "{0}/{1}/{2}");
			var data = {
				schedule_id: 0,
				start_date: start, 
				end_date: end,
				am_pm: cc, 
				patch_no: i,
				test_type: "02",	// 安全性試験
				base_cd: CalendarTable.current_base_cd
			};
			$(week_l).append(add_btn);
			$(add_btn).data('schedule', data);
			$(patch_week_div).append(week_l);
			// 権限チェック
			if (CalendarTable.auth == 2) {
				// 編集用ダイアログ表示イベント登録
				$(add_btn).bind('click', CalendarTable.openDialog);
				// Droppable設定
				$(week_l).droppable({ drop: CalendarTableForPatchTest.drop });
			}
		}
		//$("#" + dd).append(patch_branch_title);
		$(right_row).append(patch_week_div);
		$(right_row).css("top", (i - 1) * 60);
	//$("#" + dd).append(patch_memo);
	}
	$(patch_tbl_body).append(left_div);
	$(patch_tbl_body).append(right_div);
};

// ドロップイベント処理
CalendarTableForPatchTest.drop = function (event, ui) {
	var left = ui.position.left;
	var top = ui.position.top;
	var data = $(ui.draggable).data('schedule');
	var info = $(event.target).data('info');
	data.start_date = info.start_date;
	data.end_date = info.end_date;
	data.am_pm = info.am_pm;
	data.patch_no = info.patch_no;
	// 要素に設定するカスタムデータを更新する
	$(ui.draggable).data('schedule', data);
	// ドラッグした要素をターゲットの子要素として追加する
	$(ui.draggable).css('top', 0);
	$(ui.draggable).css('left', 0);
	$(event.target).append(ui.draggable);
	// 更新されたデータでDBのデータを更新する
	CalendarTable.setFormData(data);	// 入力フォームにデータを入れて
	CalendarTable.updateSchedule();		// 更新処理を実行する（ダイアログから更新する処理を利用）

};