CREATE TABLE IF NOT EXISTS analytics.f_transaction_product (
    transaction_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    name VARCHAR (255) NOT NULL,
    amount NUMERIC(12, 2),
    quantity INT,
    sku VARCHAR(100),
    fulfillment_provider VARCHAR(36),
    CONSTRAINT pk_f_transaction_product PRIMARY KEY (transaction_id,
      product_id),
    CONSTRAINT fk_f_transaction_product_transaction FOREIGN KEY (transaction_id) REFERENCES analytics.f_transaction (id)
);
