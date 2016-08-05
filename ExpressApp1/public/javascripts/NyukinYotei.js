//
// 入金予定日に関する処理クラス
//
var nyukinYotei = nyukinYotei || {};

// 請求先の支払いサイト情報を取得する
nyukinYotei.getSightInfo = function(client_cd) {
  // 検索処理
  return $.ajax({type:'get',url:'/sight_info?client_cd=' + client_cd});
};

// 請求日と締日を参照して、支払年を決定する
nyukinYotei.getYear = function(seikyu_date, sight_info) {
  var year = 2016;
  return year;
};

// 請求日と締日を参照して、支払日を決定する
nyukinYotei.getShiharaibi = function(seikyu_date, sight_info) {
  var month = 0;
  // 請求日
  var sd = scheduleCommon.dateStringToDate(seikyu_date);
  // 締日を設定
  var ch = scheduleCommon.dateStringToDate(seikyu_date);
  ch.setDate(Number(sight_info.shimebi));
  // 支払日を設定
  var shiharaibi = scheduleCommon.dateStringToDate(seikyu_date);
  shiharaibi.setDate(Number(sight_info.sight_date.shiharaibi));

  // 締日チェック
  if (sd > ch) {
    // 締日を過ぎている場合
    shiharaibi.setMonth(shiharaibi.getMonth() + 1);
  }
  // 支払いサイトに設定されている支払い月（翌月：１、翌々月：２）を加算する
  shiharaibi.setMonth(shiharaibi.getMonth() + sight_info.sight_date.shiharai_month);
  return shiharaibi;
};

// 入金予定日が営業日か判定し、休日の場合は前後に移動する
nyukinYotei.checkHoliday = function(shiharaibi,kyujitsu_setting) {
  var date = shiharaibi;
  var day = shiharaibi.getDay();
  //
  if (day == 0) {
    // 日曜日の場合
    if (kyujitsu_setting == 0) {
      // 前へ移動
      date.setDate(date.getDate() - 2);
    } else {
      // 後ろへ移動
      date.setDate(date.getDate() + 1);
    }
  } else if (day == 6) {
    // 土曜日の場合
    if (kyujitsu_setting == 0) {
      // 前へ移動
      date.setDate(date.getDate() - 1);
    } else {
      // 後ろへ移動
      date.setDate(date.getDate() + 2);
    }
  }
  return date;
}
