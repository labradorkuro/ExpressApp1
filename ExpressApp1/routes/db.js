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
	var sql = "";
	switch (req.query.q ) {
		case 1:
			sql = "select * from drc_sch.subjects";
		break;
		case 2:
			sql = "select * from drc_sch.tests";
		break;
	} 
	connection.query("select * from drc_sch.tests",[],function(err,rows){
		if (err)    throw err;
			result.row = rows;
    });
    //コネクションクローズ
    connection.end();
	var resultJSON = JSON.stringify(result);
    console.log("q=" + req.query.q + " " + result);
	res.send(resultJSON);
};