/*
14.05.2017 A.Zelen Activity Fact table, anticipating accumulating fact table type
02.06.2017 A.Zelen Changing the activity table
07.06.2017 A.Zelen Added account
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE f_activity;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_activity';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'f_activity',1,getdate();


CREATE TABLE IF NOT EXISTS f_activity
(
  id                   VARCHAR(36)  NOT NULL,
  datetime             TIMESTAMP    NOT NULL,
  account              VARCHAR(36),
  actor                VARCHAR(100) NOT NULL,
  actor_type           VARCHAR(20),
  action               VARCHAR(20),
  acted_upon           VARCHAR(100),
  acted_upon_type      VARCHAR(20),
  associated_with      VARCHAR(100),
  associated_with_type VARCHAR(20)
) SORTKEY (datetime);


COMMENT ON TABLE f_activity IS 'Fact table build around activities of actors';
