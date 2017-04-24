/*
 24.04.2017 A.Zelen Date dimensional table
 Set distribution style to all, recommended for dimensional table
 
*/

drop table d_dates;
create table d_dates(
  stamp TIMESTAMP
) DISTSTYLE all sortkey (stamp);

COMMENT ON TABLE d_dates IS '24.04.2017 A.Zelen Date dimensional table
 Set distribution style to all, recommended for dimensional table';
