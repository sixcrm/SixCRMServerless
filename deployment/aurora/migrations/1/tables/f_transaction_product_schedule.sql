CREATE TABLE IF NOT EXISTS analytics.f_transaction_product_schedule (
    transaction_id VARCHAR(36) NOT NULL,
    product_schedule_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    CONSTRAINT pk_f_transaction_product_schedule PRIMARY KEY (transaction_id, product_schedule_id, product_id),
    CONSTRAINT fk_f_transaction_product_schedule_f_transaction FOREIGN KEY (transaction_id) REFERENCES analytics.f_transaction (id),
		CONSTRAINT fk_f_transaction_product_schedule_f_transaction_product FOREIGN KEY (transaction_id, product_id) REFERENCES analytics.f_transaction_product (transaction_id, product_id)
);

