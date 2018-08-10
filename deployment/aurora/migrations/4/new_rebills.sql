DROP TABLE IF EXISTS analytics.f_rebill;

CREATE TABLE analytics.f_rebill (
    id VARCHAR(36) NOT NULL,
	alias VARCHAR(20) NOT NULL,
    datetime TIMESTAMP NOT NULL,
	amount NUMERIC(12, 2) NOT NULL,
	item_count INT NOT NULL,
	"type" VARCHAR(25),
	campaign_id VARCHAR(36),
	campaign_name VARCHAR(255),
	customer_id VARCHAR(36),
	customer_name VARCHAR(255),
    CONSTRAINT pk_f_rebill PRIMARY KEY (id)
);

CREATE TABLE analytics.f_rebill_return (
	rebill_id VARCHAR(36) NOT NULL,
	datetime TIMESTAMP NOT NULL,
	item_count INT NOT NULL,
	CONSTRAINT pk_f_return PRIMARY KEY (rebill_id, datetime),
	CONSTRAINT fk_return_rebill FOREIGN KEY (rebill_id) REFERENCES analytics.f_rebill (id)
)
