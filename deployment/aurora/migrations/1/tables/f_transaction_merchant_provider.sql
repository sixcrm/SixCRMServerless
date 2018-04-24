CREATE TABLE IF NOT EXISTS analytics.f_transaction_merchant_provider (
    transaction_id VARCHAR(36) NOT NULL,
    merchant_provider_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
		monthly_cap NUMERIC(8, 2) NOT NULL,
    CONSTRAINT pk_f_transaction_mid PRIMARY KEY (transaction_id),
    CONSTRAINT fk_f_transaction_mid_f_transaction FOREIGN KEY (transaction_id, merchant_provider_id) REFERENCES analytics.f_transaction (transaction_id, merchant_provider_id)
);

