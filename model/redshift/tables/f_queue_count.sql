/*
11.10.2017 A.Zelen Fact table containing queue counts

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS f_queue_count;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_queue_count';

INSERT INTO sys_sixcrm.sys_table_version
   SELECT 'f_queue_count',1,getdate();

CREATE TABLE f_queue_count (
  queue    VARCHAR(100) PRIMARY KEY NOT NULL ENCODE ZSTD,
  account  VARCHAR(36)              NOT NULL ENCODE RUNLENGTH,
  count    INTEGER,
  datetime TIMESTAMP ENCODE DELTA
)
  INTERLEAVED SORTKEY (account, datetime);
