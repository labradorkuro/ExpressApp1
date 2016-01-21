// PDFの生成
//var PDFDocument = require('pdfkit-cjk');
//var blobStream = require('blob-stream');
//var Blob = require('blob');
//var fs = require('fs');
//var Iconv = require('iconv').Iconv;
//var conv = new Iconv('utf8', 'UTF-16');
//var bom = "\xFE\xFF";
// 
exports.print_pdf = function (req, res) {
	// debug data
	var data = {
		title: '御 見 積 書',
		quote_issue_date: '見積日',
		quote_no:'見積番号',
		drc_address1: '〒530-0044 大阪市北区東天満2-10-31　第9田淵ビル3F',
		drc_tel: 'TEL：06-6882-8201',
		drc_fax: 'FAX：06-6882-8202',
		drc_name: 'DRC株式会社',
		drc_division_name:'試験課',
		drc_prepared:'担当者',
		client_name_1: '新潟エスラボ株式会社　殿',
		client_name_2: '',
		prepared_division: '開発部開発課',
		prepared_name: '田中　武則　殿',
		quote_title: '件名',
		quote_title1: '件名',
		quote_title2: '件名',
		quote_title3: '件名',
		quote_expire: '有効期限',
		quote_total_price: '\\1,234,567-'
	};
//	var stream = doc.pipe(blobStream());
	printPdf.getEntryInfo(res, req.params.entry_no, data);
	printPdf.createPDF3();
};
var printPdf = printPdf || {};

// 案件情報の取得
printPdf.getEntryInfo = function (res, entry_no, data) {
	var sql = 'SELECT ' 
			+ 'entry_title,' // 案件名
			+ 'quote_no,' // 見積番号
			+ 'to_char(quote_issue_date,\'YYYY/MM/DD\') AS quote_issue_date,' // 見積書発行日
			+ "entry_info.client_cd," 
			+ "client_list.name_1 AS client_name_1," 
			+ "client_list.name_2 AS client_name_2," 
			+ "client_list.address_1 AS client_address_1," 
			+ "client_list.address_2 AS client_address_2," 
			+ "client_list.prepared_division," 
			+ "client_list.prepared_name," 
			+ 'division_info.division_name AS drc_division_name,'	// DRC試験課名 
			+ 'user_list.name AS drc_prepared' // DRC担当者
			+ ' FROM drc_sch.entry_info' 
			+ ' LEFT JOIN drc_sch.division_info ON(entry_info.division = division_info.division)' 
			+ ' LEFT JOIN drc_sch.client_list ON(entry_info.client_cd = client_list.client_cd)' 
			+ ' LEFT JOIN drc_sch.user_list ON(entry_info.person_id = user_list.uid)' 
			+ ' WHERE entry_no = $1 ';
	var entry = {};
	// SQL実行
	pg.connect(connectionString, function (err, connection) {
		connection.query(sql, [entry_no], function (err, results) {
			if (err) {
				console.log(err);
			} else {
				connection.end();
				if (results.rows.length == 1) {
					data.quote_issue_date = results.rows[0].quote_issue_date;
					data.quote_no = results.rows[0].no;
					data.client_name_1 = results.rows[0].client_name_1;
					data.client_name_2 = results.rows[0].client_name_2;
					data.prepared_division = results.rows[0].prepared_division;
					data.prepared_name = results.rows[0].prepared_name;
					data.drc_division_name = results.rows[0].drc_division_name;
					data.drc_prepared = results.rows[0].drc_prepared;
					var doc = new PDFDocument();
					try {
						;
//						var stream = doc.pipe(fs.createWriteStream('output.pdf'));
//						printPdf.addPage2(doc, data);
						printPdf.addPage(doc, data);
//						doc.end();
						doc.write('output.pdf');
/**
						stream.on('error', function () {
							//var blob = stream.toBlob('application/pdf');
							//var url = stream.toBlobURL('application/pdf');
							//res.render('pdf', { title: 'DRC試験スケジュール管理',src: url });
							//doc.pipe(res);
							stream.close();
						});
						stream.on('finish', function() {
								//var blob = stream.toBlob('application/pdf');
								//var url = stream.toBlobURL('application/pdf');
								//res.render('pdf', { title: 'DRC試験スケジュール管理',src: url });
								//doc.pipe(res);
							stream.close();
						});
**/
					} catch (e) {
						console.log(e);
					}
				}
			}
		});
	});
};
printPdf.addPage2 = function(doc, data) {
	doc.registerFont('Meiryo', 'fonts/meiryo.ttc', 'Meiryo');
	var top = 10;
	var left = 10;
	// 自社情報

	doc.font('Meiryo');
	doc.fontSize(10);
	left = 10;
	top = 130;
	doc.text(data.drc_address1, left, top);
	doc.text(data.drc_name, 270, top);
	top += 10;
	doc.text(data.drc_tel, left, top);
	top += 10;
	doc.text(data.drc_fax, left, top);
	top += 10;
	doc.text(data.drc_division_name, left, top);
	top += 10;
	doc.text(data.drc_prepared, left, top);
	
	// 請求先情報	
	//doc.fontSize(12);
	var left = 40;
	top += 10;

	if (data.client_name_1 != null)
		doc.text(data.client_name_1, left, top);
	top += 10;
	//if (data.client_name_2 != null)
		doc.text(data.client_name_2, left, top);
	top += 10;
	if (data.prepared_division != null)
		doc.text(data.prepared_division, left, top);
	top += 10;
	if (data.prepared_name != null)
		doc.text(data.prepared_name, left, top);

	top += 10;
	doc.text("下記の通りお見積申し上げます。", left, top);
	top += 10;
//	doc.text("件名：" + data.quote_title, left, top);
	top += 10;
//	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
//	doc.text(data.quote_title1, left, top);
	top += 10;
//	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
//	doc.text(data.quote_title2, left, top);
	top += 10;
//	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
//	doc.text(data.quote_title3, left, top);
	top += 10;
//	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
//	doc.text("有効期限：" + data.quote_expire, left, top);
	top += 10;
//	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
//	doc.fontSize(14);
	doc.text("御見積合計金額　" + data.quote_total_price, left, top);
	top += 10;
//	doc.moveTo(left, top).lineTo(left + 220, top).lineWidth(0.5).stroke("gray");
	
	top = 300;
	doc.font('Meiryo');
	doc.fontSize(10);
	doc.text("件　名", 120, top);
	doc.text("単位"  , 245, top);
	doc.text("数  量", 285, top);
	doc.text("単  価", 345, top);
	doc.text("金  額", 420, top);
	doc.text("備  考", 500, top);
/*
	left = 10;	
	doc.fontSize(10);
	// タイトル
	doc.font('Meiryo');
	for (var i = 0; i < 200; i++) {
		top += 10;		
		doc.text(data.drc_address1, left, top);
		doc.text(data.drc_name, 270, top);
		doc.text(data.drc_prepared, 360, top);
		doc.text(data.drc_tel, 460, top);
	}
 * **/
};
// PDF生成
printPdf.addPage = function (doc,data) {
	doc.registerFont('Meiryo', 'fonts/meiryo.ttc', 'Meiryo');
//	doc.registerFont('Meiryo', 'fonts/font_1_honokamin.ttf');
	
	var top = 100;
	
	doc.fontSize(25);
	// タイトル
	doc.font('Meiryo');
	doc.text(data.title, 80, 40);
	// 請求先情報	
	doc.fontSize(12);
	var left = 40;
	top = 100;
	if (data.client_name_1 != null)
		doc.text(data.client_name_1, left, top);
	top += 14;
	if (data.client_name_2 != null)
		doc.text(data.client_name_2, left, top);
	top += 14;
	if (data.prepared_division != null)
		doc.text(data.prepared_division, left, top);
	top += 14;
	if (data.prepared_name != null)
		doc.text(data.prepared_name, left, top);
	top += 28;
	doc.text("下記の通りお見積申し上げます。", left, top);
	top += 14;
	doc.text("件名：" + data.quote_title, left, top);
	top += 14;
	doc.moveTo(left, top).lineTo(left + 200,top).lineWidth(0.5).stroke("gray");
	doc.text(data.quote_title1, left, top);
	top += 14;
	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
	doc.text(data.quote_title2, left, top);
	top += 14;
	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
	doc.text(data.quote_title3, left, top);
	top += 14;
	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
	doc.text("有効期限：" + data.quote_expire, left, top);
	top += 14;
	doc.moveTo(left, top).lineTo(left + 200, top).lineWidth(0.5).stroke("gray");
	doc.fontSize(14);
	doc.text("御見積合計金額　" + data.quote_total_price, left, top);
	top += 16;
	doc.moveTo(left, top).lineTo(left + 220, top).lineWidth(0.5).stroke("gray");
	// 見積情報
	doc.fontSize(8);
	left = 280;
	top = 100;
	if(data.quote_issue_date != null)
		doc.text("見積日：" + data.quote_issue_date, left, top);
	top += 10;
	if (data.quote_no != null)
		doc.text("見積番号：" + data.quote_no, left, top);
	// 自社情報
	doc.fontSize(8);
	left = 280;
	top = 130;
	doc.text(data.drc_address1, left, top);
	top += 14;
	doc.text(data.drc_name, left, top);
	top += 14;
	doc.text(data.drc_tel, left, top);
	top += 14;
	doc.text(data.drc_fax, left, top);
	top += 14;
	doc.text(data.drc_division_name, left, top);
	top += 14;
	doc.text(data.drc_prepared, left, top);

	// 明細表
	left = 40;
	top = 300;
	var w = 520;
	var h = 20;
	doc.lineJoin("round").rect(left, top, w, h).lineWidth(1).stroke("black");
	h = 480;
	doc.lineJoin("round").rect(left, top, w, h).lineWidth(2).stroke("black");
	for (var i = 0; i < 23; i++) {
		top += 20;
		doc.moveTo(left, top).lineTo(left + w, top).lineWidth(1).stroke("black");
	}
	top = 300;
	doc.moveTo(240, top).lineTo(240, top + h).lineWidth(1).stroke("black");
	doc.moveTo(280, top).lineTo(280, top + h).lineWidth(1).stroke("black");
	doc.moveTo(340, top).lineTo(340, top + h).lineWidth(1).stroke("black");
	doc.moveTo(400, top).lineTo(400, top + h).lineWidth(1).stroke("black");
	doc.moveTo(480, top).lineTo(480, top + h).lineWidth(1).stroke("black");
	
	top = 300;
	doc.fontSize(12);
	doc.font('Meiryo');
	doc.text("件　名", 120, top);
	doc.text("単位"  , 245, top);
	doc.text("数  量", 285, top);
	doc.text("単  価", 345, top);
	doc.text("金  額", 420, top);
	doc.text("備  考", 500, top);
	
	//doc.flashPages();
//	doc.moveTo(left, top).lineTo(left, top + h).lineWidth(2).stroke("black");
//	doc.moveTo(left + w, top).lineTo(left + w, top + h).lineWidth(2).stroke("black");
//	doc.moveTo(left, top + h).lineTo(left + w,top + h).lineWidth(2).stroke("black");
};
printPdf.createPDF2 = function (req, res) {
	phantom.create(function (err,ph) {
		ph.createPage(function (err, page) {
			page.set('viewportSize', { width: 600, height: 800 }, function (err) {
				page.set('clipRect', { width: 600, height: 800 }, function (err) {
					page.open('http://www.yahoo.co.jp', function (err, status) {
						page.render('output/test.png', function (err) {
							ph.exit();
						});
					});
				});
			});
		});
	});
};
printPdf.createPDF = function (req,res) {
	res.render('index', { title: 'Express' }, function (err, html) {
		//HTML書き込み
		var filename = 'output/index.html';
		fs.writeFile(filename, html, function (err) {
			if (err) {
				console.log(err);
			} else {
				//PDF作成
				phantom.create(function (err, ph) {
					if (err) {
						console.log(err);
					} else {
						
						ph.createPage(function (err, page) {
							if (err) {
								console.log(err);
							}
							
							//page.set('viewportSize', { width: 600, height: 600 });
							page.set('paperSize', {
								format: "A4",
								orientation: "portrait",
								margin: { left: "2.5cm", right: "2.5cm", top: "1cm", bottom: "1cm" }
							});
							
							page.open(filename, function (err, status) {
								var pdffile = 'output/index.pdf';
								page.render(pdffile);
								page.close(function () {
									fs.readFile(pdffile, function (err, data) {
										if (err) {
											console.log(err);
										}
										
										res.set({
											'Content-Type': 'application/pdf',
											'Content-Disposition': 'attachment; filename="downloaded.pdf"'
										});
										res.send(data);
									});
								});
								ph.exit(function () {
									console.log('exit');
								});
							});
						});
					}
				});
			}			
		});
	});

};