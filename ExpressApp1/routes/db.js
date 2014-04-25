exports.list = function(req, res){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'ViVi0504',
      database : 'drc_sch'
    });
	var result = {
		page:'',
		total:'',
		records:'',
		rows:[]
	};
    connection.query("select * from drc_sch.subjects",[],function(err,rows){
            if (err)    throw err;
			result.row = rows;
            console.log(rows);
        });
    //コネクションクローズ
    connection.end();
	var resultJSON = JSON.stringify(result);
	res.send(resultJSON);
};