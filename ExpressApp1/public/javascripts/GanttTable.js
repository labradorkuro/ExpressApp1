﻿
//(function ($) {

    var GanttTable =  GanttTable || {};
	GanttTable.days = ['日','月','火','水','木','金','土'];
	GanttTable.days_color = ['red','black','black','black','black','black','blue'];
    GanttTable.Init = function(id, schedule){
        $('#' + id).each(function(i){
            // 外枠
            var tbl = $('<div class="gantt_table"></div');
            // 左側（表示するスケジュールの名称などを表示するエリア）
            var left_div = $('<div class="gt_left_div"></div>');
            
            var left_top = $('<div class="gt_left_top_div"></div>');
            var left_top1 = $('<div class="gt_left_top1_div"></div>');
            var left_top2 = $('<div class="gt_left_top2_div"></div>');
            
            var category1 = $('<div class="gt_category1_div"></div>');
            var category2 = $('<div class="gt_category2_div"></div>');

            // 右側（スケジュールのガントチャートを表示するエリア）
            var right_div = $('<div class="gt_right_div"></div>');

            var right_top = $('<div class="gt_right_top_div"></div>');
            var right_top1 = $('<div class="gt_right_top1_div"></div>');
            var right_top2 = $('<div class="gt_right_top2_div"></div>');
            var right_top3 = $('<div class="gt_right_top3_div"></div>');
            $(this).append(tbl);
            
            $(tbl).append(left_div);
            $(left_div).append(left_top);
            $(left_top).append(left_top1);
            $(left_top).append(left_top2);
            $(left_top2).append(category1);
            $(left_top2).append(category2);

            $(tbl).append(right_div);
            $(right_div).append(right_top);
            $(right_top).append(right_top1);
            $(right_top).append(right_top2);
            $(right_top).append(right_top3);
			// 表示対象日数の取得
            var dateCount = GanttTable.createCalendar(schedule.from, schedule.to);
			// 日付表示行の生成
			GanttTable.createCalendarHeader(schedule,right_top1,right_top2,right_top3,dateCount);
			// スケジュール表示行の生成
            GanttTable.createRows(schedule,left_div,right_div,dateCount);

        });
    };

    GanttTable.createCalendar = function(from, to) {
        var s = GanttTable.dateStringToDate(from);
        var e = GanttTable.dateStringToDate(to);
        var d = GanttTable.getDateCount(s, e);
        return d;
    };

	GanttTable.createCalendarHeader = function(schedule,right_top1,right_top2,right_top3,dateCount) {
        if (schedule != null) {
			var startDate = GanttTable.dateStringToDate(schedule.from);
			// 表示日付を年月日毎に文字列分割
			var sd = GanttTable.splitDateString(schedule.from);
			var ed = GanttTable.splitDateString(schedule.to);
			// 年の表示
			var y = startDate.getFullYear();
			var yy = 1;
			for(var j = 1;j < dateCount;j++) {
				var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
				if (y === nextDate.getFullYear()) {
					yy++;
				}
				else break;
			}
			
			var year_div1 = $('<div class="gt_cal_header" id="year_1">' + sd[0] + '年</>');
			var w1 = 100 * yy;
			$(year_div1).css("left","0px");
			$(year_div1).css("width", w1 + "px");
			$(right_top1).append(year_div1);
			var w2 = 100 * (dateCount - yy);
			if (w2 > 0) {
				var year_div2 = $('<div class="gt_cal_header" id="year_2">' + ed[0] + '年</>');
				$(year_div2).css("left",w1 + "px");
				$(year_div2).css("width", w2 + "px");
				$(year_div2).css("border-left", "1px solid #777777");
				$(right_top1).append(year_div2);
			}
			// 月の表示
			var m = startDate.getMonth();
			var mm = 1;
			for(var j = 1;j < dateCount;j++) {
				var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
				if (m === nextDate.getMonth()) {
					mm++;
				}
				else break;
			}
			
			var month_div1 = $('<div class="gt_cal_header" id="month1">' + (m + 1) + '月</>');
			w1 = 100 * mm;
			$(month_div1).css("left","0px");
			$(month_div1).css("width", w1 + "px");
			$(right_top2).append(month_div1);
			w2 = 100 * (dateCount - mm);
			if (w2 > 0) {
				var month_div2 = $('<div class="gt_cal_header" id="month2">' + (m + 2) + '月</>');
				$(month_div2).css("left",w1 + "px");
				$(month_div2).css("width", w2 + "px");
				$(month_div2).css("border-left", "1px solid #777777");
				$(right_top2).append(month_div2);
			}
			// 日の表示
			for(var j = 0;j < dateCount;j++) {
				var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
				var date_div = $('<div class="gt_cal_header" >' + nextDate.getDate() + '日(' + GanttTable.days[nextDate.getDay()] + ')</>');
				$(date_div).css("left",(j * 100) + "px");
				$(date_div).css("width", "100px");
				$(date_div).css("color", GanttTable.days_color[nextDate.getDay()]);
				if (j > 0)
					$(date_div).css("border-left", "1px solid #777777");
				$(right_top3).append(date_div);
			}
        }
	};

    // 
    // 試験スケジュールのガントチャートを表示する行の生成
    GanttTable.createRows = function(schedule,left_div,right_div,dateCount) {
        if (schedule != null) {

            var rows = schedule.data.length;
            var data = schedule.data;
            for(var i = 0;i < rows;i++) {
				// 左側
                var left_row = $("<div class='gt_left_row_div'></div>");
                $(left_div).append(left_row);
                $(left_row).append("<div class='gt_category1_div'>" + data[i].name + "</div>");
                $(left_row).append("<div class='gt_category2_div'>" + data[i].desc + "</div>");
				// 右側
                var right_row = $("<div class='gt_right_row_div'></div>");
                $(right_div).append(right_row);
				for(var j = 0;j < dateCount;j++) {
					var sch_button = $('<a class="gt_button">テスト</>');
					var left = j * 100;																															
					$(sch_button).css("left",left + "px");
					//$(sch_button).css("width","200px");
					$(right_row).append(sch_button);
				}
            }
        }
    };

    GanttTable.dateStringToDate = function(dateString) {
        var date = new Date(dateString);
        return date;
    };

    GanttTable.getDateCount = function(start,end) {
        var d = end.getTime() - start.getTime();
        d = Math.floor((d / (24 * 3600 * 1000)) + 1);
        return d;
    };
	GanttTable.splitDateString = function(dateString) {
		var ymd = new Array();
		ymd = dateString.split("/");
		return ymd;
	};
//})(jQuery);
