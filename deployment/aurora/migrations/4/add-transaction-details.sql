ALTER TABLE analytics.f_transaction
	ADD COLUMN alias VARCHAR(20),
	ADD COLUMN session_alias VARCHAR(20),
	ADD COLUMN rebill VARCHAR(36),
	ADD COLUMN rebill_alias VARCHAR(20),
	ADD COLUMN customer_name VARCHAR(255);
