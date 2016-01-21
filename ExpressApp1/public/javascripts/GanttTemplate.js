//
// ガントチャートのテンプレート生成
// 

var GanttTemplate =  GanttTemplate || {};
GanttTemplate.ganttData = null;
GanttTemplate.disp_span = 1;		// 表示期間（1：１ヶ月、3：3ヶ月、6：6ヶ月、12：12ヶ月）
GanttTemplate.dateWidth = 100;
GanttTemplate.rowHeight = 32;
GanttTemplate.dateCount = 0;
GanttTemplate.writtable = false;	// 追加、更新権限
// 権限チェック
GanttTemplate.checkAuth = function() {
	var user_auth = scheduleCommon.getAuthList($.cookie('user_auth'));
	for(var i in user_auth) {
		var auth = user_auth[i];
		if (auth.name == "f05") {
			if (auth.value == 2) {
				GanttTemplate.writtable = true;
			} else {
				GanttTemplate.writtable = false;
			}
		}
	}
};
// 初期化
GanttTemplate.Init = function (id){
	$('#' + id).empty();
	var ganttData = {};
	ganttData.name = "テンプレート名";
	ganttData.desc = "作業項目";
	ganttData.from = "2000/01/01";
	ganttData.to = "2000/06/30";
	ganttData.data = [];

	// ガントチャートの生成
	GanttTemplate.createGanttTemplate(id, ganttData);
};
// ガントテーブルの生成
GanttTemplate.createGanttTemplate = function (target_id,ganttData) {
	var target = $('#' + target_id);
	// 外枠
	var tbl = $('<div class="gantt_table"></div');
	// 左側（表示するスケジュールの名称などを表示するエリア）
	var left_div = $('<div class="gt_left_div"></div>');
		
	var left_top = $('<div class="gt_left_top_div"></div>');
	var add_template_button = $('<a class="gt_mode_button" id="mode_button-' + target_id + '">テンプレート追加</a>');
	// ボタン押下イベント設定
	$(add_template_button).bind('click',templateEdit.openTemplateNameDialog);
	var left_top1 = $('<div class="gt_left_top1_div"></div>');
	// 権限チェック
	if (GanttTemplate.writtable) {
		$(left_top1).append(add_template_button);
	}
	var left_top2 = $('<div class="gt_left_top2_div"></div>');
		
	var category1 = $('<div class="gt_category1_div"><label class="gt_label">' + ganttData.name + '</label></div>');
	var category2 = $('<div class="gt_category2_div"><label class="gt_label">' + ganttData.desc + '</label></div>');
		
	// 右側（スケジュールのガントチャートを表示するエリア）
	var right_div = $('<div class="gt_right_div">');
	
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
	GanttTemplate.dateCount = scheduleCommon.calcDateCount(ganttData.from, ganttData.to);
	// 日付表示行の生成
	GanttTemplate.createCalendarHeader(ganttData, right_top1, right_top2, right_top3);
	// スケジュール表示行の生成
	GanttTemplate.createRows(ganttData, left_div, right_div);
	// 表示切替ボタンのイベント処理登録
	$("#mode_button-" + target_id).click(GanttTemplate.dispModeChange);
};

// カレンダー表示行生成
GanttTemplate.createCalendarHeader = function(ganttData,right_top1,right_top2,right_top3) {
    if (ganttData != null) {
		var startDate = scheduleCommon.dateStringToDate(ganttData.from);
		// 年の表示
		GanttTemplate.createYearHeader(right_top1);
		// 月の表示
		GanttTemplate.createMonthHeader(right_top2, startDate);
		// 日の表示
		GanttTemplate.createDateHeader(right_top3, startDate);
    }
};
// 年の表示
GanttTemplate.createYearHeader = function (parent) {
	var year_div1 = $('<div class="gt_cal_header" id="year_1">年</>');
	var w1 = GanttTemplate.dateWidth * GanttTemplate.dateCount;
	$(year_div1).css("left", "0px");
	$(year_div1).css("width", w1 + "px");
	$(parent).append(year_div1);
	$(parent).css("width", w1 + "px");
};
// 月の表示
GanttTemplate.createMonthHeader = function (parent,startDate) {
	var m = startDate.getMonth();
	var dateCount_1 = 1;
	var dayOfMonth = [];
	// 表示開始から終了までに含まれる月とその日数をカウントする
	for (var j = 1; j < GanttTemplate.dateCount; j++) {
		var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
		if (m === nextDate.getMonth()) {
			dateCount_1++;
		}
		else {
			dayOfMonth.push(dateCount_1);
			if (m == 11) m = 0; else m++;
			dateCount_1 = 1;
		}
	}
	dayOfMonth.push(dateCount_1);
	m = startDate.getMonth();
	var w1 = 0;
	var w2 = 0;
	for (var i = 0; i < dayOfMonth.length; i++) {
		var month_div1 = $('<div class="gt_cal_header" id="month' + (i + 1) + '">' + (m + 1) + 'ヶ月目</>');
		var w2 = GanttTemplate.dateWidth * dayOfMonth[i];
		$(month_div1).css("left", w1 + "px");
		$(month_div1).css("width", w2 + "px");
		if (i > 0) {
			$(month_div1).css("border-left", "1px solid #777777");
		}
		w1 += w2;
		$(parent).append(month_div1);
		if (m == 11) m = 0; else m++;
	}
	$(parent).css("width", w1 + "px");

};
// 日の表示
GanttTemplate.createDateHeader = function (parent, startDate) {
	for (var j = 0; j < GanttTemplate.dateCount; j++) {
		var nextDate = new Date(startDate.getTime() + ((24 * 3600 * 1000) * j));
		var date_div = $('<div class="gt_cal_header_date" >' + nextDate.getDate() + '日目</div>');
		$(date_div).css("left", (j * GanttTemplate.dateWidth) + "px");
		$(date_div).css("width", GanttTemplate.dateWidth + "px");
		$(date_div).css("color", "black");
		if (j > 0)
			$(date_div).css("border-left", "1px solid #777777");
		$(parent).append(date_div);
	}
	$(parent).css("width", (GanttTemplate.dateWidth * GanttTemplate.dateCount) + "px");
};

// 登録されているテンプレートを表示する行の生成
GanttTemplate.createRows = function (ganttData, left_div, right_div) {
	GanttTemplate.searchData(ganttData, left_div, right_div);
};	
//
// 表示するテンプレートデータの検索
GanttTemplate.searchData = function (ganttData, left_div, right_div) {
	
	$.ajax({
		url: '/template_name_list',		// 登録されているテンプレートの名前リスト（＝件数）を取得する
		cache: false,
		dataType: 'json',
		success: function (template_name_list) {
			// 検索結果リストから表示行を生成する
			GanttTemplate.createTemplateRows(ganttData, template_name_list, left_div, right_div);
		}
	});

};
// 
// ガントチャートを表示する行の生成
GanttTemplate.createTemplateRows = function(ganttData, template_name_list,left_div,right_div) {
    if (template_name_list != null) {
		var w1 = GanttTemplate.dateWidth * GanttTemplate.dateCount;

        var rows = template_name_list;
		for (var i in rows) {
			var lines = 1;
			var left_row = $("<div class='gt_left_row_div'></div>");
            $(left_div).append(left_row);
            var right_row = $("<div class='gt_right_row_div'></div>");
            $(right_div).append(right_row);		
			// テンプレートを表示するための行を追加する
			GanttTemplate.addTemplateRow(rows[i],left_row,right_row, lines);
			// 保存されているテンプレートデータを検索して表示する
			GanttTemplate.searchTemplateData(ganttData, rows[i].template_cd, left_row, right_row, lines);
        }
    }
};
GanttTemplate.addTemplateRow = function(temp, left_row, right_row,lines) {
	var w1 = GanttTemplate.dateWidth * GanttTemplate.dateCount;
	var template = { template_cd: temp.template_cd, template_name: temp.template_name,template_id:-1,work_title:"",start_date:"2000/01/01",end_date:"2000/01/01",start_date_result:"",end_date_result:"",priority_item_id:"",subsequent_item_id:"",progress:0,item_type:0};
	// 項目名の表示
	//var left_row = $("<div class='gt_left_row_div'></div>");
	// テンプレート名表示エリア
	var cate1 = $("<div class='gt_category1_div'></div>");
	// テンプレート名を表示、編集ボタン生成
	var title = $('<a class="gt_workitem_button" id="editbutton_' + temp.template_cd + '">' + temp.template_name + '</a>');
	// 作業項目名表示エリア
	var cate2 = $("<div class='gt_category2_div'><label class='gt_label'></label></div>");
	$(title).css("top", 4);
	$(title).data("template", template);
	// 権限チェック
	if (GanttTemplate.writtable) {
		$(title).bind('click', templateEdit.openTemplateNameDialog);
	}
	// 作業項目追加ボタン作成
	var add_button = $('<a class="gt_workitem_button workitem_add_btn" id="addbutton_' + temp.template_cd + '">項目追加</a>');
	// 作業項目の追加ボタンの押下イベント処理定義
	$(add_button).css("top", 4);
	$(add_button).data("template", template);
	// 権限チェック
	if (GanttTemplate.writtable) {
		$(add_button).bind('click', templateEdit.openDialog);
		$(cate2).append(add_button);
	}
	var height = (GanttTemplate.rowHeight * lines) + "px"; // 高さを調整する
	$(left_row).attr("id", "template_left_" + template.template_cd);
	$(left_row).css("height", height);
	$(cate1).css('height',height);
	$(cate2).css('height', height);
	// テンプレート			
    //$(left_div).append(left_row);
	$(cate1).append(title);
    $(left_row).append(cate1);
    $(left_row).append(cate2);
	// ガントチャートの表示
    //var right_row = $("<div class='gt_right_row_div'></div>");
	$(right_row).attr("id", "template_right_" + template.template_cd);
	$(right_row).css("left", "0px");
	$(right_row).css("width", w1 + "px");
    //$(right_div).append(right_row);		
	$(right_row).css("height", height);
	// Droppable設定
	$(right_row).droppable({ drop: GanttTemplate.drop });
};

// 新しくテンプレート行を追加する
GanttTemplate.newRow = function(template_cd, template_name) {
	var temp = { template_cd: template_cd, template_name: template_name};
	var left_div = $("div.gt_left_div");
	var right_div = $("div.gt_right_div");

	var left_row = $("<div class='gt_left_row_div'></div>");
    $(left_div).append(left_row);
    var right_row = $("<div class='gt_right_row_div'></div>");
    $(right_div).append(right_row);		

	GanttTemplate.addTemplateRow(temp, left_row, right_row,1);
};

//
// 表示するテンプレートデータの検索
GanttTemplate.searchTemplateData = function (ganttData, template_cd, left_row, right_row, exist_lines) {
	// マイルストーンデータの検索
	var template_milestone_list = $.get('/template_get_list/' + template_cd + '/1?delete_check=0', {});
	// 作業項目データの検索
	var template_list = $.get('/template_get_list/' + template_cd + '/0?delete_check=0', {});
	var lines = 1;	
	$.when(template_list, template_milestone_list)
    .done(function (template_listResponse, template_milestoneResponse) {
		// 項目追加したマイルストーンの表示		
		var lines = GanttTemplate.createTemplateMilestoneRows(ganttData, template_milestoneResponse[0], left_row, right_row, exist_lines);
		// 作業項目の表示		
		GanttTemplate.createTemplateItemRows(ganttData, template_listResponse[0], left_row, right_row, exist_lines + lines);
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

// 項目追加したマイルストーンを表示する
GanttTemplate.createTemplateMilestoneRows = function (ganttData, template_list, left_row, right_row, exist_lines) {
	var total_lines = 0;
	if (template_list != null) {
		var w1 = GanttTemplate.dateWidth * GanttTemplate.dateCount;
		var date_infos = [];
		var rows = template_list;
		for (var i = 0;i < rows.length;i++) {
			date_infos.push(rows[i].start_date);
		}
		// 表示に必要な行数（高さ）を算出する
		var lines = GanttTemplate.checkDateSpan(date_infos);
		// 項目名の表示
		//var left_row = $("<div class='gt_left_row_div'></div>");
		var cate1 = $("<div class='gt_category1_div'><label class='gt_label'></lebel></div>");
		var cate2 = $("<div class='gt_category2_div'><label class='gt_label'>マイルストーン</label></div>");
		var height1 = (GanttTemplate.rowHeight * (total_lines + lines + exist_lines)) + "px"; // 高さを調整する
		var height2 = (GanttTemplate.rowHeight * lines) + "px"; // 高さを調整する
		var top = (GanttTemplate.rowHeight * exist_lines) + "px"; // 表示位置を調整する
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
		var ms = null;
		for (var j = 0; j < rows.length; j++) {
			if ((ganttData.from > rows[j].start_date) || (ganttData.to < rows[j].start_date)) continue;
			if (lines === 1) {
				// 全てが1行に表示可能
				// マイルストーン追加
				ms = GanttTemplate.milestone(exist_lines + total_lines, ganttData, rows[j].start_date, rows[j].work_title, color);
			} else if (lines === date_infos.length) {
				// 1行毎に1つのマイルストーンを表示する(全てが重なる）
				ms = GanttTemplate.milestone(exist_lines + j + total_lines, ganttData, rows[j].start_date, rows[j].work_title, color);
			} else if (date_infos.length > lines) {
				// 1行おきに行を替えて表示する
				ms = GanttTemplate.milestone(exist_lines + total_lines + (j % lines), ganttData, rows[j].start_date, rows[j].work_title, color);
			}	
			if (ms != null) {
				// 要素の追加とイベント登録
				$(ms).css("cursor","pointer");
				$(right_row).append(ms);
				GanttTemplate.milestoneBind(ms, rows[j], ganttData);
			}
		}
	}

 	return total_lines + lines;
};
// マイルストーンのイベント登録
GanttTemplate.milestoneBind = function (ms,template, ganttData) {
	$(ms).data("template", template);
	$(ms).data("ganttdata", ganttData);
	// 権限チェック
	if (GanttTemplate.writtable) {
		$(ms).bind('click', templateEdit.openDialog);
		$(ms).draggable({ revert: false, zIndex: 1000, axis: "x" , start: GanttTemplate.dragStart });
	}
};
//
// 作業項目の表示行生成
GanttTemplate.createTemplateItemRows = function (ganttData, template_list, left_row, right_row, exist_lines) {
	if (template_list != null) {
		var w1 = GanttTemplate.dateWidth * GanttTemplate.dateCount;
		
		var rows = template_list;
		var lines = rows.length;
		// 表示に必要な行数（高さ）を算出する
		var height1 = (GanttTemplate.rowHeight * (lines + exist_lines)); // 高さを調整する
		var top = GanttTemplate.rowHeight * exist_lines;
		for (var i = 0;i < rows.length;i++) {
			var cate1 = $("<div class='gt_category1_div'><label class='gt_label'></lebel></div>");
			// 項目名の表示
			var cate2 = $("<div class='gt_category2_div'><label class='gt_label'>" + rows[i].work_title + "</label></div>");
			// 表示位置を調整する
			//top = top + (GanttTemplate.rowHeight * i);
			// 高さを調整する
			var height2 = GanttTemplate.rowHeight; 
			if (rows[i].progress > 0) {
				// 進捗度が0以上なら表示領域を確保する
				height1 = height1 + GanttTemplate.rowHeight;
				height2 = (GanttTemplate.rowHeight * 2);
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
			var band = GanttTemplate.template_band(top + 4/*exist_lines + i*/, ganttData, rows[i], color);
			if (band != null) {
				var right_row_line = $("<div class='gt_right_row_line_div'></div>");
				$(right_row_line).css("left", "0px");
				$(right_row_line).css("top", top + "px");
				$(right_row_line).css("width", w1 + "px");
				$(right_row_line).css("height", height2 + "px");
				$(right_row).append(right_row_line);
				$(right_row_line).append(band);
			}
			top += GanttTemplate.rowHeight;

		}
	}
};
// マイルストーン表示する日付項目の日にちをチェックして表示が重なる場合には
// 行数を増やす
GanttTemplate.checkDateSpan = function (dates) {
	var lines = 1;
	var max = 1;
	if (dates.length >= 2) {
		for (var i = 0; i < dates.length - 1; i++) {
			// 日数計算
			if ((dates[i] != null) && (dates[i + 1] != null)) {
				var dc = Math.abs(scheduleCommon.calcDateCount(dates[i], dates[i + 1]) - 1);
				if (dc <= 1) {
					// 日数が1日未満なら行を追加するためにカウントアップ
					lines++;
					if (max < lines) {
						max = lines;
					}
				} else {
					// 日付が1日以上ずれた時はその時点の行数を保存してカウントを初期化する
					max = lines;
					lines = 1;
				}
			}
		}
	}
	return max;
};

// マイルストーンの要素を作成する
GanttTemplate.milestone = function (dispLine, GanttData, dispDate, caption, color) {
	var top = (dispLine * GanttTemplate.rowHeight) + 4;
	var ms = $('<a class="gt_milestone"><img class="gt_milestone_img" src="images/milestone_' + color + '.png" width="24px" height="24px" title="milestone"/>' + caption + '</a>');
	// 表示位置の計算
	var dc = scheduleCommon.calcDateCount(GanttData.from, dispDate) - 1;
	var pos = GanttTemplate.dateWidth * dc;
	if (pos >= 0) {
		pos += (GanttTemplate.dateWidth / 2) - 12;
	}
	$(ms).css("left", pos + "px");
	$(ms).css("top" , top + "px");
	return ms;
};

// 作業項目の表示
GanttTemplate.template_band = function (top, GanttData, template, color) {
	//var top = (dispLine * GanttTemplate.rowHeight) + 4;
	var ms = $('<a class="gt_workitem_band">' + template.work_title + '</a>');
	$(ms).attr('id', template.template_id);	
	// 表示位置の計算
	var dc = scheduleCommon.calcDateCount(GanttData.from, template.start_date) - 1;
	var start = GanttTemplate.dateWidth * dc;
	dc = scheduleCommon.calcDateCount(GanttData.from, template.end_date);
	if (GanttData.to < template.end_date) {
		// はみ出し防止
		dc = scheduleCommon.calcDateCount(GanttData.from, GanttData.to);
	}
	var end = GanttTemplate.dateWidth * dc;
	var w = end - start;
	if ((template.end_date < GanttData.from) || (GanttData.to < template.start_date)) {
		// はみ出し防止
		return null;
	}
	var today = scheduleCommon.getToday("{0}/{1}/{2}");
	dc = scheduleCommon.calcDateCount(template.start_date, today);
	if (dc > 1) {
		if (template.progress === 0) {
			$(ms).css("background-color", "red");
		}
	}	
	$(ms).css("cursor","pointer");
	$(ms).css("left", start + "px");
	$(ms).css("width", w + "px");
	top = 2;
	$(ms).css("top" , top + "px");
	// 要素のカスタムデータとして保存する
	$(ms).data("template", template);
	$(ms).data("ganttdata", GanttData);
	// 権限チェック
	if (GanttTemplate.writtable) {
		$(ms).bind('click', templateEdit.openDialog);
		$(ms).draggable({ revert: false, zIndex: 1000,axis:"x" ,start:GanttTemplate.dragStart});
	}
	return ms;
};

// スケジュールボタンにマウスが乗った時のイベント処理
GanttTemplate.btnHover_over = function() {
	$(this).css("background","#777777");
};

// スケジュールボタンからマウスが出た時のイベント処理
GanttTemplate.btnHover_out = function() {
	// IDをもとにデータを取得する
	//var id = $(this).attr("id").split("_");
	//var sch = GanttTemplate.schedule.data[id[1]].values[id[2]];
	$(this).css("background",$(this).data("color"));
};

// スケジュールボタン押下イベント処理
GanttTemplate.scheduleBtnClick = function() {
	$("#schedule_dialog").dialog("open");
};


GanttTemplate.splitDateString = function(dateString) {
	var ymd = new Array();
	ymd = dateString.split("/");
	return ymd;
};

GanttTemplate.dispModeChange = function() {
};
// スケジュールのドロップイベント処理
GanttTemplate.drop = function (event, ui) {
	var left = ui.position.left;
	var top = ui.position.top;
	// カスタムデータを取得する
	var template = $(ui.draggable).data('template');
	var ganttData = $(ui.draggable).data('ganttdata');
	var scrollLeft = $(ui.draggable).data('scroll_left');
	// 座標値から移動先の日付位置を求める
	var date_offset = Math.floor(left / GanttTemplate.dateWidth);
	var start = date_offset * GanttTemplate.dateWidth;
	$(ui.draggable).css('left', start + "px");
	// 位置とカレンダーの表示開始日から移動先の日付を求める
	var sd = scheduleCommon.addDate(scheduleCommon.dateStringToDate(ganttData.from), date_offset);
	// 現在の作業日数を求める
	var count = scheduleCommon.calcDateCount(template.start_date, template.end_date) - 1;
	// 移動先の日付に作業日数を加算して終了日を求める	
	var ed = scheduleCommon.addDate(sd, count);
	// 新しい日付を設定する
	template.start_date = scheduleCommon.getDateString(sd, "{0}/{1}/{2}");
	template.end_date = scheduleCommon.getDateString(ed, "{0}/{1}/{2}");
	$(ui.draggable).data('template', template);
	templateEdit.setFormData(template);
	templateEdit.updateItem(false);
	//$(ui.draggable).unbind('click');
	//$(ui.draggable).bind("click", templateEdit.openDialog);

};
// ドラッグ開始イベント処理
GanttTemplate.dragStart = function (event, ui) {
	// ドロップした時に編集ダイアログの表示を止めるためにフラグを入れる
	$(event.target).data('drag','on');
};

