/*
 24.04.2017 A.Zelen Results dimensional table
 Set distribution style to all, recommended for dimensional tables
 
*/

create table d_results(
result varchar(16)
) DISTSTYLE all;

COMMENT ON TABLE d_results IS ' 24.04.2017 A.Zelen Results dimensional table Set distribution style to all, recommended for dimensional tables';

insert into d_results(result) values('success');
insert into d_results(result) values('decline');
insert into d_results(result) values('error');

