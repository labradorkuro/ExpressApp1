//
// 2016.01.27 t.tanaka
// Model
// 支払いサイト情報
//
var Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define("sight_info", {
		id: { type: Sequelize.INTEGER, autoIncrement: true , primaryKey: true },
		client_cd:Sequelize.STRING(8),
		shimebi: Sequelize.INTEGER,
		sight_id: Sequelize.INTEGER,
		memo: Sequelize.STRING,
		delete_check: Sequelize.INTEGER,
		create_id: Sequelize.STRING,
		update_id: Sequelize.STRING


	});
};
