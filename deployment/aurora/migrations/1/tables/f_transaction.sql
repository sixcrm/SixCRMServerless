CREATE TABLE IF NOT EXISTS analytics.f_transaction (
    id VARCHAR(36) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    session VARCHAR(36) NOT NULL,
    customer VARCHAR(36) NOT NULL,
    creditcard VARCHAR(36) NOT NULL,
    merchant_provider VARCHAR(36) NOT NULL,
    merchant_provider_name VARCHAR(255) NULL,
    merchant_provider_monthly_cap NUMERIC(12, 2) NULL,
    campaign VARCHAR(36) NOT NULL,
    campaign_name VARCHAR(36) NULL,
    affiliate VARCHAR(36),
    amount NUMERIC(12, 2) NOT NULL,
    processor_result VARCHAR(50) NOT NULL,
    account VARCHAR(36) NOT NULL,
    "type" VARCHAR(25) NOT NULL, -- new, rebill*
    subtype VARCHAR(25) NOT NULL, -- main, upsell*, downsell*
    transaction_type VARCHAR(25) NOT NULL, -- sale, reverse, refund
    subaffiliate_1 VARCHAR(36),
    subaffiliate_2 VARCHAR(36),
    subaffiliate_3 VARCHAR(36),
    subaffiliate_4 VARCHAR(36),
    subaffiliate_5 VARCHAR(36),
    prepaid BOOLEAN,
    result VARCHAR(16),
    associated_transaction VARCHAR(36),
    CONSTRAINT pk_f_transaction PRIMARY KEY (id),
    CONSTRAINT fk_f_transaction_f_session FOREIGN KEY (session) REFERENCES analytics.f_session (id)
);

