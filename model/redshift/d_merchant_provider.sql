/*
14.06.2017 A.Zelen Merchant provider types. Dimensional table is needed for faster upload.
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS d_merchant_provider;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='d_merchant_provider';

INSERT INTO sys_sixcrm.sys_table_version
    SELECT 'd_merchant_provider',1,getdate();


CREATE TABLE IF NOT EXISTS d_merchant_provider
(
  merchant_provider VARCHAR(36),
  activity_flag     VARCHAR(8)
) DISTSTYLE ALL;

COMMENT ON COLUMN d_merchant_provider.activity_flag IS 'Active, inactive';
COMMENT ON TABLE d_merchant_provider IS 'Dimensional table of all merchant providers';
