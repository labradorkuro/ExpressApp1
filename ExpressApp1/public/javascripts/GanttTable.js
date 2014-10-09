//
// ガントチャートの生成とデータの表示
// 

var GanttTable =  GanttTable || {};
GanttTable.ganttData = null;
GanttTable.start_date = "";		// 表示開始日付
GanttTable.disp_span = 1;		// 表示期間（1：１ヶ月、3：3ヶ月、6：6ヶ月、12：12ヶ月）
GanttTable.days = ['日','月','火','水','木','金','土'];
GanttTable.days_color = ['red','black','black','black','black','black','blue'];
GanttTable.dateWidth = 100;
GanttTable.rowHeight = 32;

// 初期化
GanttTable.Init = function (id, test_type, disp_mode){
	$('#' + id).empty();
	var startDate = GanttTable.start_date;
	var d = GanttTable.dateStringToDate(GanttTable.start_date);
	var endDate = scheduleCommon.getDateString(scheduleCommon.addDate(d, (GanttTable.disp_span * 30)), "{0}/{1}/{2}");
	var ganttData = {};
	ganttData.name = "案件名";
	ganttData.desc = "作業項目";
	ganttData.from = startDate;
	ganttData.to = endDate;
	ganttData.test_type = test_type;
	ganttData.data = [];

	// ガントチャートの生成
	GanttTable.createGanttTable(id, startDate, endDate, test_type, disp_mode, ganttData);
};
GanttTable.prev = function () {
	var startDate = GanttTable.start_date;
	var d = GanttTable.dateStringToDate(GanttTable.start_date);
	d = scheduleCommon.addDate(d, -(GanttTable.disp_span * 30));
	startDate = scheduleCommon.getDateString(d, "{0}/{1}/{2}");
	GanttTable.start_date = startDate;
	//GanttTable.Init(id, "", "", test_type.disp_mode);
};
GanttTable.next = function (id, test_type, disp_mode) {
	var startDate = GanttTable.start_date;
	var d = GanttTable.dateStringToDate(GanttTable.start_date);
	d = scheduleCommon.addDate(d, (GanttTable.disp_span * 30));
	startDate = scheduleCommon.getDateString(d, "{0}/{1}/{2}");
	GanttTable.start_date = startDate;
	//GanttTable.Init(id, "", "", test_type.disp_mode);
};
// ガントテーブルの生成
GanttTable.createGanttTable = function (target_id,start_date,end_date,test_type,disp_mode,ganttData) {
	var target = $('#' + target_id);
	var param_id = $('<input type="hidden" id="param_id-' + target_id + '" value="' + target_id + '"/>');
	var param_sd = $('<input type="hidden" id="param_sd-' + target_id + '" value="' + start_date + '"/>');
	var param_ed = $('<input type="hidden" id="param_ed-' + target_id + '" value="' + end_date + '"/>');
	var param_test_type = $('<input type="hidden" id="param_test_type-' + target_id + '" value="' + test_type + '"/>');
	var param_disp_mode = $('<input type="hidden" id="param_disp_mode-' + target_id + '" value="' + disp_mode + '"/>');
	target.append(param_id);
	target.append(param_sd);
	target.append(param_ed);
	target.append(param_test_type);
	target.append(param_disp_mode);
	// 外枠
	var tbl = $('<div class="gantt_table"></div');
	// 左側（表示するスケジュールの名称などを表示するエリア）
	var left_div = $('<div class="gt_left_div"></div>');
		
	var left_top = $('<div class="gt_left_top_div"></div>');
	var left_top1 = $('<div class="gt_left_top1_div"><a class="gt_mode_button" id="mode_button-' + target_id + '">表示切替</a></div>');
	var left_top2 = $('<div class="gt_left_top2_div"></div>');
		
	var category1 = $('<div class="gt_category1_div"><label class="gt_label">' + ganttData.name + '</label></div>');
	var category2 = $('<div class="gt_category2_div"><label class="gt_label">' + ganttData.desc + '</label></div>');
		
	// 右側（スケジュールのガントチャートを表示するエリア）
	var right_div = $('<div class="gt_right_div"></div>');
		
	var right_top = $('<div class="gt_right_top_div"></div>');
	var right_top1 = $('<div class="gt_right_top1_div"></div>');
	var right_top2 = $('<div class="gt_right_top2_div"></div>');
	var right_top3 = $('<div class="gt_right_top3_div"></div>');
	target.append(tbl);
		
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
	var dateCount = GanttTable.calcDateCount(ganttData.from, ganttData.to);
	// 右側の列の全体幅	
	//var right_div_width = GanttTable.dateWidth * dateCount;
	//$(right_div).css('width', right_div_width + 'px');
	//$(right_div).css('width', '83%');
	// 日付表示行の生成
	GanttTable.createCalendarHeader(ganttData, right_top1, right_top2, right_top3, dateCount);
	// スケジュール表示行の生成
	GanttTable.createRows(ganttData, left_div, right_div, dateCount);
	// 表示切替ボタンのイベント処理登録
	$("#mode_button-" + target_id).click(GanttTable.dispModeChange);
};

// カレンダー表示行生成
GanttTable.createCalendarHeader = function(ganttData,right_top1,right_top2,right_top3,dateCount) {
    if (ganttData != null) {
		var startDate = GanttTable.dateStringToDate(ganttData.from);
		// 表示日付を年月日毎に文字列分割
		var sd = GanttTable.splitDateString(ganttData.from);
		var ed = GanttTable.splitDateString(ganttData.to);
		// 年の表示
		GanttTable.createYearHeader(right_top1,startDate, dateCount, sd, ed);
		// 月の表示
		GanttTable.createMonthHeader(right_top2, startDate, dateCount);
		// 日の表示
		GanttTable.createDateHeader(right_top3, startDate, dateCount);
    }
};
// 年の表示
GanttTable.createYearHeader = function (parent, startDate, dateCount, sd, ed) {
	// 年の表示
	var y = startDate.getFullYear();
	var dateCount_1 = 1; // 表示開始年に含まれる日数のカウント
	for (var j = 1; j < dateCount; j++) {
		var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
		if (y === nextDate.getFullYear()) {
			dateCount_1++;
		}
		else break;
	}
	
	var year_div1 = $('<div class="gt_cal_header" id="year_1">' + sd[0] + '年</>');
	var w1 = GanttTable.dateWidth * dateCount_1;
	$(year_div1).css("left", "0px");
	$(year_div1).css("width", w1 + "px");
	$(parent).append(year_div1);
	var w2 = GanttTable.dateWidth * (dateCount - dateCount_1);
	if (w2 > 0) {
		// 途中で年が変わっている場合
		var year_div2 = $('<div class="gt_cal_header" id="year_2">' + ed[0] + '年</>');
		$(year_div2).css("left", w1 + "px");
		$(year_div2).css("width", w2 + "px");
		$(year_div2).css("border-left", "1px solid #777777");
		$(parent).append(year_div2);
	}
	$(parent).css("width", (w1 + w2) + "px");
};
// 月の表示
GanttTable.createMonthHeader = function (parent,startDate, dateCount) {
	var m = startDate.getMonth();
	var dateCount_1 = 1;
	var dayOfMonth = [];
	// 表示開始から終了までに含まれる月とその日数をカウントする
	for (var j = 1; j < dateCount; j++) {
		var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
		if (m === nextDate.getMonth()) {
			dateCount_1++;
		}
		else {
			dayOfMonth.push(dateCount_1);
			m++;
			dateCount_1 = 1;
		}
	}
	dayOfMonth.push(dateCount_1);
	m = startDate.getMonth();
	var w1 = 0;
	var w2 = 0;
	for (var i = 0; i < dayOfMonth.length; i++) {
		var month_div1 = $('<div class="gt_cal_header" id="month' + (i + 1) + '">' + (m + 1) + '月</>');
		var w2 = GanttTable.dateWidth * dayOfMonth[i];
		$(month_div1).css("left", w1 + "px");
		$(month_div1).css("width", w2 + "px");
		$(month_div1).css("border-left", "1px solid #777777");
		w1 += w2;
		$(parent).append(month_div1);
		m++;
	}
	$(parent).css("width", w1 + "px");

};
// 日の表示
GanttTable.createDateHeader = function (parent, startDate, dateCount) {
	for (var j = 0; j < dateCount; j++) {
		var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
		var date_div = $('<div class="gt_cal_header_date" >' + nextDate.getDate() + '日(' + GanttTable.days[nextDate.getDay()] + ')</>');
		$(date_div).css("left", (j * GanttTable.dateWidth) + "px");
		$(date_div).css("width", GanttTable.dateWidth + "px");
		$(date_div).css("color", GanttTable.days_color[nextDate.getDay()]);
		// 祝日チェック		
		var holidayname = amaitortedays.isNationalHoliday(nextDate);
		if (holidayname) {
			$(date_div).css("color", GanttTable.days_color[0]);
		}		
		if (j > 0)
			$(date_div).css("border-left", "1px solid #777777");
		$(parent).append(date_div);
	}
	$(parent).css("width", (GanttTable.dateWidth * dateCount) + "px");
};

// 試験スケジュールのガントチャートを表示する行の生成
GanttTable.createRows = function (ganttData, left_div, right_div, dateCount) {
	GanttTable.searchEntryData(ganttData, left_div, right_div, dateCount);
};	

//
// 表示する案件データの検索
GanttTable.searchEntryData = function (ganttData, left_div, right_div, dateCount) {
	
	$.ajax({
		url: '/entry_get/term/' + GanttTable.dateSeparatorChange(ganttData.from, '-') + '/' + GanttTable.dateSeparatorChange(ganttData.to, '-') + '/' + ganttData.test_type,
		cache: false,
		dataType: 'json',
		success: function (entry_list) {
			//GanttTable.ganttData = ganttData;
			GanttTable.createEntryRows(ganttData, entry_list, left_div, right_div, dateCount);
		}
	});

};
// 
// 案件データからガントチャートを表示する行の生成
GanttTable.createEntryRows = function(ganttData, entry_list,left_div,right_div, dateCount) {
    if (entry_list != null) {
		var w1 = GanttTable.dateWidth * dateCount;

        var rows = entry_list.rows;
		for (var i in rows) {
			var date_infos = [rows[i].inquiry_date, rows[i].quote_issue_date, rows[i].order_accepted_date,rows[i].prior_payment_limit];
			var date_captions = ['問合せ日', '見積発行日', '受注日','事前入金期日'];
			// 表示に必要な行数（高さ）を算出する
			var lines = GanttTable.checkDateSpan(date_infos);
			// 項目名の表示
            var left_row = $("<div class='gt_left_row_div'></div>");
			var cate1 = $("<div class='gt_category1_div'></div>");
			var title = $("<label class='gt_label'>[" + rows[i].entry_no + "]<br/> " + rows[i].entry_title + "</lebel>");
			var add_button = $('<a class="gt_workitem_button" id="addbutton_' + rows[i].entry_no + '">作業項目追加</a>');
			var cate2 = $("<div class='gt_category2_div'><label class='gt_label'>営業マイルストーン</label></div>");
			var height = (GanttTable.rowHeight * lines) + "px"; // 高さを調整する
			$(left_row).attr("id", "entry_left_" + rows[i].entry_no);
			$(left_row).css("height", height);
			$(cate1).css('height',height);
			$(cate2).css('height', height);
			// 作業項目の追加ボタンの押下イベント処理定義
			$(add_button).bind('click',{entry_no: rows[i].entry_no, entry_title: rows[i].entry_title, workitem: null},workitemEdit.openDialog);
            $(left_div).append(left_row);
			$(cate2).append(add_button);
			$(cate1).append(title);
            $(left_row).append(cate1);
            $(left_row).append(cate2);
			// ガントチャートの表示
            var right_row = $("<div class='gt_right_row_div'></div>");
			$(right_row).attr("id", "entry_right_" + rows[i].entry_no);
			$(right_row).css("left", "0px");
			$(right_row).css("width", w1 + "px");
            $(right_div).append(right_row);		
			$(right_row).css("height", height);
			var num = lines / date_infos.length;
			var color = "yellow";
			if (lines === 1) {
				// 全てが1行に表示可能
				for (var j in date_infos) {
					// マイルストーン追加
					if (date_infos[j] === null) continue;
					if ((ganttData.from > date_infos[j]) || (ganttData.to < date_infos[j])) continue;
					$(right_row).append(GanttTable.milestone(0,ganttData, date_infos[j], date_captions[j], color));
				}
			}
			else if (lines === date_infos.length) {
				// 1行毎に1つのマイルストーンを表示する(全てが重なる）
				for (var j in date_infos) {
					// マイルストーン追加
					if (date_infos[j] === null) continue;
					if ((ganttData.from > date_infos[j]) || (ganttData.to < date_infos[j])) continue;
					$(right_row).append(GanttTable.milestone(j,ganttData, date_infos[j], date_captions[j], color));
				}
			}
			else if (date_infos.length > lines) {
				// 1行おきに行を替えて表示する
				for (var j in date_infos) {
					// マイルストーン追加
					if (date_infos[j] === null) continue;
					if ((ganttData.from > date_infos[j]) || (ganttData.to < date_infos[j])) continue;
					$(right_row).append(GanttTable.milestone((j % lines),ganttData, date_infos[j], date_captions[j], color));
				}
			}
			// 試験（見積）明細データの検索とマイルストーン表示、作業項目表示
			GanttTable.searchData(ganttData, rows[i].entry_no, rows[i].entry_title,left_row, right_row, dateCount, lines);
        }
    }
};
//
// 表示データの検索
GanttTable.searchData = function (ganttData, entry_no, entry_title, left_row, right_row, dateCount, exist_lines) {
	// 表示する試験（見積）明細データの検索
	var quote_list = $.get('/quote_gantt/' + entry_no, {});
	// 表示作業項目データの検索
	var workitem_list = $.get('/workitem_get/' + entry_no, {});
	
	$.when(quote_list, workitem_list)
    .done(function (quote_listResponse, workitem_listResponse) {
		var lines = GanttTable.createQuoteRows(ganttData, quote_listResponse[0], left_row, right_row, dateCount, exist_lines);
		GanttTable.createWorkitemRows(ganttData, workitem_listResponse[0], entry_no, entry_title, left_row, right_row, dateCount, exist_lines + lines);
		var child = $(right_row).children();
		if (child.length === 0) {
			$(left_row).css("display", "none");
			$(right_row).css("display", "none");
		}
	})
    .fail(function () {
		$("#error").html("an error occured").show();
	});
};

// 
// 試験（見積）明細データからマイルストーンを表示する行の生成
GanttTable.createQuoteRows = function (ganttData, quote_list, left_row, right_row, dateCount, exist_lines) {
	var total_lines = 0;
	if (quote_list != null) {
		var w1 = GanttTable.dateWidth * dateCount;
		
		var rows = quote_list;
		for (var i = 0;i < rows.length;i++) {
			var date_infos = [rows[i].arrive_date, rows[i].final_report_limit, rows[i].quick_report_limit1, rows[i].quick_report_limit2];
			var date_captions = ['到着日', '最終報告書期限', '速報提出期限１','速報提出期限２'];
			// 表示に必要な行数（高さ）を算出する
			var lines = GanttTable.checkDateSpan(date_infos);
			// 項目名の表示
			//var left_row = $("<div class='gt_left_row_div'></div>");
			var cate1 = $("<div class='gt_category1_div'><label class='gt_label'></lebel></div>");
			var cate2 = $("<div class='gt_category2_div'><label class='gt_label'>" + rows[i].test_item + "</label></div>");
			var height1 = (GanttTable.rowHeight * (total_lines + lines + exist_lines)) + "px"; // 高さを調整する
			var height2 = (GanttTable.rowHeight * lines) + "px"; // 高さを調整する
			var top = (GanttTable.rowHeight * (exist_lines + i)) + "px"; // 表示位置を調整する
			$(left_row).css("height", height1);
			$(cate1).css('top', top);
			$(cate2).css('top', top);
			$(cate1).css('height', height2);
			$(cate2).css('height', height2);
			//$(left_div).append(left_row);
			$(left_row).append(cate1);
			$(left_row).append(cate2);

			//var right_row = $("<div class='gt_right_row_div'></div>");
			$(right_row).css("left", "0px");
			$(right_row).css("width", w1 + "px");
			$(right_row).css("height", height1);
			var num = lines / date_infos.length;
			var color = "yellow";			
			if (lines === 1) {
				// 全てが1行に表示可能
				for (var j in date_infos) {
					// マイルストーン追加
					if (date_infos[j] === null) continue;
					if ((ganttData.from > date_infos[j]) || (ganttData.to < date_infos[j])) continue;
					(j > 0) ? color = "red" : color = "yellow";
					var ms = GanttTable.milestone(exist_lines + total_lines, ganttData, date_infos[j], date_captions[j], color);
					if (ms != null) {
						$(right_row).append(ms);
					}
				}
			}
			else if (lines === date_infos.length) {
				// 1行毎に1つのマイルストーンを表示する(全てが重なる）
				for (var j in date_infos) {
					// マイルストーン追加
					if (date_infos[j] === null) continue;
					if ((ganttData.from > date_infos[j]) || (ganttData.to < date_infos[j])) continue;
					(j > 0) ? color = "red" : color = "yellow";
					var ms = GanttTable.milestone(exist_lines + j + total_lines, ganttData, date_infos[j], date_captions[j], color);
					if (ms != null) {
						$(right_row).append(ms);
					}
				}
			}
			else if (date_infos.length > lines) {
				// 1行おきに行を替えて表示する
				for (var j in date_infos) {
					// マイルストーン追加
					if (date_infos[j] === null) continue;
					if ((ganttData.from > date_infos[j]) || (ganttData.to < date_infos[j])) continue;
					(j > 0) ? color = "red" : color = "yellow";
					var ms = GanttTable.milestone(exist_lines + total_lines + (j % lines), ganttData, date_infos[j], date_captions[j], color);
					if (ms != null) {
						$(right_row).append(ms);
					}
				}
			}
			total_lines += lines;
		}
	}
	return total_lines;
};

//
// 作業項目の表示行生成
GanttTable.createWorkitemRows = function (ganttData, workitem_list, entry_no,entry_title, left_row, right_row, dateCount, exist_lines) {
	if (workitem_list != null) {
		var w1 = GanttTable.dateWidth * dateCount;
		
		var rows = workitem_list;
		var lines = rows.length;
		// 表示に必要な行数（高さ）を算出する
		var height1 = (GanttTable.rowHeight * (lines + exist_lines)); // 高さを調整する
		var top = GanttTable.rowHeight * exist_lines;
		for (var i = 0;i < rows.length;i++) {
			var cate1 = $("<div class='gt_category1_div'><label class='gt_label'></lebel></div>");
			// 項目名の表示
			var cate2 = $("<div class='gt_category2_div'><label class='gt_label'>" + rows[i].work_title + "</label></div>");
			// 表示位置を調整する
			//top = top + (GanttTable.rowHeight * i);
			// 高さを調整する
			var height2 = GanttTable.rowHeight; 
			if (rows[i].progress > 0) {
				// 進捗度が0以上なら表示領域を確保する
				height1 = height1 + GanttTable.rowHeight;
				height2 = (GanttTable.rowHeight * 2);
			}			
			$(left_row).css("height", height1 + "px");
			$(cate1).css('top', top + "px");
			$(cate2).css('top', top + "px");
			$(cate1).css('height', height2 + "px");
			$(cate2).css('height', height2 + "px");
			//$(left_div).append(left_row);
			$(left_row).append(cate1);
			$(left_row).append(cate2);
			// ガントチャートの表示
			//var right_row = $("<div class='gt_right_row_div'></div>");
			$(right_row).css("left", "0px");
			$(right_row).css("width", w1 + "px");
			$(right_row).css("height", height1 + "px");
			var color = "yellow";
			// 作業項目の表示
			var band = GanttTable.workitem_band(top + 4/*exist_lines + i*/, ganttData, rows[i], entry_no, entry_title, color);
			if (band != null) {
				$(right_row).append(band);
			}
			if (rows[i].progress > 0) {
				if (band != null) {
					// 作業項目の進捗度表示
					var prog = GanttTable.workitem_progress(top + 23 + 4/*exist_lines + i*/, ganttData, rows[i], entry_no, entry_title, color);
					if (prog != null) {
						$(right_row).append(prog);
					}
				}
				// 表示位置調整
				top += (GanttTable.rowHeight * 2);
			} else {
				top += GanttTable.rowHeight;
			}

		}
	}
};
// マイルストーン表示する日付項目の日にちをチェックして表示が重なる場合には
// 行数を増やす
GanttTable.checkDateSpan = function (dates) {
	var lines = 1;
	if (dates.length >= 2) {
		for (var i = 0; i < dates.length - 1; i++) {
			// 日数計算
			if ((dates[i] != null) && (dates[i + 1] != null)) {
				var dc = Math.abs(GanttTable.calcDateCount(dates[i], dates[i + 1]) - 1);
				if (dc <= 1) {
					// 日数が1日未満なら行を追加するためにカウントアップ
					lines++;
				}
			}
		}
	}
	return lines;
};

// マイルストーン表示
GanttTable.milestone = function (dispLine, GanttData, dispDate, caption, color) {
	var top = (dispLine * GanttTable.rowHeight) + 4;
	var ms = $('<a class="gt_milestone"><img  src="images/milestone_' + color + '.png" width="24px" height="24px" title="milestone"/>' + caption + '(' + dispDate + ')</a>');
	// 表示位置の計算
	var dc = GanttTable.calcDateCount(GanttData.from, dispDate) - 1;
	var pos = GanttTable.dateWidth * dc;
	if (pos >= 0) {
		pos += (GanttTable.dateWidth / 2) - 12;
	}
	$(ms).css("left", pos + "px");
	$(ms).css("top" , top + "px");
	return ms;
};

// 作業項目の表示
GanttTable.workitem_band = function (top, GanttData, workitem, entry_no, entry_title,color) {
	//var top = (dispLine * GanttTable.rowHeight) + 4;
	var ms = $('<a class="gt_workitem_band">' + workitem.work_title + '</a>');
	$(ms).attr('id', workitem.work_item_id);	
	$(ms).bind('click', { entry_no:entry_no, entry_title:entry_title,workitem:workitem}, workitemEdit.openDialog);
	// 表示位置の計算
	var dc = GanttTable.calcDateCount(GanttData.from, workitem.start_date) - 1;
	var start = GanttTable.dateWidth * dc;
	dc = GanttTable.calcDateCount(GanttData.from, workitem.end_date);
	if (GanttData.to < workitem.end_date) {
		// はみ出し防止
		dc = GanttTable.calcDateCount(GanttData.from, GanttData.to);
	}
	var end = GanttTable.dateWidth * dc;
	var w = end - start;
	if ((workitem.end_date < GanttData.from) || (GanttData.to < workitem.start_date)) {
		// はみ出し防止
		return null;
	}
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	dc = GanttTable.calcDateCount(workitem.start_date, today);
	if (dc > 1) {
		if (workitem.progress === 0) {
			$(ms).css("background-color", "red");
		}
	}	
	$(ms).css("left", start + "px");
	$(ms).css("width", w + "px");
	$(ms).css("top" , top + "px");
	return ms;
};

// 作業項目の進捗度表示
GanttTable.workitem_progress = function (top, GanttData, workitem, entry_no, entry_title, color) {
	//var top = (dispLine * GanttTable.rowHeight) + 4;
	var ms = $('<a class="gt_workitem_progress">' + workitem.progress + "%" + '</a>');
	$(ms).attr('id', workitem.work_item_id);
	$(ms).bind('click', { entry_no: entry_no, entry_title: entry_title, workitem: workitem }, workitemEdit.openDialog);
	// 表示位置の計算
	var dc = GanttTable.calcDateCount(GanttData.from, workitem.start_date) - 1;
	var start = GanttTable.dateWidth * dc;
	dc = GanttTable.calcDateCount(GanttData.from, workitem.end_date);
	if (GanttData.to < workitem.end_date) {
		// はみ出し防止
		dc = GanttTable.calcDateCount(GanttData.from, GanttData.to);
	}
	var end = GanttTable.dateWidth * dc;
	var w = end - start;
	w = w * (workitem.progress / 100);
	if (GanttData.to < workitem.start_date) {
		// はみ出し防止
		return null;
	}
	// 今日までに達成すべき進捗度を求めて表示色を変更する
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	var prog = GanttTable.checkTodayProgress(today, workitem.start_date, workitem.end_date);
	var bg_color = "green";
	var color = "white";
	if (prog === -1) {
		bg_color = "cyan";  // 開始日以前
	} else if (prog > 100) {
		if (workitem.progress < 100) {
			// 予定期間を過ぎても100%になっていない場合は赤表示
			bg_color = "red";
		}
	} else {
		var p = workitem.progress / prog;
		if (p < 0.3) {
			bg_color = "red";
		} else if (p < 0.5) {
			bg_color = "yellow";
			color = "black";
		} else if (p > 0.8) {
			bg_color = "cyan";
			color = "black";
		}
		if (workitem.progress === 100) {
			bg_color = "green";
		}
	}
	$(ms).css("background-color", bg_color);
	$(ms).css("color", color);
	$(ms).css("left", start + "px");
	$(ms).css("width", w + "px");
	$(ms).css("top" , top + "px");
	return ms;
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

// 日数計算
GanttTable.calcDateCount = function (from, to) {
	var s = GanttTable.dateStringToDate(from);
	var e = GanttTable.dateStringToDate(to);
	var d = GanttTable.getDateCount(s, e);
	return d;
};
// 今日が予定に対してどの辺か調べる
GanttTable.checkTodayProgress = function (today, from, to) {
	var d1 = GanttTable.calcDateCount(from, today);
	var d2 = GanttTable.calcDateCount(from, to);
	if (d1 < 0) return -1;
	var prog = (d1 / d2) * 100;
	return prog;
};
GanttTable.dateStringToDate = function(dateString) {
    var date = new Date(dateString);
    return date;
};

GanttTable.getDateCount = function (start, end) {
	if ((start == null) || (end == null)) {
		return 0;
	}
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
};
//
// 日付区切り文字変更
GanttTable.dateSeparatorChange = function (dateString, separator) {
	return dateString.replace(/[/]/g, separator);
};