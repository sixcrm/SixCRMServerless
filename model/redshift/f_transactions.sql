/*
21.04.2017 A.Zelen Initial table definition
03.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE f_transactions;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_transactions';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_transactions',1,getdate();


CREATE TABLE IF NOT EXISTS f_transactions
(
  id                  VARCHAR(128)   NOT NULL PRIMARY KEY encode ZSTD,
  datetime            TIMESTAMP     NOT NULL encode Delta,
  customer            VARCHAR(128)   NOT NULL encode ZSTD,
  creditcard          VARCHAR(128)   NOT NULL encode ZSTD,
  merchant_provider   VARCHAR(128)   NOT NULL encode ZSTD,
  campaign            VARCHAR(128)   NOT NULL encode ZSTD,
  affiliate           VARCHAR(128) encode ZSTD,
  amount              DECIMAL(8, 2) NOT NULL encode raw,
  processor_result    VARCHAR(16)   NOT NULL encode ZSTD,
  account             VARCHAR(128)   NOT NULL encode Runlength,
  transaction_type    VARCHAR(6)    NOT NULL encode Text255,
  transaction_subtype VARCHAR(6)    NOT NULL encode Text255,
  product_schedule    VARCHAR(36) encode ZSTD,
  subaffiliate_1      VARCHAR(128) encode ZSTD,
  subaffiliate_2      VARCHAR(128) encode ZSTD,
  subaffiliate_3      VARCHAR(128) encode ZSTD,
  subaffiliate_4      VARCHAR(128) encode ZSTD,
  subaffiliate_5      VARCHAR(128) encode ZSTD
) INTERLEAVED SORTKEY (account, datetime);

COMMENT ON TABLE f_transactions IS 'Main Fact table with information about transactions';
