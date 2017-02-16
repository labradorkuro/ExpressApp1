//
// DRC殿試験案件スケジュール管理
// 案件リスト印刷
//
$(function ()　{
    'use strict';
    //uriageListPrint.makeListTable();
});

var uriageListPrint = uriageListPrint || {};
// 画面に表示されているグリッドからデータを取得して印刷用のテーブルを作成する
uriageListPrint.makeListTable = function() {
  var today = scheduleCommon.getToday("{0}/{1}/{2}");
  $("#print_date").append($("<label>" + today + "</label>"));
  // 親ウィンドウの#uriage_listを取得する
  var grid = window.opener.$("#uriage_list");
  // グリッドのデータを取得する
  var rows = grid.getRowData(); // 全件取得する
  $.each(rows,function(index,row) {
    var tr = $("<tr>" +
    "<td class='data_value border_up_left'>" + row.entry_no + "</td>" +
    "<td class='data_value border_up_left'>" + row.test_large_class_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.test_middle_class_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.client_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.agent_name + "</td>" +
    "<td class='data_value border_up_left'>" + row.entry_title + "</td>" +
    "<td class='data_value_num border_up_left'>" + row.uriage_sum + "</td>" +
    "<td class='data_value_num border_up_left'>" + row.uriage_tax + "</td>" +
    "<td class='data_value_num border_up_left'>" + row.uriage_total + "</td>" +
    "<td class='data_value border_up_left'>" + row.seikyu_date + "</td>" +
    "<td class='data_value border_up_left'>" + row.nyukin_date + "</td>" +
    "<td class='data_value border_up_left'>" + row.nyukin_yotei_date + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.sales_person_name + "</td>" +
    "</tr>"
  );
    // テーブル行を追加する
    $("#uriage_list_table").append(tr);

  });

}
