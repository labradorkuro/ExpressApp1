﻿//
// 試験スケジュール用カレンダー画面の処理クラス
//

var CalendarTable = CalendarTable || {};
CalendarTable.current_div = "";
CalendarTable.current_test_type = "L01";
CalendarTable.current_base_cd = "01"; 
CalendarTable.start_date = null;
CalendarTable.schedule = null;
CalendarTable.days = ['日','月','火','水','木','金','土'];
CalendarTable.days_color = ['red','black','black','black','black','black','blue'];
CalendarTable.width_15 = [];
CalendarTable.auth = 0;		// ユーザ権限
// 初期化
CalendarTable.init = function() {
	CalendarTable.hideMemo();
	var ymd = CalendarTable.start_date.split("/");
	var year = ymd[0];
	var month = ymd[1];
	$("#" + CalendarTable.current_div).empty();
	// 表示幅の取得
	var width = $("#" + CalendarTable.current_div).width();
	var height = $("#" + CalendarTable.current_div).height();
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
	var dd = CalendarTable.current_div + "_header";
	$(day_div).attr("id",dd);
	$("#" + CalendarTable.current_div).append(day_div);
	$(day_div).append(header);
	$(day_div).append(body);
	$(header).append(day_date);
	$(header).append(day_day);
	// 15分刻みを表示する幅を保存しておく
	CalendarTable.width_15[CalendarTable.current_test_type] = Math.floor((times_width - 52) / 52);
	var dtw = (CalendarTable.width_15[CalendarTable.current_test_type] * 52) + 52;
	$(body).css("width", dtw + 233 + "px");
	$(body).css("height", (height - 42) + "px");
	$(day_div).css("width", dtw + 212 + "px");
	$(day_times).css("width", dtw + "px");
	// 時間表示
	for(var t = 0;t < 13;t++) {
		var day_times_u = $("<div class='cal_day_times_header_up' align='center'></div>");
		$(day_times_u).append(t + 8 + " 時");
		$(day_times_u).css("width", ((CalendarTable.width_15[CalendarTable.current_test_type] * 4) + 3)+ "px");
		$(day_times).append(day_times_u);
	}
	// 15分刻みの表示
	for(var t = 0;t < 52;t++) {
		var day_times_l = $("<div class='cal_day_times_header_low' align='center'></div>");
		var m = t % 4;
		$(day_times_l).append(m * 15);
		$(day_times_l).css("width", CalendarTable.width_15[CalendarTable.current_test_type] + "px");
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
		day_times = $("<div class='cal_day_times'" + " id='cal_day_times_" + ymd + "-" + CalendarTable.current_test_type + "'></div>");
		day_memo  = $("<div class='cal_memo'></div>");
		
		dd = CalendarTable.current_div + "_" + i;
		$(day_div).css("width", dtw + 212 + "px");
		$(day_div).attr("id",dd);
		if ((i % 2) === 0) {
			$(day_div).css("background-color","#ecf9d2");
		} 
		$(body).append(day_div);
		// 要素にカスタムデータとして日付を設定
		$(day_times).data("date", scheduleCommon.getDateString(end_date, "{0}/{1}/{2}"));
		$(day_times).css("width", dtw + "px");
		if (i === 1) {
			var m = Number(month);
			$(day_date).append(m + "/" + i);
		}
		else
			$(day_date).append(i);
		$(day_day).append(CalendarTable.days[day]);
		// 曜日による表示色設定
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
		// 新規スケジュールを追加するための初期値をデータとして設定する
		var data = {
			schedule_id: 0,
			start_date: scheduleCommon.getDateString(end_date, "{0}/{1}/{2}"), 
			end_date: scheduleCommon.getDateString(end_date, "{0}/{1}/{2}"),
			am_pm: "00", 
			patch_no: 0,
//			test_type: CalendarTable.current_test_type,
			base_cd: CalendarTable.current_base_cd
		};
		$(day_times).data('schedule', data);
		// 権限チェック
		if (CalendarTable.auth == 2) {
			// クリックイベントで入力フォームを表示する
			$(day_times).bind('click',CalendarTable.openDialog);
		}
	}
	// スケジュールデータを検索して表示する
	CalendarTable.searchScheduleData(start_date, end_date, "01", CalendarTable.current_test_type, CalendarTable.addScheduleData);
	// droppable設定
	$(".cal_day_times").droppable({drop:CalendarTable.drop});
};

// 試験スケジュール編集ダイアログ表示
CalendarTable.openDialog = function (event) {
	// カスタムデータとして保存されているスケジュールデータを取得する
	var data = $(event.target).data('schedule');
	// フォームにデータを設定する。
	CalendarTable.setFormData(data);
	// 案件番号をクリックしたら、案件情報参照用のダイアログ表示する
	$("#entry_no").bind("click", { from: $("#start_date").val(), to: $("#end_date").val(), test_type: CalendarTable.current_test_type, base_cd: data.base_cd }, CalendarTable.showEntryList);
	// 案件情報参照画面のイベント処理登録
	$("#entry_list").bind("change", {}, CalendarTable.searchQuoteData);
	$("#quote_list").bind("change", {}, CalendarTable.selectQuoteData);
	$("#schedule_dialog").dialog("open");
	return false;
};
CalendarTable.setFormData = function(data) {
	// 初期化
	$("#entry_no").val("");
	$("#entry_title").val("");
	$("#quote_no").val("");
	$("#quote_detail_no").val("");
	$("#test_item").val("");
	$("#start_date").val("");
	$("#end_date").val("");
	$("#start_time").val("09:00");
	$("#end_time").val("10:00");
	$("#patch_no").val("1");
	$("#am_pm").val("0");
	$("#base_cd").val("01");
	$("#memo").val("");
	// 安全性試験の時はAMPMの選択とパッチ番号の選択を表示する。それ以外は非表示にする。
	if (CalendarTable.current_test_type === "L02") {
		// 安全性試験の場合
		$("#test_02_row").css("display", "table-row");
		$("#start_time_label").css("display", "none");
		$("#end_time_label").css("display", "none");
		$("#start_time").css("display", "none");
		$("#end_time").css("display", "none");
		$("#end_date_label").css("display", "inline");
		$("#end_date").css("display", "inline");
	} else {
		$("#test_02_row").css("display", "none");
		$("#start_time_label").css("display", "inline");
		$("#end_time_label").css("display", "inline");
		$("#start_time").css("display", "inline");
		$("#end_time").css("display", "inline");
		$("#end_date_label").css("display", "none");
		$("#end_date").css("display", "none");
	}
	// eventに渡されたデータをフォームにセットする
	var sd = data.start_date;
	var ed = data.end_date;
	if (CalendarTable.current_test_type != "L02") {
		ed = sd;
	}
	if (data.entry_no) {
		$("#entry_no").val(data.entry_no);
	}
	if (data.entry_title) {
		$("#entry_title").val(data.entry_title);
	}
	if (data.quote_no) {
		$("#quote_no").val(data.quote_no);
	}
	if (data.quote_detail_no) {
		$("#quote_detail_no").val(data.quote_detail_no);
	}
	if (data.test_item) {
		$("#test_item").val(data.test_item);
	}
	$("#schedule_id").val(data.schedule_id);
	if (data.schedule_id) {
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
	if (data.start_time) {
		$("#start_time").val(data.start_time);
	}
	if (data.end_time) {
		$("#end_time").val(data.end_time);
	}
	$("#patch_no").val(data.patch_no);
	$("#am_pm").val(data.am_pm);
	$("#base_cd").val(data.base_cd);	// hidden項目
	$("#memo").val(data.memo);
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
		var prev_id = "";
		var prev_date = "";
		var prev_start_time = new Date(2000,0,1,0,0,0,0);
		var prev_end_time = prev_start_time;
		var rows = schedule_list.rows;
		var count = 1;
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
			$(sch).css("width", ((time * CalendarTable.width_15[CalendarTable.current_test_type]) + (time - 1) ) +  "px");
			$(sch).css("left", ((left * CalendarTable.width_15[CalendarTable.current_test_type]) + (left - 1) ) + "px");
			var sd = scheduleCommon.dateSeparatorChange(rows[i].start_date, "-");
			// スケジュールを表示する要素のIDを生成する
			var id = "#cal_day_times_" + sd + "-" + CalendarTable.current_test_type; 
			$(id).append(sch);
			// 要素のカスタムデータとしてデータを追加
			$("#" + rows[i].schedule_id).data('schedule', rows[i]);
			// クリックイベント処理登録
			if (CalendarTable.auth == 2) {
				// ダイアログ表示
				$("#" + rows[i].schedule_id).bind('click', CalendarTable.openDialog);
				// Drag&Drop
				$("#" + rows[i].schedule_id).bind('mousedown',CalendarTable.mousedown);
				$("#" + rows[i].schedule_id).draggable({revert:false,zIndex: 1000 });
			}
			$("#" + rows[i].schedule_id).mousemove(CalendarTable.dispMemo).mouseout(CalendarTable.hideMemo);
			if (prev_date == rows[i].start_date) {
				// 同一日に複数の予定が入っている場合に時間が重なっていたら行の高さを調整して上下に表示する
				if (start_time.getTime() < prev_end_time.getTime()) {
					// 重なり
					$(sch).css('top',count * 38);				// 予定の表示位置（top）を調整
					count++;
				}
			} else {
				$(prev_id).css('height',count * 41);			// 追加する要素
				$(prev_id).parent().css('height',count * 41);	// 親要素
				$(prev_id).siblings().css('height',count * 35 + ((count - 1) * 6));	// 兄弟要素		
				count = 1;
			}
			// チェック用にデータを保存
			prev_id = id;
			prev_date = rows[i].start_date;
			prev_start_time = start_time;
			prev_end_time = end_time;
		}
		$(prev_id).css('height',count * 41);				// 追加する要素
		$(prev_id).parent().css('height',count * 41);		// 親要素
		$(prev_id).siblings().css('height',count * 35 + ((count - 1) * 6));		// 兄弟要素		

	}
};

// MOUSEDOWNイベント
CalendarTable.mousedown = function(event,ui) {
	if (event.ctrlKey) {
		// CTRLキー押下＋ドラッグをコピーモードとする。
		// その場合は、helperをcloneにして元の要素は動かさないようにする
		$(event.target).draggable("option","helper","clone");
	}
};
// 試験スケジュールのドロップイベント処理
CalendarTable.drop = function (event, ui) {
	var left = ui.position.left;
	var top = ui.position.top;
	var data = $(ui.draggable).data('schedule');
	if ($(ui.draggable).draggable("option","helper") == "clone") {
		// copy mode
		data.schedule_id = 0;
	}
	data.start_date = $(event.target).data('date');
	// 横方向の移動位置の判定（時間の変更）
	// 移動した位置から１５分単位の位置を求めて表示位置を合わせる	
	left = Math.round(left / (CalendarTable.width_15[CalendarTable.current_test_type] + 1));
	var min = left * 15 * 60000;	// 分単位の時間を求めておく
	left = (left * CalendarTable.width_15[CalendarTable.current_test_type]) + (left - 1);
	$("#" + data.schedule_id).css("left", left);
	// 現在のデータから作業時間の長さを求める
	var start_time = scheduleCommon.dateStringToDate(data.start_date + " " + data.start_time);
	var end_time = scheduleCommon.dateStringToDate(data.start_date + " " + data.end_time);
	var len = end_time.getTime() - start_time.getTime();

	// 移動した位置から開始時間を求める
	var base_time = scheduleCommon.dateStringToDate(data.start_date + " 08:00:00");
	var time = min + base_time.getTime();
	var d = new Date();
	// 開始時間
	d.setTime(time);
	data.start_time = scheduleCommon.getTimeString(d, "{0}:{1}");
	// 終了時間
	d.setTime(time + len);
	data.end_time = scheduleCommon.getTimeString(d, "{0}:{1}");
	// 要素に設定するカスタムデータを更新する
	$(ui.helper).data('schedule', data);
	// ドラッグした要素をターゲットの子要素として追加する
	$(ui.helper).css('top', 0);	
	$(event.target).append(ui.helper);
	// 高さ、表示位置調整が必要か確認して必要なら調整する（移動元、移動先）
	CalendarTable.checkCalRow(event.target);
	// 更新されたデータでDBのデータを更新する
	CalendarTable.setFormData(data);			// 入力フォームにデータを入れて
	if ($(ui.draggable).draggable("option","helper") == "clone") {
		// copy mode
		$(ui.helper).draggable({revert:false,zIndex: 1000 });
		CalendarTable.updateSchedule(true);		// 更新処理を実行する（ダイアログから更新する処理を利用）
	} else {
		CalendarTable.updateSchedule(false);	// 更新処理を実行する（ダイアログから更新する処理を利用）
	}
};

// カレンダーに追加する（ドロップする）時に行の高さ、表示位置を調整する
CalendarTable.checkCalRow = function(target) {
	var children = $(target).children();
	var count = 1;
	// 一旦すべてのtopを0にしておく
	for(var i = 0;i < children.length;i++) {
		var child_i = children[i];
		$(child_i).css('top',0);
	}
	// 全ての組み合わせで重なりを確認する
	for(var i = 0;i < children.length;i++) {
		var child_i = children[i];
		var data = $(child_i).data('schedule');
		var start_time_i = scheduleCommon.dateStringToDate(data.start_date + " " + data.start_time);
		var end_time_i = scheduleCommon.dateStringToDate(data.start_date + " " + data.end_time);
		for(var j = i + 1;j < children.length;j++) {
			// 子要素の確認
			var child_j = children[j];
			var data = $(child_j).data('schedule');
			var start_time_j = scheduleCommon.dateStringToDate(data.start_date + " " + data.start_time);
			var end_time_j = scheduleCommon.dateStringToDate(data.start_date + " " + data.end_time);
			if ((start_time_j.getTime() < end_time_i.getTime()) && (end_time_j.getTime() > start_time_i.getTime())) {
				$(child_j).css('top',count * 38);
				count++;
			}
		}
	}
	// 親、兄弟の要素の高さを調整する
	$(target).css('height',count * 41);
	$(target).parent().css('height',count * 41);
	$(target).siblings().css('height',count * 35 + ((count - 1) * 6));
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
CalendarTable.updateSchedule = function (refresh) {
	var form = new FormData(document.querySelector("#scheduleForm"));
	form.append("delete_check", "0");
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/schedule_post', true);
	xhr.responseType = 'json';
	if (refresh) {
		xhr.onload = CalendarTable.onloadAddSchedule;
	}
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
	if (CalendarTable.current_test_type != "L02") {
		CalendarTable.init();
	} else {
		CalendarTableForPatchTest.init();
	}
};

// 案件データの参照画面の準備（案件データ検索）
CalendarTable.showEntryList = function (event) {
	CalendarTable.searchEntryData(event.data.from, event.data.to, CalendarTable.current_test_type);	
};
// 表示する案件データの検索
CalendarTable.searchEntryData = function (from, to, test_type) {
	$("#entry_list").empty();
	$("#quote_list").empty();
	
	$.ajax({
		url: '/entry_get/cal/' + scheduleCommon.dateSeparatorChange(from, '-') + '/' + scheduleCommon.dateSeparatorChange(to, '-') + '/' + test_type,
		cache: false,
		dataType: 'json',
		success: function (entry_list) {
			if (entry_list != null) {
				$("#entry_list").empty();
				var rows = entry_list.rows;
				for (var i in rows) {
					var op = $("<option value=" + rows[i].entry_no + ">" + rows[i].entry_title + "</option>");
					$("#entry_list").append(op);
				}
			}
		},
		complete: function() {
			CalendarTable.setEntryList();
		}
	});

};
// 選択した案件の試験明細データの検索
CalendarTable.searchQuoteData = function () {
	$("#quote_list").empty();
	var entry_no = $("#entry_list").val();
	var entry_title = $("#entry_list option:selected").text();
	$("#ref_entry_no").val(entry_no);
	$("#ref_entry_title").val(entry_title);
	$("#ref_quote_no").val("");
	$("#ref_quote_detail_no").val("");
	$("#ref_test_item").val("");

	$.ajax({
		url: '/quote_specific_get_list_for_calendar/' + entry_no,
		cache: false,
		dataType: 'json',
		success: function (quote_list) {
			CalendarTable.setQuoteList(quote_list);
		}
	});

};

// 案件リストにデータを追加してダイアログを表示する
CalendarTable.setEntryList = function () {
	$("#ref_entry_no").val("");
	$("#ref_entry_title").val("");
	$("#ref_quote_no").val("");
	$("#ref_quote_detail_no").val("");
	$("#ref_test_item").val("");
	// ダイアログ表示
	$("#entry_ref_dialog").dialog("open");
};
// 案件リストにデータを追加してダイアログを表示する
CalendarTable.setQuoteList = function (quote_list) {
	$("#quote_list").empty();
	if (quote_list != null) {
		var rows = quote_list.rows;
		$("#ref_quote_no").val(rows[0].quote_no);
		for (var i in rows) {
			var op = $("<option value=" + rows[i].quote_detail_no  + ">" + rows[i].test_middle_class_name + "</option>");
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
	$("#quote_no").val($("#ref_quote_no").val());
	$("#quote_detail_no").val($("#ref_quote_detail_no").val());
	$("#test_item").val($("#ref_test_item").val());
};

CalendarTable.hideMemo = function() {
	$("#popupMessage").css({left:"-9999px"});     
};
CalendarTable.dispMemo = function(kmouse) {
	var data = $(kmouse.target).data('schedule');
	if (data.memo == null) data.memo = "";	
	$("#msg_str").text(data.memo);
	var my_tooltip = $("#popupMessage");
    var border_top = $(window).scrollTop();   
    var border_right = $(window).width();  
    var left_pos;  
    var top_pos;  
    var offset = 20;  
    if(border_right - (offset *2) >= my_tooltip.width() + kmouse.pageX){  
        left_pos = kmouse.pageX+offset;  
    } else{  
        left_pos = border_right-my_tooltip.width()-offset;  
    }  
                      
    if(border_top + (offset *2)>= kmouse.pageY - my_tooltip.height()){  
        top_pos = border_top +offset;  
    } else{  
        top_pos = kmouse.pageY-my_tooltip.height()-offset;  
    }     
                  
                  
    my_tooltip.css({left:left_pos, top:top_pos});  
	
};
