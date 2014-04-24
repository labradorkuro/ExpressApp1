


exports.list = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });

    connection.query("select * from sample",[],function(err,rows){
            if (err)    throw err;
            console.log(rows);
        });
    //コネクションクローズ
    connection.end();
    res.render('schedule', { title: 'DRC 試験スケジュール管理' });
    //res.send("respond with a resource");
};
