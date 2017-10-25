/*
27.06.2017 A.Zelen Date dimensional table.Set distribution style to all, recommended for dimensional table
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS d_bin;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='d_bin';

INSERT INTO sys_sixcrm.sys_table_version
   SELECT 'd_bin',1,getdate();


CREATE TABLE IF NOT EXISTS d_bin
(
  binnumber    INTEGER      NOT NULL PRIMARY KEY encode delta,
  brand        VARCHAR(128) NOT NULL encode zstd,
  bank         VARCHAR(128) NOT NULL encode zstd,
  type         VARCHAR(128) encode zstd,
  level        VARCHAR(128) encode zstd,
  country      VARCHAR(128) NOT NULL encode zstd,
  info         VARCHAR(128) NOT NULL encode zstd,
  country_iso  VARCHAR(2) NOT NULL encode zstd,
  country2_iso VARCHAR(3) NOT NULL encode zstd,
  country3_iso INTEGER encode zstd,
  webpage      VARCHAR(128) encode zstd,
  phone        VARCHAR(128) encode zstd

)
   DISTSTYLE all sortkey (binnumber);

COMMENT ON TABLE d_bin IS 'Bin dimensional table loaded on create';
