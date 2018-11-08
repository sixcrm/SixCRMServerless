DROP TABLE IF EXISTS analytics.f_subscription;

CREATE TABLE analytics.f_subscription (
	session_id VARCHAR(36) NOT NULL,
	product_schedule_id VARCHAR(36) NOT NULL,
	session_alias VARCHAR(20) NOT NULL,
	product_schedule_name VARCHAR(255),
	datetime TIMESTAMP NOT NULL,
	status VARCHAR(20) NOT NULL,
	amount NUMERIC(12, 2) NOT NULL,
	item_count INT NOT NULL,
	cycle INT NOT NULL,
	interval VARCHAR(20) NOT NULL,
	account VARCHAR(36) NOT NULL,
	campaign VARCHAR(36),
	campaign_name VARCHAR(255),
	merchant_provider VARCHAR(36),
	merchant_provider_name VARCHAR(255),
	customer VARCHAR(36),
	customer_name VARCHAR(255),
	CONSTRAINT pk_f_subscription PRIMARY KEY (session_id, product_schedule_id)
);
