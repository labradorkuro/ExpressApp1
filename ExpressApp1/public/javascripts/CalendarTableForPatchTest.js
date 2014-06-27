//
// パッチテストのカレンダー表示用テーブルの生成
//

var CalendarTableForPatchTest =  CalendarTableForPatchTest || {};
CalendarTableForPatchTest.schedule = null;
CalendarTableForPatchTest.days = ['日','月','火','水','木','金','土'];
CalendarTableForPatchTest.days_color = ['red','black','black','black','black','black','blue'];

CalendarTableForPatchTest.init = function(id,year,month) {
	// 指定された年月の日数を取得する
	var days = scheduleCommon.getDaysCount(year,month);
	// 月の初めの曜日を取得する
	var day = scheduleCommon.getDay(year,month,1);
	var startDate = scheduleCommon.addDayCount(year,month,1,((day - 1)  * - 1));
	// ヘッダー生成
	var patch_div = $("<div class='cal_patch_base'></div>");
	var patch_no = $("<div class='cal_patch_no' align='center'>No.</div>");
	var patch_branch_title  = $("<div class='cal_branch_title' align='center'>事業所</div>");
	var patch_week = $("<div class='cal_patch_week'></div>");
	//var patch_memo  = $("<div class='cal_patch_memo' align='center'>備考</div>");
	var dd = id + "_header";
	$(patch_div).attr("id",dd);
	$("#" + id).append(patch_div);
	$("#" + dd).append(patch_no);
	$("#" + dd).append(patch_branch_title);
	// 1週間の日付表示
	for(var t = 0;t < 5;t++) {
		var week_u = $("<div class='cal_patch_week_header_up' align='center'></div>");
		$(week_u).append(startDate.getFullYear() + "/" + (startDate.getMonth() + 1)  + "/" + startDate.getDate() + "～");
		$(patch_week).append(week_u);
		startDate = scheduleCommon.addDayCount(startDate.getFullYear(),(startDate.getMonth() + 1),startDate.getDate() ,7);
	}
	// AMPMの表示
	for(var t = 0;t < 10;t++) {
		var week_l = $("<div class='cal_patch_week_header_low' align='center'></div>");
		if ((t % 2) === 0) {
			$(week_l).append("AM");
		} else {
			$(week_l).append("PM");
		}
		$(patch_week).append(week_l);
	}
	$("#" + dd).append(patch_week);
	//$("#" + dd).append(patch_memo);
	// 検体数(２７)分のカレンダー行を生成
	for(var i = 1; i <= 27;i++) {
		var day = scheduleCommon.getDay(year,month,i);
		patch_div = $("<div class='cal_patch_base'></div>");
		patch_no = $("<div class='cal_patch_no' align='right'></div>");
		patch_branch_title  = $("<div class='cal_branch_title' align='center'></div>");
		var patch_branch_up  = $("<div class='cal_branch_up' align='center'></div>");
		var patch_branch_low  = $("<div class='cal_branch_low' align='center'></div>");
		patch_week = $("<div class='cal_patch_week'></div>");
		patch_memo  = $("<div class='cal_patch_memo'></div>");
		
		dd = id + "_" + i;
		$(patch_div).attr("id",dd);
		$("#" + id).append(patch_div);
		// 検体番号の生成
		$(patch_no).append(i);
		$("#" + dd).append(patch_no);
		// 事業所欄設定
		$(patch_branch_up).append("大阪");
		$(patch_branch_low).append("札幌");
		$(patch_branch_title).append(patch_branch_up);
		$(patch_branch_title).append(patch_branch_low);
		// スケジュール追加用エリア生成
		for(var t = 0;t < 10;t++) {
			var week_l = $("<div class='cal_patch_week_up' align='center'></div>");
			$(patch_week).append(week_l);
		}
		for(var t = 0;t < 10;t++) {
			var week_l = $("<div class='cal_patch_week_low' align='center'></div>");
			$(patch_week).append(week_l);
		}
		$("#" + dd).append(patch_branch_title);
		$("#" + dd).append(patch_week);
		//$("#" + dd).append(patch_memo);
		
	}
};