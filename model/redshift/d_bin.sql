/*
27.06.2017 A.Zelen Date dimensional table.Set distribution style to all, recommended for dimensional table
05.07.2017 A.Zelen Logic from idempotent versioning
// TABLE_VERSION 1

DROP TABLE d_event_type;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='d_event_type';

INSERT INTO sys_sixcrm.sys_table_version
   SELECT 'd_event_type',1,getdate();

*/

CREATE TABLE IF NOT EXISTS d_bin
(
  binnumber    INTEGER      NOT NULL PRIMARY KEY,
  brand        VARCHAR(128) NOT NULL,
  bank         VARCHAR(128) NOT NULL,
  type         VARCHAR(128) ,
  level        VARCHAR(128) ,
  country      VARCHAR(128) NOT NULL,
  info         VARCHAR(128) NOT NULL,
  country_iso  VARCHAR(2) NOT NULL,
  country2_iso VARCHAR(3) NOT NULL,
  country3_iso INTEGER ,
  webpage      VARCHAR(128) ,
  phone        VARCHAR(128)

)
   DISTSTYLE all sortkey (binnumber);

COMMENT ON TABLE d_bin IS 'Bin dimensional table loaded on create';
