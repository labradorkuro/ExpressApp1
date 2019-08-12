//
// 2016.01.27 t.tanaka
// Model
// 支払いサイト情報
//
var Sequelize = require('sequelize');

var Bank_info = sequelize.define("bank_info", {
	id: { type: Sequelize.INTEGER, autoIncrement: true , primaryKey: true },
	bank_name:Sequelize.STRING(1024),
	branch_name:Sequelize.STRING(1024),
	kouza_no:Sequelize.STRING(16),
	kouza_kind: Sequelize.INTEGER,
	meigi_name:Sequelize.STRING(1024),
	memo: Sequelize.STRING,
	delete_check: Sequelize.INTEGER,
	created_id: Sequelize.STRING,
	updated_id: Sequelize.STRING


}
,
{
	schema:'drc_sch',
	underscored: true,
	timestamps: false,
	classMethods:{
		associate:function(models) {
			Sight_info.belongsTo(models.bank_date,{foreignKey:'id'});
		}
	}
}
);
module.exports = function (sequelize, DataTypes) {
	return Bank_info;
};
