/**
 *  config.sequelize = {
 *  	database: <string>
 *    , username: <string>
 *    , password: <string>
 *    , options:  <object>
 *  };
 */
module.exports = function (config) {
	
	var Sequelize = require('sequelize')
	  , params = config.sequelize || {};
	
	params.options = params.options || {};
	
	console.log('Sequelize connecting to %s on %s as %s', params.database, params.options.host || 'localhost', params.username);
	return new Sequelize(params.database, params.username, params.password, params.options);
};