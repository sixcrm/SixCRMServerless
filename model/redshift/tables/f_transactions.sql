/*
21.04.2017 A.Zelen Initial table definition
03.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 3
*/

DROP TABLE IF EXISTS f_transactions;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_transactions';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_transactions',3,getdate();


CREATE TABLE IF NOT EXISTS f_transactions
(
    id                  VARCHAR(128)  NOT NULL ENCODE ZSTD
      CONSTRAINT f_transactions_pkey
      PRIMARY KEY,
    datetime            TIMESTAMP     NOT NULL ENCODE DELTA,
    customer            VARCHAR(128)  NOT NULL ENCODE ZSTD,
    creditcard          VARCHAR(128)  NOT NULL ENCODE ZSTD,
    merchant_provider   VARCHAR(128)  NOT NULL ENCODE ZSTD,
    campaign            VARCHAR(128)  NOT NULL ENCODE ZSTD,
    affiliate           VARCHAR(128) ENCODE ZSTD,
    amount              NUMERIC(8, 2) NOT NULL,
    processor_result    VARCHAR(16)   NOT NULL ENCODE ZSTD,
    account             VARCHAR(128)  NOT NULL ENCODE RUNLENGTH,
    transaction_type    VARCHAR(10)   NOT NULL ENCODE TEXT255,
    transaction_subtype VARCHAR(10)   NOT NULL ENCODE TEXT255,
    product_schedule    VARCHAR(36)  ENCODE ZSTD,
    subaffiliate_1      VARCHAR(128) ENCODE ZSTD,
    subaffiliate_2      VARCHAR(128) ENCODE ZSTD,
    subaffiliate_3      VARCHAR(128) ENCODE ZSTD,
    subaffiliate_4      VARCHAR(128) ENCODE ZSTD,
    subaffiliate_5      VARCHAR(128) ENCODE ZSTD,
    prepaid             BOOLEAN      ENCODE ZSTD
  )
    INTERLEAVED SORTKEY (account, datetime);

COMMENT ON TABLE f_transactions IS 'Main Fact table with information about transactions';
