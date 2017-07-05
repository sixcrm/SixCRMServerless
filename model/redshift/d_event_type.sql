/*
 05.05.2017 A.Zelen Results dimensional table
 05.07.2017 A.Zelen Logic from idempotent versioning
 // TABLE_VERSION 1

 DROP TABLE d_event_type;

 DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='d_event_type';

 INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'd_event_type',1,getdate();

 */

CREATE TABLE IF NOT EXISTS d_event_type
(
  event_type varchar(16)
) DISTSTYLE all;

COMMENT ON TABLE d_event_type IS ' 24.04.2017 A.Zelen Results dimensional table distribution style set to all, recommended for dimensional tables';

/*
insert into d_event_type(event_type) values('click');
insert into d_event_type(event_type) values('lead');
insert into d_event_type(event_type) values('order');
insert into d_event_type(event_type) values('upsell');
insert into d_event_type(event_type) values('confirm');
/*
