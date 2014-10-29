$(function() {
	$.datepicker.setDefaults($.datepicker.regional[ "ja" ]); // 日本語化
	// 試験毎のタブを生成
	$("#tabs").tabs({
		// タブの選択時に中のカレンダー表示を更新する
		activate: function (event, ui) {
			var h = window.innerHeight;
			$(".calendar_div").css("height", h - 270);
			switch (ui.newTab.index()) {
				case 0:
					CalendarTable.init("calendar_div1","01");
					break;					
				case 1:
					CalendarTableForPatchTest.init("calendar_div2_1", "01");	// 年、月、拠点CD
					break;
				case 2:
					CalendarTable.init("calendar_div3","03");
					break;
				case 3:
					CalendarTable.init("calendar_div4","04");
					break;
				case 4:
					CalendarTable.init("calendar_div5","05");
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
					CalendarTableForPatchTest.init("calendar_div2_1", "01");	// 年、月、拠点CD
					break;					
				case 1:
					CalendarTableForPatchTest.init("calendar_div2_2", "02");	// 年、月、拠点CD
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
				CalendarTable.updateSchedule();
				$(this).dialog('close');
			},
			"削除": function () {
				CalendarTable.deleteSchedule();
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
	calendarEdit.calendarTableInit();
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
	CalendarTable.init("calendar_div1","01");
	CalendarTableForPatchTest.init("calendar_div2_1", "01");	// 年、月、拠点CD
	CalendarTableForPatchTest.init("calendar_div2_2", "02");	// 年、月、拠点CD
	CalendarTable.init("calendar_div3", "03");
	CalendarTable.init("calendar_div4", "04");
	CalendarTable.init("calendar_div5", "05");
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
