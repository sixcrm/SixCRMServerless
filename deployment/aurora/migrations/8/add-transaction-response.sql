ALTER TABLE analytics.f_transaction
	ADD COLUMN merchant_code VARCHAR(64),
	ADD COLUMN merchant_message VARCHAR(256);
