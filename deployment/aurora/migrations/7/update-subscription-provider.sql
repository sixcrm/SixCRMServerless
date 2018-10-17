ALTER TABLE analytics.f_subscription
	ADD COLUMN product_schedule_name VARCHAR(64),
	ADD COLUMN product_schedule VARCHAR(36),
	ADD COLUMN merchant_provider_name VARCHAR(64),
	ADD COLUMN merchant_provider VARCHAR(36);
