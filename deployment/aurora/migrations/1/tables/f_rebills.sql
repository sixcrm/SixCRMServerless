CREATE TABLE IF NOT EXISTS analytics.f_rebills (
    id_rebill VARCHAR(36) PRIMARY KEY,
    current_queuename VARCHAR(20) NOT NULL,
    previous_queuename VARCHAR(20) NOT NULL,
    account VARCHAR(36) NOT NULL,
    datetime TIMESTAMP,
    amount NUMERIC(8, 2),
    UNIQUE (account,
      id_rebill,
      datetime)
);