module.exports = function (sequelize) {

	var fs = require('fs')
    , path = require('path')
    , directory = 'models'
    , models = exports;

	try {
		fs.lstatSync(directory);
	}
  catch (e) {
		fs.mkdirSync(directory);
	}

	models.__cache = {};

	fs.readdirSync(directory).forEach(function (fname) {
		if (/\.js$/.test(fname)) {
			var name = path.basename(fname, '.js')
        , realpath = fs.realpathSync(directory + '/' + fname);

			models.__defineGetter__(name, function () {
				if (models.__cache[name] === undefined) {
					models.__cache[name] = sequelize.import(realpath);
				}
				return models.__cache[name];
			});
		}
	});
	return models;
};
