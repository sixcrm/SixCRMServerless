/*
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS f_product_schedules;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_product_schedules';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_product_schedules',1,getdate();


CREATE TABLE IF NOT EXISTS f_product_schedules
(
  session_id       VARCHAR(36) NOT NULL,
  product_schedule VARCHAR(36) NOT NULL,
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP

) DISTKEY (session_id);

COMMENT ON TABLE f_product_schedules IS 'Child fact table build on different product schedules in data';
