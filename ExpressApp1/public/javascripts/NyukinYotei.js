//
// 入金予定日に関する処理クラス
//
var nyukinYotei = nyukinYotei || {};

// 請求先の支払いサイト情報を取得する
nyukinYotei.getSightInfo = function(client_cd) {
  var sight_info = {client_cd:0,shimebi:"",sight_id:0,kyujitsu_setting:0,memo:""};
  // 検索処理
  var xhr = new XMLHttpRequest();
  //xhr.responseType = 'json';
  xhr.open('GET', '/sight_info?client_cd=' + client_cd, false);
  xhr.send(null);
  if (xhr.status == 200) {
    sight_info = xhr.response;
  }
  return sight_info;
};

// 請求日と締日を参照して、支払年を決定する
nyukinYotei.getYear = function(seikyu_date, sight_info) {
  var year = 2016;
  return year;
};

// 請求日と締日を参照して、支払月を決定する
nyukinYotei.getMonth = function(seikyu_date, sight_info) {
  var month = 1;
  return month;
};

// 入金予定日が営業日か判定し、休日の場合は前後に移動する
nyukinYotei.getDate = function(year,month,shiharaibi,kyujitsu_setting) {
  var date = new Date(year,month,shiharaibi,0,0,0,0);
  return scheduleCommon.getDateString(date,"{0}-{1}-{2}");
}
