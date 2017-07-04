/*
 24.04.2017 A.Zelen Date dimensional table
 Set distribution style to all, recommended for dimensional table

TABLE_VERSION 1

*/

/*drop table d_datetime;*/

CREATE TABLE IF NOT EXISTS d_datetime
(
  datetime TIMESTAMP encode delta
) DISTSTYLE all sortkey (datetime);

COMMENT ON TABLE d_datetime IS 'Date dimensional table distribution style set to all, recommended for dimensional table';
