$(function() {
	$.datepicker.setDefaults( $.datepicker.regional[ "ja" ] ); // 日本語化
	$(".datepicker").datepicker({dateFormat:"yy/mm/dd"});
});
