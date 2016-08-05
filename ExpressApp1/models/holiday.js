//
// 2016.01.27 t.tanaka
// Model
// 休日設定
//
var Sequelize = require('sequelize');

var Holiday = sequelize.define("holiday", {
	holiday_id: { type: Sequelize.INTEGER, autoIncrement: true , primaryKey: true },
	holiday_name:Sequelize.STRING(128),
	start_date: Sequelize.DATE,
	end_date: Sequelize.DATE,
	holiday_memo: Sequelize.STRING,
	delete_check: {type:Sequelize.INTEGER,defaultvalue:0},
	create_id: Sequelize.STRING,
	update_id: Sequelize.STRING

},
{
	schema:'drc_sch',
	underscored: true,
	timestamps: false
});
module.exports = function (sequelize, DataTypes) {
	return Holiday;
};
