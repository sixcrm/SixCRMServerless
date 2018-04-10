CREATE TABLE IF NOT EXISTS analytics.f_rebills (
    id VARCHAR(36) NOT NULL,
    current_queuename VARCHAR(20) NOT NULL,
    previous_queuename VARCHAR(20) NOT NULL,
    account VARCHAR(36) NOT NULL,
    datetime TIMESTAMP,
    amount NUMERIC(8, 2),
    CONSTRAINT pk_f_rebills PRIMARY KEY (id, account, datetime)
);
