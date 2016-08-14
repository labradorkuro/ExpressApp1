//
// DRC殿試験案件スケジュール管理
// 顧客マスタ印刷
//
$(function ()　{
    'use strict';
    clientListPrint.makeListTable();
});

var clientListPrint = clientListPrint || {};
// 画面に表示されているグリッドからデータを取得して印刷用のテーブルを作成する
clientListPrint.makeListTable = function() {
  // 親ウィンドウの#entry_listを取得する
  var no = $("#list_no").val();
  var grid = window.opener.$("#client_list_" + no);
  // グリッドのデータを取得する
  var rows = grid.getRowData(); // 全件取得する
  $.each(rows,function(index,row) {
    var tr = $("<tr>" +
    "<td class='data_value border_up_left'>" + row.client_cd + "</td>" +
    "<td class='data_value border_up_left'>" + row.name_1 + "</td>" +
    "<td class='data_value border_up_left'>" + row.name_2 + "</td>" +
    "<td class='data_value border_up_left'>" + row.kana + "</td>" +
    "<td class='data_value border_up_left'>" + row.zipcode + "</td>" +
    "<td class='data_value border_up_left'>" + row.address_1 + "</td>" +
    "<td class='data_value border_up_left'>" + row.address_2 + "</td>" +
    "<td class='data_value border_up_left'>" + row.tel_no + "</td>" +
    "<td class='data_value border_up_left'>" + row.fax_no + "</td>" +
    "<td class='data_value border_up_left'>" + row.email + "</td>" +
    "<td class='data_value border_up_left'>" + row.memo + "</td>" +
    "<td class='data_value border_up_left_right'>" + row.created + "</td>"
  );
    // テーブル行を追加する
    $("#client_list_table").append(tr);

  });

}
