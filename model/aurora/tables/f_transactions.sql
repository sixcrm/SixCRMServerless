/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS f_transactions;


CREATE TABLE IF NOT EXISTS f_transactions
(
    id                  VARCHAR(36)  NOT NULL PRIMARY KEY,
    datetime            TIMESTAMP     NOT NULL,
    customer            VARCHAR(36)  NOT NULL,
    creditcard          VARCHAR(36)  NOT NULL,
    merchant_provider   VARCHAR(36)  NOT NULL,
    campaign            VARCHAR(36)  NOT NULL,
    affiliate           VARCHAR(36),
    amount              NUMERIC(8, 2) NOT NULL,
    processor_result    VARCHAR(16)   NOT NULL,
    account             VARCHAR(36)  NOT NULL,
    type    ENUM('click', 'lead', 'order', 'upsell', 'confirm'),
    subtype VARCHAR(10)   NOT NULL,
    product_schedule    VARCHAR(36) ,
    subaffiliate_1      VARCHAR(36),
    subaffiliate_2      VARCHAR(36),
    subaffiliate_3      VARCHAR(36),
    subaffiliate_4      VARCHAR(36),
    subaffiliate_5      VARCHAR(36),
    prepaid             TINYINT(1)     ,
    result              VARCHAR(16),
    associated_transaction VARCHAR(36),
    UNIQUE (account, datetime)
  );
