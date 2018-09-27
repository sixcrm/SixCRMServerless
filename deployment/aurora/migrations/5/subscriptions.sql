CREATE TABLE analytics.f_subscription (
	id VARCHAR(36) NOT NULL,
	alias VARCHAR(20) NOT NULL,
	datetime TIMESTAMP NOT NULL,
	status VARCHAR(20) NOT NULL,
	amount NUMERIC(12, 2) NOT NULL,
	item_count INT NOT NULL,
	cycle INT NOT NULL,
	interval INT NOT NULL,
	account VARCHAR(36) NOT NULL,
	session VARCHAR(36),
	session_alias VARCHAR(20),
	campaign VARCHAR(36),
	campaign_name VARCHAR(255),
	customer VARCHAR(36),
	customer_name VARCHAR(255),
	CONSTRAINT pk_f_subscription PRIMARY KEY (id)
);
