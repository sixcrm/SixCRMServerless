CREATE TABLE IF NOT EXISTS analytics.f_transaction_chargeback (
    transaction_id VARCHAR(36) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    CONSTRAINT pk_f_transaction_chargeback PRIMARY KEY (transaction_id),
    CONSTRAINT fk_f_transaction_chargeback_transaction FOREIGN KEY (transaction_id) REFERENCES analytics.f_transaction (id)
);
