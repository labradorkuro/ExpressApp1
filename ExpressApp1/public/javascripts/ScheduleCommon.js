//
// 共通処理
var scheduleCommon = scheduleCommon || {};

// jqgridのフォントサイズを変える
scheduleCommon.changeFontSize = function(size){
    $('div.ui-jqgrid').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('font-size', size);
    $('table.ui-jqgrid-htable th').css('height', size)
        .children('div').css('height', size);
    $('div.ui-jqgrid-pager').css('height', size);
    $('div.ui-jqgrid-pager').css('font-size', '1em');
    $('.ui-pg-input').css('height', '1.3em');
    $('.ui-pg-selbox').css('height', '1.3em');
};

// モーダルウィンドウを閉じる
scheduleCommon.closeModalWindow = function() {
	$(window.parent.document.getElementById("overlayer")).hide();
	$(window.parent.document.getElementById("graylayer")).hide();
};