/*
21.04.2017 A.Zelen Initial table definition

*/

DROP TABLE f_transactions;

CREATE TABLE f_transactions
(
  id                  VARCHAR(128)   NOT NULL PRIMARY KEY encode ZSTD,
  datetime            TIMESTAMP     NOT NULL encode ZSTD,
  customer            VARCHAR(128)   NOT NULL encode ZSTD,
  creditcard          VARCHAR(128)   NOT NULL encode ZSTD,
  merchant_provider   VARCHAR(128)   NOT NULL encode ZSTD,
  campaign            VARCHAR(128)   NOT NULL encode ZSTD,
  affiliate           VARCHAR(128) encode ZSTD,
  amount              DECIMAL(8, 2) NOT NULL encode ZSTD,
  processor_result    VARCHAR(16)   NOT NULL encode ZSTD,
  account             VARCHAR(128)   NOT NULL encode ZSTD,
  transaction_type    VARCHAR(6)    NOT NULL encode ZSTD,
  transaction_subtype VARCHAR(6)    NOT NULL encode ZSTD,
  product_schedule    VARCHAR(36) encode ZSTD,
  subaffiliate_1      VARCHAR(128) encode ZSTD,
  subaffiliate_2      VARCHAR(128) encode ZSTD,
  subaffiliate_3      VARCHAR(128) encode ZSTD,
  subaffiliate_4      VARCHAR(128) encode ZSTD,
  subaffiliate_5      VARCHAR(128) encode ZSTD
)
  distkey (account) INTERLEAVED sortkey (customer, datetime
);

