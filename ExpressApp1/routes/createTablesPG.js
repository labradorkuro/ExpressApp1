// テーブルの生成と変更処理


// テーブルの生成
exports.create = function (req, res) {
  	var sql = [
		// 案件情報
		"CREATE TABLE IF NOT EXISTS drc_sch.entry_info ("
			+ "entry_no VARCHAR(10) NOT NULL,"		// 案件No
			+ "quote_no VARCHAR(3),"				// 見積番号
			+ "inquiry_date DATE,"					// 問合せ日
			+ "entry_status VARCHAR(2),"			// 案件ステータス
			+ "sales_person_id VARCHAR(32),"		// 営業担当者ID
			+ "agent_cd VARCHAR(8),"				// 代理店CD
			+ "client_cd VARCHAR(8),"				// クライアントCD
			+ "client_division_cd VARCHAR(8),"		// クライアント部署CD
			+ "client_person_id VARCHAR(128),"		// クライアント担当者ID
			+ "test_large_class_cd VARCHAR(4),"		// 試験大分類CD
			+ "test_middle_class_cd VARCHAR(4),"	// 試験中分類CD
			+ "entry_title VARCHAR(128),"			// 試験タイトル（案件名）
			+ "order_type INT2,"					// 受託区分
			+ "outsourcing_cd VARCHAR(8),"			// 委託先CD
			+ "order_accepted_date DATE,"			// 受注日付
			+ "order_accept_check INT2,"			// 仮受注チェック
			+ "acounting_period_no INT2,"			// 会計期No
			+ "test_person_id VARCHAR(32),"			// 試験担当者ID
			+ "entry_amount_price DECIMAL(9),"		// 案件合計金額
			+ "entry_amount_billing DECIMAL(9),"	// 案件請求合計金額
			+ "entry_amount_deposit DECIMAL(9),"	// 案件入金合計金額
			+ "report_limit_date DATE,"				// 報告書提出期限
			+ "report_submit_date DATE,"			// 報告書提出日
			+ "prompt_report_limit_date_1 DATE,"	// 速報提出期限１
			+ "prompt_report_submit_date_1 DATE,"	// 速報提出日１
			+ "prompt_report_limit_date_2 DATE,"	// 速報提出期限２
			+ "prompt_report_submit_date_2 DATE,"	// 速報提出日２
			+ "entry_memo VARCHAR(1024),"			// メモ		
			+ "delete_check INT2,"					// 削除フラグ
			+ "delete_reason VARCHAR(255),"			// 削除理由
			+ "input_check_date DATE,"				// 入力日
			+ "input_check INT2,"					// 入力完了チェック
			+ "input_operator_id VARCHAR(32),"		// 入力者ID
			+ "confirm_check_date DATE,"			// 確認日
			+ "confirm_check INT2,"					// 確認完了チェック
			+ "confirm_operator_id VARCHAR(32),"	// 確認者ID
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32),"				// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)"				// 更新者ID
			+ ", PRIMARY KEY(entry_no));",

		// 請求先情報
		"CREATE TABLE IF NOT EXISTS drc_sch.billing_info ("
			+ "entry_no VARCHAR(10),"		// 案件番号
			+ "billing_no SERIAL,"			// 請求番号
			+ "pay_planning_date DATE,"		// 請求日
			+ "pay_complete_date DATE,"		// 入金日
			+ "pay_amount DECIMAL(9),"		// 請求金額 
			+ "pay_result INT2,"			// 請求区分
			+ "client_cd VARCHAR(8),"		// クライアントCD
			+ "client_division_cd VARCHAR(8)," // クライアント部署CD
			+ "client_person_id VARCHAR(128),"// クライアント担当者ID
			+ "memo VARCHAR(1024),"			// 備考
			+ "delete_check INT2,"			// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32))",						// 更新者ID
//			+ ", PRIMARY KEY(entry_no,billing_no));",
//		"CREATE INDEX drc_sch.billing_info_index ON drc_sch.billing_info(entry_no,billing_no);",
		// 見積情報
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_info ("
			+ "entry_no VARCHAR(10),"		// 案件No
			+ "quote_no VARCHAR(3),"		// 見積番号
			+ "quote_date DATE,"			// 見積日
//			+ "entry_title VARCHAR(128),"	// 試験タイトル
			+ "monitors_num INT4,"			// 被験者数
			+ "quote_submit_check INT2,"	// 見積書提出済フラグ	
			+ "order_status INT2,"			// 受注ステータス
			+ "expire_date DATE,"			// 見積有効期限
			+ "quote_delete_check INT2,"	// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32))",						// 更新者ID
//			+ ", PRIMARY KEY(entry_no,quote_no));",
//		"CREATE INDEX drc_sch.quote_info_index ON drc_sch.quote_info(entry_no,quote_no);",

		// 見積明細情報
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_specific_info ("
			+ "entry_no VARCHAR(10),"		// 案件No
			+ "quote_no VARCHAR(3),"		// 見積番号
			+ "quote_detail_no VARCHAR(3)," // 明細番号
			+ "test_middle_class_cd VARCHAR(4),"	// 試験中分類CD
			+ "unit VARCHAR(16),"			// 単位
			+ "unit_price DECIMAL(10,2),"	// 単価
			+ "quantity INT4,"				// 数量
			+ "price DECIMAL(10,2),"			// 金額
			+ "summary_check INT2,"	// 集計対象フラグ
			+ "specific_memo VARCHAR(128)," // 備考
			+ "specific_delete_check INT2,"	// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32))",						// 更新者ID
//			+ ", PRIMARY KEY(entry_no,quote_no,quote_detail_no));",
//		"CREATE INDEX drc_sch.quote_specific_info_index ON drc_sch.quote_specific_info(entry_no,quote_no,quote_detail_no);",

		"CREATE TABLE IF NOT EXISTS drc_sch.base_info (" // 拠点マスタ
			+ "base_cd VARCHAR(2)," // 拠点CD
			+ "base_name VARCHAR(32)," // 拠点名
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY(base_cd));",

		"CREATE TABLE IF NOT EXISTS drc_sch.division_info (" // 事業部マスタ
			+ "division VARCHAR(2)," // 事業部ID
			+ "division_name VARCHAR(32)," // 事業部名
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY(division));",
		// 試験分類マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.test_item_list ("
			+ "item_cd VARCHAR(4),"			// 分類CD
			+ "item_name VARCHAR(128),"		// 分類名
			+ "item_type INT2 default 1,"	// 分類区分（1:大分類、2:中分類）
			+ "memo VARCHAR(128),"			// メモ
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32)"							// 更新者ID
			+ ", PRIMARY KEY(item_cd,item_type));",
/**
		// 試験大分類マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.test_large_class ("
			+ "large_class_cd VARCHAR(2),"		// 大分類CD
			+ "large_class_name VARCHAR(32),"	// 大分類名
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32),"			// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)"			// 更新者ID
			+ ", PRIMARY KEY(large_class_cd));",

		// 試験中分類マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.test_middle_class ("
			+ "middle_class_cd VARCHAR(2),"		// 中分類CD
			+ "middle_class_name VARCHAR(32),"	// 中分類名
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32),"			// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)"			// 更新者ID
			+ ", PRIMARY KEY(middle_class_cd));",
**/
		// 案件番号管理テーブル
		"CREATE TABLE IF NOT EXISTS drc_sch.entry_number (" 
			+ "entry_date DATE,"				// 案件登録日付
			+ "entry_count INT4"				// 案件登録数
			+ ", PRIMARY KEY(entry_date));",
	
		// 試験（見積）番号管理テーブル
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_number (" 
			+ "quote_date DATE,"				// 試験（見積）登録日付
			+ "quote_count INT4"				// 試験（見積）登録数
			+ ", PRIMARY KEY(quote_date));",

		// 試験（見積）明細番号管理テーブル
		"CREATE TABLE IF NOT EXISTS drc_sch.quote_detail_number (" 
			+ "quote_no VARCHAR(9),"			// 試験（見積）番号（yymmdd###)
			+ "quote_detail_count INT4,"		// 試験（見積）明細登録数
			+ "entry_no VARCHAR(10)" 
			+ ", PRIMARY KEY(entry_no));",

		// ガントチャート作業項目テーブル
		"CREATE TABLE IF NOT EXISTS drc_sch.workitem_schedule (" 
			+ "work_item_id SERIAL,"			// 作業項目ID
			+ "entry_no VARCHAR(10),"			// 案件番号（yymmdd-###)
			+ "work_title VARCHAR(128),"		// 作業項目名称
			+ "start_date DATE,"				// 作業開始予定日
			+ "end_date DATE,"					// 作業終了予定日
			+ "start_date_result DATE,"			// 作業開始日
 			+ "end_date_result DATE,"			// 作業終了日
			+ "priority_item_id INT4,"			// 先行（優先）項目
			+ "subsequent_item_id INT4,"		// 後続項目
			+ "progress INT4,"					// 作業進捗度
			+ "item_type varchar(1) default 0,"	// 作業項目タイプ
			+ "delete_check VARCHAR(1),"		// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY(work_item_id, entry_no));",

		// 試験スケジュールデータ
		"CREATE TABLE IF NOT EXISTS drc_sch.test_schedule (" 
			+ "schedule_id SERIAL,"				// スケジュールID
			+ "entry_no VARCHAR(10) NOT NULL,"	// 案件No
			+ "quote_no VARCHAR(3),"			// 見積番号
			+ "quote_detail_no VARCHAR(3),"		// 明細番号
			+ "start_date DATE,"				// 開始日付
			+ "end_date DATE,"					// 開始日付
			+ "start_time TIME,"				// 開始時間
			+ "end_time TIME,"					// 開始時間
			+ "am_pm VARCHAR(2),"				// 午前午後
			+ "patch_no INT2,"					// 検体番号(1～30)
			+ "delete_check VARCHAR(1),"		// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY(schedule_id,entry_no, start_date));",

		// 社員マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.user_list (" 
			+ "uid VARCHAR(32) NOT NULL," 
			+ "password VARCHAR(32),"
			+ "name VARCHAR(128)," 
			+ "u_no VARCHAR(32)," 
			+ "start_date DATE," 
			+ "base_cd VARCHAR(2)," 
			+ "division VARCHAR(2)," 
			+ "telno VARCHAR(16)," 
			+ "title VARCHAR(128)," 
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY (uid));",

		// 権限マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.role_master (" 
			+ "rid VARCHAR(32) NOT NULL," 
			+ "name VARCHAR(128)," 
			+ "memo VARCHAR(128)," 
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY (rid));",

		// 権限設定リスト
		"CREATE TABLE IF NOT EXISTS drc_sch.role_list (" 
			+ "rid VARCHAR(32) NOT NULL," 
			+ "uid VARCHAR(32)," 
			+ "memo VARCHAR(128)," 
			+ "delete_check INT2," 
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32)," // 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY (rid));",

		// 得意先リスト
		"CREATE TABLE IF NOT EXISTS drc_sch.client_list (" 
			+ "client_cd VARCHAR(8) NOT NULL,"	// 得意先コード 
			+ "name_1 VARCHAR(128),"			// 得意先名１
			+ "name_2 VARCHAR(128),"			// 得意先名２
			+ "kana VARCHAR(128),"				// カナ
			+ "email VARCHAR(128),"				// メールアドレス 
			+ "zipcode VARCHAR(16),"			// 郵便番号
			+ "address_1 VARCHAR(255),"			// 住所１
			+ "address_2 VARCHAR(255),"			// 住所２
 			+ "tel_no VARCHAR(16),"				// 電話番号
 			+ "fax_no VARCHAR(16),"				// FAX番号
			+ "memo VARCHAR(128),"				// メモ
			+ "delete_check INT2 DEFAULT 0,"	// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32)"							// 更新者ID
			+ ", PRIMARY KEY (client_cd));",

		// 得意先部署マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.client_division_list (" 
			+ "client_cd VARCHAR(8) NOT NULL,"	// 得意先コード 
			+ "division_cd VARCHAR(8) NOT NULL," // 部署コード 
			+ "name VARCHAR(512),"				// 部署名
			+ "kana VARCHAR(1024),"				// カナ
			+ "email VARCHAR(128),"				// メールアドレス 
			+ "zipcode VARCHAR(16),"			// 郵便番号
			+ "address_1 VARCHAR(255),"			// 住所１
			+ "address_2 VARCHAR(255),"			// 住所２
 			+ "tel_no VARCHAR(16),"				// 電話番号
 			+ "fax_no VARCHAR(16),"				// FAX番号
 			+ "billing_limit DATE,"				// 請求締日
 			+ "payment_date DATE,"				// 支払日
			+ "holiday_support VARCHAR(128),"	// 休日対応
			+ "memo VARCHAR(128),"				// メモ
			+ "delete_check INT2 DEFAULT 0,"	// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32)"							// 更新者ID
			+ ", PRIMARY KEY (client_cd,division_cd));",

		// 得意先担当者マスタ
		"CREATE TABLE IF NOT EXISTS drc_sch.client_person_list (" 
			+ "client_cd VARCHAR(8) NOT NULL,"		// 得意先コード 
			+ "division_cd VARCHAR(8) NOT NULL,"	// 部署コード 
			+ "person_id VARCHAR(32),"				// 担当者ID
			+ "name VARCHAR(512),"					// 担当者名
			+ "kana VARCHAR(1024),"					// カナ
			+ "compellation VARCHAR(16),"			// 敬称
			+ "title VARCHAR(16),"					// 役職名
			+ "email VARCHAR(128),"					// メールアドレス 
			+ "memo VARCHAR(128),"					// メモ
			+ "delete_check INT2 DEFAULT 0,"		// 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32)"							// 更新者ID
			+ ", PRIMARY KEY (client_cd,division_cd,person_id));",

		// 作業項目テンプレートテーブル
		"CREATE TABLE IF NOT EXISTS drc_sch.workitem_template (" 
			+ "template_id SERIAL,"			// テンプレートID
			+ "template_name VARCHAR(256),"	// テンプレート名
			+ "work_title VARCHAR(128),"	// 項目名称
			+ "start_date DATE,"			// 作業開始予定日
			+ "end_date DATE,"				// 作業終了予定日
			+ "priority_item_id INT4,"		// 先行（優先）項目
			+ "item_type VARCHAR(1) default 0," // 種別 0:作業項目、1:マイルストーン
			+ "delete_check VARCHAR(1)," // 削除フラグ
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP," // 作成日
			+ "created_id VARCHAR(32),"		// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP," // 更新日
			+ "updated_id VARCHAR(32)" // 更新者ID
			+ ", PRIMARY KEY(template_id,template_name));",

		// 動作設定情報
		"CREATE TABLE IF NOT EXISTS drc_sch.configuration (" 
			+ "id SERIAL,"					// ID
			+ "drc_name VARCHAR(256),"		// 自社会社名
			+ "drc_address1 VARCHAR(128),"	// 住所１
			+ "drc_address2 VARCHAR(128),"	// 住所２
			+ "drc_telno VARCHAR(16),"		// 電話番号
			+ "drc_faxno VARCHAR(16),"		// FAX番号
			+ "consumption_tax INT2,"		// 消費税率
			+ "created TIMESTAMP  default CURRENT_TIMESTAMP,"	// 作成日
			+ "created_id VARCHAR(32),"							// 作成者ID
			+ "updated TIMESTAMP  default CURRENT_TIMESTAMP,"	// 更新日
			+ "updated_id VARCHAR(32)"							// 更新者ID
			+ ", PRIMARY KEY(id));"
  	];
	pg.connect(connectionString, function (err, connection) {
		for (var i = 0; i < sql.length; i++) {
			var query = connection.query(sql[i]);
			query.on('end', function (row, err) {
			});
			query.on('error', function (error) {
				console.log(error);
			});
		}
		//コネクション解放
		res.render('portal', { title: 'DRC 試験スケジュール管理' });
	});
};
