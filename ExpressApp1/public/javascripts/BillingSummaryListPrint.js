//
// DRC殿試験案件スケジュール管理
// 案件リスト印刷
//
$(function ()　{
    'use strict';
    //billingSummaryListPrint.makeListTable();
});

var billingSummaryListPrint = billingSummaryListPrint || {};
// 画面に表示されているグリッドからデータを取得して印刷用のテーブルを作成する
billingSummaryListPrint.makeListTable = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#print_date").append($("<label>" + today + "</label>"));
  // 親ウィンドウの#uriage_listを取得する
  var grid = window.opener.$("#billing_summary_list");
  // グリッドのデータを取得する
  var rows = grid.getRowData(); // 全件取得する
  $.each(rows,function(index,row) {
    var tr = $("<tr>" +
    "<td class='data_value border_up_left'>" + row.entry_no + "</td>" +
    "<td class='data_value border_up_left'>" + row.client_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.test_large_class_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.entry_title + "</td>" +
    "<td class='data_value border_up_right'>" + row.entry_amount_price + "</td>" +
    "<td class='data_value border_up_right'>" + row.entry_amount_tax + "</td>" +
    "<td class='data_value_num border_up_right'>" + row.entry_amount_total + "</td>" +
    "<td class='data_value_num border_up_left'>" + row.pay_planning_date + "</td>" +
    "<td class='data_value_num border_up_left'>" + row.report_limit_date + "</td>" +
    "<td class='data_value border_up_left'>" + row.seikyu_date + "</td>" +
    "<td class='data_value border_up_left'>" + row.billing_number + "</td>" +
    "<td class='data_value border_up_right'>" + row.pay_amount + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.pay_amount_tax + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.pay_amount_total + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.nyukin_yotei_date + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.nyukin_yotei_date_p + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.pay_complete_date + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.pay_complete + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.furikomi_ryo + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.pay_complete_total + "</td>" +
    "<td class='data_value border_up_left_left'>" + row.pay_result + "</td>" +
    "<td class='data_value border_up_left_left'>" + row.shikenjo + "</td>" +
  "</tr>"
  );
    // テーブル行を追加する
    $("#billing_summary_list_table").append(tr);

  });

}
