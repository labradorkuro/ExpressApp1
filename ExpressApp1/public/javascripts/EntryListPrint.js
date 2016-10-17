//
// DRC殿試験案件スケジュール管理
// 案件リスト印刷
//
$(function ()　{
    'use strict';
    entryListPrint.makeListTable();
});

var entryListPrint = entryListPrint || {};
// 画面に表示されているグリッドからデータを取得して印刷用のテーブルを作成する
entryListPrint.makeListTable = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#print_date").append($("<label>" + today + "</label>"));
  // 親ウィンドウの#entry_listを取得する
  var grid = window.opener.$("#entry_list");
  // グリッドのデータを取得する
  var rows = grid.getRowData(); // 全件取得する
  $.each(rows,function(index,row) {
    var tr = $("<tr>" +
    "<td class='data_value border_up_left'>" + row.pay_result + "</td>" +
    "<td class='data_value border_up_left'>" + row.pay_complete + "</td>" +
    "<td class='data_value border_up_left'>" + row.report_limit_date + "</td>" +
    "<td class='data_value border_up_left'>" + row.entry_no + "</td>" +
    "<td class='data_value border_up_left'>" + row.test_large_class_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.test_middle_class_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.client_name_1 + "</td>" +
    "<td class='data_value border_up_left'>" + row.agent_name_1 + "</td>" +
    "<td class='data_value border_up_left'>" + row.entry_title + "</td>" +
    "<td class='data_value border_up_left'>" + row.entry_status + "</td>" +
    "<td class='data_value border_up_left'>" + row.inquiry_date + "</td>" +
    "<td class='data_value border_up_left'>" + row.sales_person_id + "</td>" +
    "<td class='data_value border_up_left'>" + row.order_accept_check + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.created + "</td>" +
    "</tr>"
  );
    // テーブル行を追加する
    $("#entry_list_table").append(tr);

  });

}
