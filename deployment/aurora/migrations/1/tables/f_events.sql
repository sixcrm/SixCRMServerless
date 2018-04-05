CREATE TABLE IF NOT EXISTS analytics.f_events (
    "type" VARCHAR(50) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    account VARCHAR(36) NOT NULL,
    campaign VARCHAR(36) NOT NULL,
    session VARCHAR(36),
    affiliate VARCHAR(36),
    subaffiliate_1 VARCHAR(36),
    subaffiliate_2 VARCHAR(36),
    subaffiliate_3 VARCHAR(36),
    subaffiliate_4 VARCHAR(36),
    subaffiliate_5 VARCHAR(36),
    PRIMARY KEY (account,
      datetime)
);
