/*
 24.04.2017 A.Zelen Results dimensional table
 Set distribution style to all, recommended for dimensional tables

TABLE_VERSION 1

*/
/*drop table d_processor_result;*/

CREATE TABLE IF NOT EXISTS d_processor_result
(
  processor_result varchar(16)
) DISTSTYLE all;

COMMENT ON TABLE d_processor_result IS ' 24.04.2017 A.Zelen Results dimensional table Set distribution style to all, recommended for dimensional tables';

/*insert into d_processor_result(processor_result) values('success');
insert into d_processor_result(processor_result) values('decline');
insert into d_processor_result(processor_result) values('error');
*/
