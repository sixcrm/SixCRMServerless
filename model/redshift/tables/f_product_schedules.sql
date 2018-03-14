/*
05.07.2017 A.Zelen Logic from idempotent versioning
15.01.2017 A.Zelen Changing product schedule fact table to reflect transactions for faster query

TABLE_VERSION 3
*/

DROP TABLE IF EXISTS f_product_schedules;

CREATE TABLE IF NOT EXISTS f_product_schedules
(
  transactions_id  VARCHAR(36) ENCODE ZSTD,
  product_schedule VARCHAR(36) NOT NULL ENCODE ZSTD,
  datetime         TIMESTAMP   NOT NULL ENCODE DELTA,
  customer            VARCHAR(36)  NOT NULL ENCODE ZSTD,
  creditcard          VARCHAR(36)  NOT NULL ENCODE ZSTD,
  merchant_provider   VARCHAR(36)  NOT NULL ENCODE ZSTD,
  campaign            VARCHAR(36)  NOT NULL ENCODE ZSTD,
  affiliate           VARCHAR(36) ENCODE ZSTD,
  amount              NUMERIC(8, 2) NOT NULL,
  processor_result    VARCHAR(16)   NOT NULL ENCODE ZSTD,
  account             VARCHAR(36)  NOT NULL ENCODE RUNLENGTH,
  type    VARCHAR(10)   NOT NULL ENCODE TEXT255,
  subtype VARCHAR(10)   NOT NULL ENCODE TEXT255,
  subaffiliate_1      VARCHAR(36) ENCODE ZSTD,
  subaffiliate_2      VARCHAR(36) ENCODE ZSTD,
  subaffiliate_3      VARCHAR(36) ENCODE ZSTD,
  subaffiliate_4      VARCHAR(36) ENCODE ZSTD,
  subaffiliate_5      VARCHAR(36) ENCODE ZSTD,
  prepaid             BOOLEAN      ENCODE ZSTD,
  result              VARCHAR(16) ENCODE ZSTD,
  associated_transaction VARCHAR(36) ENCODE ZSTD
)
DISTSTYLE KEY DISTKEY (transactions_id);

COMMENT ON TABLE f_product_schedules IS 'Fact table build on different product schedules in data tied to transactions'
;
