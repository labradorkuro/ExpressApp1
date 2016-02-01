var done = function (res) {
	return function () {
		res.send('Done.\n');
	};
},
	dberr = function (res) {
		return function (e) {
			res.statusCode = 500;
			res.send(e);
		};
	};

module.exports =
{
	all: function (sequelize) {
		return function (req, res) {
			sequelize.sync(req.body).success(done(res)).error(dberr(res));
		};
	},
	
	one: function (models) {
		return function (req, res) {
			var model = models[req.params.table];
			if (model != undefined) {
				model.schema("drc_sch").sync(req.body).success(done(res)).error(dberr(res));
			}
			else {
				res.send(404);
			}
		};
	}
};