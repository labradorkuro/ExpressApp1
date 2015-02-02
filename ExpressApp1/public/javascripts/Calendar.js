$(function() {
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 試験毎のタブを生成
	$("#tabs").tabs({
		// タブの選択時に中のカレンダー表示を更新する
		create: function (event, ui) {
			var today = scheduleCommon.getToday("{0}/{1}/{2}");
			CalendarTable.start_date = today;
			var h = window.innerHeight;
			$(".calendar_div").css("height", h - 270);
			switch (ui.tab.index()) {
				case 0:
					CalendarTable.current_div = "calendar_div1";
					CalendarTable.current_test_type = "01";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 1:
					CalendarTable.current_div = "calendar_div2_1";
					CalendarTable.current_test_type = "02";
					CalendarTable.current_base_cd = "01";
					CalendarTableForPatchTest.init();	// 年、月、拠点CD
					break;
				case 2:
					CalendarTable.current_div = "calendar_div3";
					CalendarTable.current_test_type = "03";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 3:
					CalendarTable.current_div = "calendar_div4";
					CalendarTable.current_test_type = "04";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 4:
					CalendarTable.current_div = "calendar_div5";
					CalendarTable.current_test_type = "05";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 5:
					CalendarTable.current_div = "calendar_div6";
					CalendarTable.current_test_type = "06";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
			}
		},
		activate: function (event, ui) {
			var h = window.innerHeight;
			$(".calendar_div").css("height", h - 270);
			switch (ui.newTab.index()) {
				case 0:
					CalendarTable.current_div = "calendar_div1";
					CalendarTable.current_test_type = "01";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 1:
					CalendarTable.current_div = "calendar_div2_1";
					CalendarTable.current_test_type = "02";
					CalendarTable.current_base_cd = "01";
					CalendarTableForPatchTest.init();	// 年、月、拠点CD
					break;
				case 2:
					CalendarTable.current_div = "calendar_div3";
					CalendarTable.current_test_type = "03";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 3:
					CalendarTable.current_div = "calendar_div4";
					CalendarTable.current_test_type = "04";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 4:
					CalendarTable.current_div = "calendar_div5";
					CalendarTable.current_test_type = "05";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
				case 5:
					CalendarTable.current_div = "calendar_div6";
					CalendarTable.current_test_type = "06";
					CalendarTable.current_base_cd = "01";
					CalendarTable.init();
					break;
			}
		}
	});
	
	// 安全性試験用のタブを生成（大阪、札幌）
	$("#tabs_patch").tabs({
		// タブの選択時に中のカレンダー表示を更新する
		activate: function (event, ui) {
			var h = window.innerHeight;
			$(".calendar_div").css("height", h - 270);
			switch (ui.newTab.index()) {
				case 0:
					CalendarTable.current_div = "calendar_div2_1";
					CalendarTable.current_test_type = "02";
					CalendarTable.current_base_cd = "01";
					CalendarTableForPatchTest.init();	// 年、月、拠点CD
					break;					
				case 1:
					CalendarTable.current_div = "calendar_div2_2";
					CalendarTable.current_test_type = "02";
					CalendarTable.current_base_cd = "02";
					CalendarTableForPatchTest.init();	// 年、月、拠点CD
					break;
			}
		}
	});

	// スケジュールの登録、編集用ダイアログ
	$('#schedule_dialog').dialog({
		autoOpen: false,
		width: '720px',
		title: 'スケジュールの詳細',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"追加": function () {
				CalendarTable.addSchedule();
				$(this).dialog('close');
			},
			"更新": function () {
				CalendarTable.updateSchedule(true);
				$(this).dialog('close');
			},
			"削除": function () {
				CalendarTable.deleteSchedule(true);
				$(this).dialog('close');
			},
			"CANCEL": function () {
				$(this).dialog('close');
			}
		}
	});
	// 案件情報を参照して選択するためのダイアログ
	$('#entry_ref_dialog').dialog({
		autoOpen: false,
		width: '720px',
		title: '案件の選択',
		closeOnEscape: false,
		modal: true,
		buttons: {
			"選択": function () {
				CalendarTable.selectEntryData();
				$(this).dialog('close');
			},
			"CANCEL": function () {
				$(this).dialog('close');
			}
		}
	});
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	CalendarTable.start_date = today;
	
	$(window).resize(function () {
		calendarEdit.calendarTableInit();
	});
	//calendarEdit.calendarTableInit();
	$(".datepicker").datepicker({ dateFormat: "yy/mm/dd" });

	$("#prev_btn").click(calendarEdit.prev);
	$("#next_btn").click(calendarEdit.next);
	$("#today_btn").click(calendarEdit.today);
	$("#select_date").change(calendarEdit.selectDate);

});

var calendarEdit = calendarEdit || {};
calendarEdit.calendarTableInit = function () {
	var h = window.innerHeight;
	$(".calendar_div").css("height", h - 270);
	if (CalendarTable.current_test_type != "02") {
		CalendarTable.init();
	} else {
		CalendarTableForPatchTest.init();	// 年、月、拠点CD
	}
};


// 前へボタン
calendarEdit.prev = function () {
	CalendarTable.start_date = scheduleCommon.prevMonth(CalendarTable.start_date, 1);
	calendarEdit.calendarTableInit();
};

// 次へボタン
calendarEdit.next = function () {
	CalendarTable.start_date = scheduleCommon.nextMonth(CalendarTable.start_date, 1);
	calendarEdit.calendarTableInit();
};

// 今日ボタン
calendarEdit.today = function () {
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	CalendarTable.start_date = today;
	calendarEdit.calendarTableInit();
};

// 日付選択
calendarEdit.selectDate = function () {
	CalendarTable.start_date = $("#select_date").val();
	calendarEdit.calendarTableInit();
};
