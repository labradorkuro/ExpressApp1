module.exports = {
	getTimestamp: function (format_str) {
		var d = new Date();
		var date_format = this.format(format_str,
			d.getFullYear(),
			d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1),
		    d.getDate() < 10 ? "0" + d.getDate() : d.getDate(),
			d.getHours() < 10 ? "0" + d.getHours() : d.getHours(),
			d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
			d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
		);
		return date_format;
	},
	getToday: function (format_str) {
		var d = new Date();
		var date_format = this.format(format_str,
			d.getFullYear(),
			d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1),
		    d.getDate() < 10 ? "0" + d.getDate() : d.getDate()
		);
		return date_format;
	},
	/**
	 * フォーマット関数
	 */
	format : function (fmt, a) {
		var rep_fn = undefined;
		
		if (typeof a == "object") {
			rep_fn = function (m, k) { return a[ k ]; }
		}
		else {
			var args = arguments;
			rep_fn = function (m, k) { return args[ parseInt(k) + 1 ]; }
		}
		
		return fmt.replace(/\{(\w+)\}/g, rep_fn);
	},
	// 日付項目のチェックと値変換
	dateCheck : function (dt) {
		var rtn = null;
		if ((dt === '') || (dt === null)) {
			rtn = null;
		} else {
			rtn = dt;
		}
		return rtn;
	}
 
};
