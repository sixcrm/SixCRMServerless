/*
30.11.2017 A.Zelen Fact table containing queue counts
08.12.2017 A.Zelen Changed sortkey

TABLE_VERSION 2
*/

DROP TABLE IF EXISTS f_rebills;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_rebills';

INSERT INTO sys_sixcrm.sys_table_version
   SELECT 'f_rebills',2,getdate();

CREATE TABLE f_rebills (
  id_rebill VARCHAR(36),
  current_queuename    VARCHAR(20) NOT NULL ENCODE ZSTD,
  previous_queuename    VARCHAR(20) NOT NULL ENCODE ZSTD,
  account  VARCHAR(36) NOT NULL ENCODE RUNLENGTH,
  datetime TIMESTAMP ENCODE DELTA
) INTERLEAVED SORTKEY (account, id_rebill,datetime);
