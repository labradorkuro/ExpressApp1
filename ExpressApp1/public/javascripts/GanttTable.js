
//(function ($) {

    var GanttTable =  GanttTable || {};
	GanttTable.schedule = null;
	GanttTable.days = ['日','月','火','水','木','金','土'];
	GanttTable.days_color = ['red','black','black','black','black','black','blue'];

    GanttTable.Init = function(id,sd,ed,test_type,disp_mode){
		$.ajax({
			url: 'db?q=3&sd=' + sd + '&ed=' + ed + '&test_type=' + test_type + '&disp_mode=' + disp_mode,
			cache: false,
			dataType:'json',
			success: function(schedule){
				GanttTable.schedule = schedule;
				$('#' + id).each(function(i){
					var param_id = $('<input type="hidden" id="param_id-' + id + '" value="' + id + '"/>');
					var param_sd = $('<input type="hidden" id="param_sd-' + id + '" value="' + sd + '"/>');
					var param_ed = $('<input type="hidden" id="param_ed-' + id + '" value="' + ed + '"/>');
					var param_test_type = $('<input type="hidden" id="param_test_type-' + id + '" value="' + test_type + '"/>');
					var param_disp_mode = $('<input type="hidden" id="param_disp_mode-' + id + '" value="' + disp_mode + '"/>');
					$(this).append(param_id);
					$(this).append(param_sd);
					$(this).append(param_ed);
					$(this).append(param_test_type);
					$(this).append(param_disp_mode);
					// 外枠
					var tbl = $('<div class="gantt_table"></div');
					// 左側（表示するスケジュールの名称などを表示するエリア）
					var left_div = $('<div class="gt_left_div"></div>');
            
					var left_top = $('<div class="gt_left_top_div"></div>');
					var left_top1 = $('<div class="gt_left_top1_div"><a class="gt_mode_button" id="mode_button-' + id + '">表示切替</a></div>');
					var left_top2 = $('<div class="gt_left_top2_div"></div>');
            
					var category1 = $('<div class="gt_category1_div"><label class="gt_label">' + schedule.name + '</label></div>');
					var category2 = $('<div class="gt_category2_div"><label class="gt_label">' + schedule.desc + '</label></div>');

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
					var dateCount = GanttTable.calcDateCount(schedule.from, schedule.to);
					// 日付表示行の生成
					GanttTable.createCalendarHeader(schedule,right_top1,right_top2,right_top3,dateCount);
					// スケジュール表示行の生成
					GanttTable.createRows(schedule,left_div,right_div,dateCount);
					$("#mode_button-" + id).click(GanttTable.dispModeChange);
				});
			}
		});
    };

	// 日数計算
    GanttTable.calcDateCount = function(from, to) {
        var s = GanttTable.dateStringToDate(from);
        var e = GanttTable.dateStringToDate(to);
        var d = GanttTable.getDateCount(s, e);
        return d;
    };

	// カレンダー表示行生成
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
				// 同一項目内の予定の数
				var schedule_count = data[i].values.length;
				// 項目名の表示
                var left_row = $("<div class='gt_left_row_div'></div>");
				var cate1 = $("<div class='gt_category1_div'><label class='gt_label'>" + data[i].name + "</lebel></div>");
				if ((data[i].subject_vol) && (data[i].name !='')) {
					$(cate1).append("<label class='gt_label'>【" + data[i].complete_vol + " / " + data[i].subject_vol + "】</label>");
				}
				var cate2 = $("<div class='gt_category2_div'><label class='gt_label'>" + data[i].desc + "</label></div>");
				var height = (schedule_count * 3) + "em";
				$(left_row).css("height",height);
				$(cate1).css('height',height);
				$(cate2).css('height',height);
				if ((i < rows - 1) && (data[i + 1].name === '')) {
					$(left_row).css('border-bottom','solid 1px #eeeeee');
					$(cate2).css('border-bottom','solid 1px #777777');
				}
                $(left_div).append(left_row);
                $(left_row).append(cate1);
                $(left_row).append(cate2);
				// ガントチャートの表示
                var right_row = $("<div class='gt_right_row_div'></div>");
                $(right_div).append(right_row);
				var schedules = data[i].values;
				$(right_row).css("height",height);
				for(var j = 0;j < schedule_count;j++) {
					var sch = schedules[j];
					// カレンダー上の表示位置を求める
					var start = GanttTable.calcDateCount(schedule.from,sch.from) - 1;
					var end = GanttTable.calcDateCount(schedule.to,sch.to) - 1;
					var dc = GanttTable.calcDateCount(sch.from,sch.to);
					if (start < 0) dc = dc + start;
					// IDの生成
					var id = "schbtn_" + i + "_" + j;
					var sch_button = $('<a class="gt_button" id=' + id + '>' + sch.label +'</>');
					var left = (start * 100) + 1;
					if (left < 0) left = 1;
					if (end > 0) dc = dc - end;
					var width = (dc * 100) - 3; 				
					var top = (j * 2.75);
					$(sch_button).attr("data-color",sch.color);
					$(sch_button).css("top",top	+ "em");																										
					$(sch_button).css("left",left + "px");
					$(sch_button).css("width",width + "px");
					$(sch_button).css("background",sch.color);
					// Mouse over時のイベント処理
					$(sch_button).hover(GanttTable.btnHover_over, GanttTable.btnHover_out);
					$(sch_button).click(GanttTable.scheduleBtnClick);
					$(right_row).append(sch_button);
					// test
					left = left + 440;
					if (left <= 700) {
						var ms = $('<a class="gt_milestone"><img  src="images/milestone.png" width="24px" height="24px" title="milestone"/></a>');
						$(ms).css("top",top	+ "em");																										
						$(ms).css("left",left + "px");
						$(ms).css("height","32px");
						$(ms).css("width","32px");

						$(right_row).append(ms);
					}
				}
            }
        }
    };

	// スケジュールボタンにマウスが乗った時のイベント処理
	GanttTable.btnHover_over = function() {
		$(this).css("background","#777777");
	};

	// スケジュールボタンからマウスが出た時のイベント処理
	GanttTable.btnHover_out = function() {
		// IDをもとにデータを取得する
		//var id = $(this).attr("id").split("_");
		//var sch = GanttTable.schedule.data[id[1]].values[id[2]];
		$(this).css("background",$(this).data("color"));
	};

	// スケジュールボタン押下イベント処理
	GanttTable.scheduleBtnClick = function() {
		$("#schedule_dialog").dialog("open");
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

	GanttTable.dispModeChange = function() {
		var id = $(this).attr("id").split("-");
		if (id.length === 2) {
			var dm = $("#param_disp_mode-" + id[1]).attr("value");
			var sd = $("#param_sd-" + id[1]).attr("value");
			var ed = $("#param_ed-" + id[1]).attr("value");
			var test_type = $("#param_test_type-" + id[1]).attr("value");
			if (dm === '1') {
				dm = '2';
			} else {
				dm = '1';
			}
			$("#" + id[1]).empty();
			GanttTable.Init(id[1],sd,ed,test_type,dm);
		}
	};
//})(jQuery);
