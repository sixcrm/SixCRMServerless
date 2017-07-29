/*
24.04.2017 A.Zelen Date dimensional table.Set distribution style to all, recommended for dimensional table
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS d_datetime;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='d_datetime';

INSERT INTO sys_sixcrm.sys_table_version
   SELECT 'd_datetime',1,getdate();


CREATE TABLE IF NOT EXISTS d_datetime
(
  datetime TIMESTAMP encode delta
) DISTSTYLE all sortkey (datetime);

COMMENT ON TABLE d_datetime IS 'Date dimensional table distribution style set to all, recommended for dimensional table';
