/*
24.04.2017 A.Zelen Date dimensional table.Set distribution style to all, recommended for dimensional table
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS d_datetime;

CREATE TABLE IF NOT EXISTS d_datetime
(
  datetime TIMESTAMP encode zstd
) DISTSTYLE all sortkey (datetime);

COMMENT ON TABLE d_datetime IS 'Date dimensional table distribution style set to all, recommended for dimensional table';
