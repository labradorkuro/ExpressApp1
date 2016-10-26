//
// 2016.10.26 t.tanaka
// Model
// メール通知設定
//
var Sequelize = require('sequelize');

var Notifiy_settings = sequelize.define("notifiy_settings", {
	notifiy_id: { type: Sequelize.INTEGER, autoIncrement: true , primaryKey: true },
  event_name_1:Sequelize.STRING(128),
  send_address_1:Sequelize.STRING(1024),
  mail_title_1:Sequelize.STRING(128),
  mail_body_1:Sequelize.STRING(1024),
  event_name_2:Sequelize.STRING(128),
  send_address_2:Sequelize.STRING(1024),
  mail_title_2:Sequelize.STRING(128),
  mail_body_2:Sequelize.STRING(1024),
  smtp_server:Sequelize.STRING(128),
  smtp_port:Sequelize.STRING(8),
  userid:Sequelize.STRING(128),
  password:Sequelize.STRING(128),
	create_id: Sequelize.STRING,
	update_id: Sequelize.STRING

},
{
	schema:'drc_sch',
	underscored: true,
	timestamps: false
});
module.exports = function (sequelize, DataTypes) {
	return Notifiy_settings;
};
