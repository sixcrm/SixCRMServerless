/*
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 2
*/

DROP TABLE IF EXISTS f_product_schedules;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_product_schedules';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_product_schedules',2,getdate();

CREATE TABLE IF NOT EXISTS f_product_schedules
(
  transactions_id  VARCHAR(36) ENCODE ZSTD,
  product_schedule VARCHAR(36) NOT NULL ENCODE ZSTD,
  datetime         TIMESTAMP   NOT NULL ENCODE DELTA
)
DISTSTYLE KEY DISTKEY (transactions_id);

COMMENT ON TABLE f_product_schedules IS 'Child fact table build on different product schedules in data tied to transactions'
;
