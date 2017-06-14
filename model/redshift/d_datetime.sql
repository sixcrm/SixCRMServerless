/*
 24.04.2017 A.Zelen Date dimensional table
 Set distribution style to all, recommended for dimensional table

*/

drop table d_datetime;

create table d_datetime(
  datetime TIMESTAMP encode delta
) DISTSTYLE all sortkey (datetime);

COMMENT ON TABLE d_datetime IS '24.04.2017 A.Zelen Date dimensional table
 Set distribution style to all, recommended for dimensional table';
