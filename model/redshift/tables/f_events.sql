/*
02.05.2017 A.Zelen Initial table definition
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS f_events;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_events';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_events',1,getdate();


CREATE TABLE IF NOT EXISTS f_events
(
  session          VARCHAR(128) NOT NULL encode ZSTD,
  type             VARCHAR(10) NOT NULL encode ZSTD,
  datetime         TIMESTAMP    NOT NULL encode ZSTD,
  account          VARCHAR(36)  NOT NULL encode ZSTD,
  campaign         VARCHAR(36)  NOT NULL encode ZSTD,
  product_schedule VARCHAR(36) encode ZSTD,
  affiliate        VARCHAR(36) encode ZSTD,
  subaffiliate_1   VARCHAR(128) encode ZSTD,
  subaffiliate_2   VARCHAR(128) encode ZSTD,
  subaffiliate_3   VARCHAR(128) encode ZSTD,
  subaffiliate_4   VARCHAR(128) encode ZSTD,
  subaffiliate_5   VARCHAR(128) encode ZSTD
) SORTKEY (account,datetime);

COMMENT ON TABLE d_datetime IS 'Fact table with information about events';
