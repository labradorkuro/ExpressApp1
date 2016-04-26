//
// 2016.01.27 t.tanaka
// Model
// 支払いサイト情報
//
var Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define("sight_date", {
		id: { type: Sequelize.INTEGER, autoIncrement: true , primaryKey: true },
		disp_str:Sequelize.STRING(128),
		shiharaibi: Sequelize.INTEGER,
		shiharai_month: Sequelize.INTEGER,
		memo: Sequelize.STRING,
		delete_check: {type:Sequelize.INTEGER,defaultvalue:0},
		create_id: Sequelize.STRING,
		update_id: Sequelize.STRING

	});
};
