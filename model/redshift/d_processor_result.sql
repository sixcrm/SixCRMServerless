/*
24.04.2017 A.Zelen Results dimensional table Set distribution style to all, recommended for dimensional tables
05.07.2017 A.Zelen Logic from idempotent versioning
// TABLE_VERSION 1

DROP TABLE d_processor_result;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='d_processor_result';

INSERT INTO sys_sixcrm.sys_table_version
    SELECT 'd_processor_result',1,getdate();

*/

CREATE TABLE IF NOT EXISTS d_processor_result
(
  processor_result varchar(16)
) DISTSTYLE all;

COMMENT ON TABLE d_processor_result IS ' 24.04.2017 A.Zelen Results dimensional table Set distribution style to all, recommended for dimensional tables';

/*insert into d_processor_result(processor_result) values('success');
insert into d_processor_result(processor_result) values('decline');
insert into d_processor_result(processor_result) values('error');
*/
