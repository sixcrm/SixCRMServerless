/*
21.04.2017 A.Zelen Initial table definition

*/

DROP TABLE transactions;

CREATE TABLE f_transactions
(
  id                  VARCHAR(36)   NOT NULL PRIMARY KEY,
  datetime            TIMESTAMP     NOT NULL,
  customer            VARCHAR(36)   NOT NULL,
  creditcard          VARCHAR(36)   NOT NULL,
  merchant_processor  VARCHAR(36)   NOT NULL,
  campaign            VARCHAR(36)   NOT NULL,
  affiliate           VARCHAR(36),
  amount              DECIMAL(8, 2) NOT NULL,
  processor_result    VARCHAR(16)   NOT NULL,
  account             VARCHAR(36)   NOT NULL,
  transaction_type    VARCHAR(6)    NOT NULL,
  transaction_subtype VARCHAR(6)    NOT NULL,
  product_schedule    VARCHAR(36),
  subaffiliate_1      VARCHAR(128),
  subaffiliate_2      VARCHAR(128),
  subaffiliate_3      VARCHAR(128),
  subaffiliate_4      VARCHAR(128),
  subaffiliate_5      VARCHAR(128)
)
  distkey (account) INTERLEAVED sortkey (customer, datetime
);
