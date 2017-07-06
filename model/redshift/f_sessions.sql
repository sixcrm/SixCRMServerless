/*
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE f_sessions;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_sessions';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_sessions',1,getdate();


CREATE TABLE IF NOT EXISTS f_sessions
(
  id             VARCHAR(36) NOT NULL,
  account        VARCHAR(36) NOT NULL,
  customer       VARCHAR(36) NOT NULL,
  campaign       VARCHAR(36) NOT NULL,
  completed      VARCHAR(6)  NOT NULL,
  created_at     TIMESTAMP,
  updated_at     TIMESTAMP,
  affiliate      VARCHAR(128),
  subaffiliate_1 VARCHAR(128),
  subaffiliate_2 VARCHAR(128),
  subaffiliate_3 VARCHAR(128),
  subaffiliate_4 VARCHAR(128),
  subaffiliate_5 VARCHAR(128),
  cid            VARCHAR(36)

) SORTKEY (id);

COMMENT ON TABLE f_sessions IS 'Fact table build for session data';
