//
// カレンダー表示用テーブルの生成
//

var CalendarTable = CalendarTable || {};
CalendarTable.start_date = null;
CalendarTable.schedule = null;
CalendarTable.days = ['日','月','火','水','木','金','土'];
CalendarTable.days_color = ['red','black','black','black','black','black','blue'];
CalendarTable.width_15 = [];
CalendarTable.init = function(id, test_type) {
	var ymd = CalendarTable.start_date.split("/");
	var year = ymd[0];
	var month = ymd[1];
	$("#" + id).empty();
	// 表示幅の取得
	var width = $("#" + id).width();
	var height = $("#" + id).height();
	var times_width = width - 240;
	// 指定された年月の日数を取得する
	var days = scheduleCommon.getDaysCount(year,month);
	// ヘッダー生成
	var day_div = $("<div class='cal_day_base'></div>");
	var header = $("<div class='cal_header'></div>");
	var body = $("<div class='cal_body'></div>");
	var day_date = $("<div class='cal_date' align='center'>日</div>");
	var day_day  = $("<div class='cal_day' align='center'>曜日</div>");
	var day_times = $("<div class='cal_day_times'></div>");
	var day_memo  = $("<div class='cal_memo' align='center'>備考</div>");
	var dd = id + "_header";
	$(day_div).attr("id",dd);
	$("#" + id).append(day_div);
	$(day_div).append(header);
	$(day_div).append(body);
	$(header).append(day_date);
	$(header).append(day_day);
	// 15分刻みを表示する幅を保存しておく
	CalendarTable.width_15[test_type] = Math.floor((times_width - 52) / 52);
	var dtw = (CalendarTable.width_15[test_type] * 52) + 52;
	$(body).css("width", dtw + 233 + "px");
	$(body).css("height", (height - 42) + "px");
	$(day_div).css("width", dtw + 212 + "px");
	$(day_times).css("width", dtw + "px");
	// 時間表示
	for(var t = 0;t < 13;t++) {
		var day_times_u = $("<div class='cal_day_times_header_up' align='center'></div>");
		$(day_times_u).append(t + 8 + " 時");
		$(day_times_u).css("width", ((CalendarTable.width_15[test_type] * 4) + 3)+ "px");
		$(day_times).append(day_times_u);
	}
	// 15分刻みの表示
	for(var t = 0;t < 52;t++) {
		var day_times_l = $("<div class='cal_day_times_header_low' align='center'></div>");
		var m = t % 4;
		$(day_times_l).append(m * 15);
		$(day_times_l).css("width", CalendarTable.width_15[test_type] + "px");
		$(day_times).append(day_times_l);
	}
	$(header).append(day_times);
	$(header).append(day_memo);
	var start_date = new Date(year, month - 1, 1 , 0, 0, 0, 0);;
	var end_date = new Date(year, month - 1, 1 , 0, 0, 0, 0);;
	// 日数分のカレンダー行を生成
	for(var i = 1; i <= days;i++) {
		var day = scheduleCommon.getDay(year,month,i);
		end_date = new Date(start_date.getTime() + ((24 * 3600 * 1000) * (i - 1)));
		var ymd = scheduleCommon.getDateString(end_date, "{0}-{1}-{2}");
		day_div = $("<div class='cal_day_base'></div>");
		day_date = $("<div class='cal_date' align='right'></div>");
		day_day  = $("<div class='cal_day' align='center'></div>");
		day_times = $("<div class='cal_day_times'" + " id='cal_day_times_" + ymd + "-" + test_type + "'></div>");
		day_memo  = $("<div class='cal_memo'></div>");
		
		dd = id + "_" + i;
		$(day_div).css("width", dtw + 212 + "px");
		$(day_div).attr("id",dd);
		if ((i % 2) === 0) {
			$(day_div).css("background-color","#ecf9d2");
		} 
		$(body).append(day_div);
		$(day_times).css("width", dtw + "px");
		if (i === 1) {
			var m = Number(month);
			$(day_date).append(m + "/" + i);
		}
		else
			$(day_date).append(i);
		$(day_day).append(CalendarTable.days[day]);
		$(day_div).css("color", CalendarTable.days_color[day]);
		$(day_day).css("color", CalendarTable.days_color[day]);
		// 祝日チェック		
		var holidayname = amaitortedays.isNationalHoliday(end_date);
		if (holidayname) {
			$(day_div).css("color", CalendarTable.days_color[0]);
			$(day_day).css("color", CalendarTable.days_color[0]);
		}
		$(day_div).append(day_date);
		$(day_div).append(day_day);
		$(day_div).append(day_times);
		$(day_div).append(day_memo);
		$(day_times).bind('click',
		{
			schedule_id: 0,
			start_date: scheduleCommon.getDateString(end_date,"{0}/{1}/{2}"), 
			end_date: scheduleCommon.getDateString(end_date, "{0}/{1}/{2}"),
			am_pm: "00", 
			patch_no: 0,
			test_type: test_type
		}, CalendarTable.openDialog);
		
	}
	// スケジュールデータを検索して表示する
	CalendarTable.searchScheduleData(start_date, end_date, "01", test_type, CalendarTable.addScheduleData);

};

// 試験スケジュール編集ダイアログ表示
CalendarTable.openDialog = function (event) {
	// 初期化
	$("#entry_no").val("");
	$("#entry_title").val("");
	$("#quote_detail_no").val("");
	$("#test_item").val("");
	$("#start_date").val("");
	$("#end_date").val("");
	$("#start_time").val("");
	$("#end_time").val("");
	$("#patch_no").val("1");
	$("#am_pm").val("0");
	// 安全性試験の時はAMPMの選択とパッチ番号の選択を表示する。それ以外は非表示にする。
	if (event.data.test_type === "02") {
		$("#test_02_row").css("display", "table-row");
	} else {
		$("#test_02_row").css("display", "none");
	}
	// eventに渡されたデータをフォームにセットする
	var sd = event.data.start_date;
	var ed = event.data.end_date;
	if (event.data.entry_no) {
		$("#entry_no").val(event.data.entry_no);
	}
	if (event.data.entry_title) {
		$("#entry_title").val(event.data.entry_title);
	}
	if (event.data.quote_detail_no) {
		$("#quote_detail_no").val(event.data.quote_detail_no);
	}
	if (event.data.test_item) {
		$("#test_item").val(event.data.test_item);
	}
	$("#schedule_id").val(event.data.schedule_id);
	if (event.data.schedule_id) {
		$(".ui-dialog-buttonpane button:contains('追加')").button("disable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("enable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("enable");
	} else {
		$(".ui-dialog-buttonpane button:contains('追加')").button("enable");
		$(".ui-dialog-buttonpane button:contains('更新')").button("disable");
		$(".ui-dialog-buttonpane button:contains('削除')").button("disable");
	}
	$("#start_date").val(sd);
	$("#end_date").val(ed);
	if (event.data.start_time) {
		$("#start_time").val(event.data.start_time);
	}
	if (event.data.end_time) {
		$("#end_time").val(event.data.end_time);
	}
	$("#patch_no").val(event.data.patch_no);
	$("#am_pm").val(event.data.am_pm);
	// 案件番号をクリックしたら、案件情報参照用のダイアログ表示する
	$("#entry_no").bind("click", { from: sd, to: ed, test_type: event.data.test_type }, CalendarTable.showEntryList);
	// 案件情報参照画面のイベント処理登録
	$("#entry_list").bind("change", {}, CalendarTable.searchQuoteData);
	$("#quote_list").bind("change", {}, CalendarTable.selectQuoteData);
	$("#schedule_dialog").dialog("open");
};
// スケジュールデータの検索
CalendarTable.searchScheduleData = function (start,end,base_cd,test_type, callback) {
	$.ajax({
		url: '/schedule_get/term/' 
			+ scheduleCommon.getDateString(start, "{0}-{1}-{2}") + '/' 
			+ scheduleCommon.getDateString(end, "{0}-{1}-{2}") + '/' 
			+ base_cd + '/' 
			+ test_type,
		cache: false,
		dataType: 'json',
		success: function (schedule_list) {
			callback(schedule_list);
		}
	});
};
// スケジュールデータを表示用テーブルに追加する
CalendarTable.addScheduleData = function (schedule_list) {
	if (schedule_list != null) {
		var rows = schedule_list.rows;
		for (var i in rows) {		
			var sch = $("<a class='schedule_band'></>");
			$(sch).attr("id", rows[i].schedule_id);
			$(sch).append(rows[i].entry_title + " " + rows[i].test_item);
			// 開始時間と終了時間から表示する位置と幅を算出する
			var base_time = scheduleCommon.dateStringToDate(rows[i].start_date + " 08:00:00");
			var start_time = scheduleCommon.dateStringToDate(rows[i].start_date + " " + rows[i].start_time);
			var end_time = scheduleCommon.dateStringToDate(rows[i].start_date + " " + rows[i].end_time);
			var time = (end_time.getTime() - start_time.getTime()) / 60000;
			time = time / 15;
			var left = (start_time.getTime() - base_time.getTime()) / 60000;
			left = left / 15;
			// テーブルを作成時に保存してある表示幅を取得して時間に合わせて幅を算出する
			$(sch).css("width", ((time * CalendarTable.width_15[rows[i].division]) + (time - 1) ) +  "px");
			$(sch).css("left", ((left * CalendarTable.width_15[rows[i].division]) + (left - 1) ) + "px");
			var sd = scheduleCommon.dateSeparatorChange(rows[i].start_date, "-");
			// スケジュールを表示する要素のIDを生成する
			var id = "#cal_day_times_" + sd + "-" + rows[i].division; 
			$(id).append(sch);
			$("#" + rows[i].schedule_id).bind('click',
				 {
				schedule_id: rows[i].schedule_id,
				entry_no: rows[i].entry_no,
				entry_title: rows[i].entry_title,
				quote_detail_no: rows[i].quote_detail_no,
				test_item: rows[i].test_item,
				start_date: rows[i].start_date, 
				end_date: rows[i].end_date,
				start_time: rows[i].start_time, 
				end_time: rows[i].end_time,
				am_pm: rows[i].am_pm, 
				patch_no: rows[i].patch_no,
				test_type: rows[i].division
			}, CalendarTable.openDialog);
		}

	}
};

// 試験スケジュールのDB追加
CalendarTable.addSchedule = function () {
	var form = new FormData(document.querySelector("#scheduleForm"));
	form.append("delete_check", "0");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/schedule_post', true);
	xhr.responseType = 'json';
	xhr.onload = CalendarTable.onloadAddSchedule;
	xhr.send(form);
};

// 試験スケジュールの更新
CalendarTable.updateSchedule = function () {
	var form = new FormData(document.querySelector("#scheduleForm"));
	form.append("delete_check", "0");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/schedule_post', true);
	xhr.responseType = 'json';
	xhr.onload = CalendarTable.onloadAddSchedule;
	xhr.send(form);
};

// 試験スケジュールの削除フラグセット
CalendarTable.deleteSchedule = function () {
	var form = new FormData(document.querySelector("#scheduleForm"));
	form.append("delete_check", "1");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/schedule_post', true);
	xhr.responseType = 'json';
	xhr.onload = CalendarTable.onloadAddSchedule;
	xhr.send(form);
};

// DB追加後のコールバック
CalendarTable.onloadAddSchedule = function (schedule) {
};

// 案件データの参照画面の準備（案件データ検索）
CalendarTable.showEntryList = function (event) {
	CalendarTable.searchEntryData(event.data.from, event.data.to, event.data.test_type);	
};
// 表示する案件データの検索
CalendarTable.searchEntryData = function (from, to, test_type) {
	
	$.ajax({
		url: '/entry_get/term/' + scheduleCommon.dateSeparatorChange(from, '-') + '/' + scheduleCommon.dateSeparatorChange(to, '-') + '/' + test_type,
		cache: false,
		dataType: 'json',
		success: function (entry_list) {
			CalendarTable.setEntryList(entry_list);
		}
	});

};
// 選択した案件の試験明細データの検索
CalendarTable.searchQuoteData = function () {
	var entry_no = $("#entry_list").val();
	var entry_title = $("#entry_list option:selected").text();
	$("#ref_entry_no").val(entry_no);
	$("#ref_entry_title").val(entry_title);

	$.ajax({
		url: '/quote_get/' + entry_no,
		cache: false,
		dataType: 'json',
		success: function (quote_list) {
			CalendarTable.setQuoteList(quote_list);
		}
	});

};

// 案件リストにデータを追加してダイアログを表示する
CalendarTable.setEntryList = function (entry_list) {
	$("#entry_list").empty();
	if (entry_list != null) {
		var rows = entry_list.rows;
		for (var i in rows) {
			var op = $("<option value=" + rows[i].entry_no + ">" + rows[i].entry_title + "</option>");
			$("#entry_list").append(op);

		}
	}
	// ダイアログ表示
	$("#entry_ref_dialog").dialog("open");
};
// 案件リストにデータを追加してダイアログを表示する
CalendarTable.setQuoteList = function (quote_list) {
	$("#quote_list").empty();
	if (quote_list != null) {
		var rows = quote_list.rows;
		for (var i in rows) {
			var op = $("<option value=" + rows[i].cell[1]  + ">" + rows[i].cell[3] + "</option>");
			$("#quote_list").append(op);

		}
	}
};

// 明細の選択イベント処理
CalendarTable.selectQuoteData = function () {
	var qno = $(this).val();
	var test_item = $("#quote_list option:selected").text();
	$("#ref_quote_detail_no").val(qno);
	$("#ref_test_item").val(test_item);
};

// 選択ボタン押下イベント処理
CalendarTable.selectEntryData = function () {
	// 参照画面で選択した情報を設定する
	$("#entry_no").val($("#ref_entry_no").val());
	$("#entry_title").val($("#ref_entry_title").val());
	$("#quote_detail_no").val($("#ref_quote_detail_no").val());
	$("#test_item").val($("#ref_test_item").val());
};