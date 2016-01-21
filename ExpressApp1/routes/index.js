var express = require('express');
var router = express.Router();

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
		res.render('portal', { title: 'DRC試験スケジュール管理'  + drc_version});
	}
});

module.exports = router;

/*
 * GET home page.
 */
/*
exports.index = function (req, res){
	var msg = '';
	if (req.session.login != true) {
		msg = 'ログインしてください。';
		res.render('index', { title: 'DRC試験スケジュール管理' + drc_version, msg: msg });
	} else {
		res.render('portal', { title: 'DRC試験スケジュール管理'  + drc_version});
	}
};
*/