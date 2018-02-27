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
  session          VARCHAR(36) NOT NULL,
  type             VARCHAR(10)  NOT NULL,
  datetime         TIMESTAMP    NOT NULL,
  account          VARCHAR(36)  NOT NULL,
  campaign         VARCHAR(36)  NOT NULL,
  product_schedule VARCHAR(36),
  affiliate        VARCHAR(36),
  subaffiliate_1   VARCHAR(36),
  subaffiliate_2   VARCHAR(36),
  subaffiliate_3   VARCHAR(36),
  subaffiliate_4   VARCHAR(36),
  subaffiliate_5   VARCHAR(36)
) SORTKEY (account,datetime);

COMMENT ON TABLE d_datetime IS 'Fact table with information about events';
