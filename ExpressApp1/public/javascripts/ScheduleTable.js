
(function ($) {

    
    $.scheduleTable = function(id, data){
        $('#' + id).each(function(i){
            var tbl = $('<table class="schedule_table">');
            $(this).append(tbl);
            if (data != null) {
                // ヘッダー行の生成
                var header_length = data.header.length;
                var tr = $('<tr></tr>');
                $(tbl).append(tr);
                for(var ii = 0;ii < header_length;ii++) {
                    $(tr).append('<th>' + data.header[ii] + '</th>');
                }
                // 明細行の生成
                var rows_length = data.rows.length;
                for(var j = 0;j < rows_length;j++) { // 被験者数（試験数）
                    var sample_count = data.rows[j].sample.length;
                    for(var ii = 0;ii < sample_count;ii++) {   // 検体数（被験者数）
                        var tr = $('<tr></tr>');
                        $(tbl).append(tr);
                        if (ii == 0) {
                            var td = $('<td rowspan="' + sample_count + '">' + data.rows[j].name + '</td>');
                            $(tr).append(td);
                        }
                        $(tr).append('<td>' + data.rows[j].sample[ii] + '</td>');
                        // スケジュール表示（暫定）ガントチャートを表示するように変更予定
                        if (ii < data.rows[j].schedule.length) {
                            for(var jj = 0;jj < data.rows[j].schedule[ii].length;jj++) {    // スケジュール数
                                $(tr).append('<td>' + data.rows[j].schedule[ii][jj].name + '</td>');
                            }
                        }
                    }
                }
            }
        });
    };

})(jQuery);
