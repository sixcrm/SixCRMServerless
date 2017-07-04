/*
 05.05.2017 A.Zelen Results dimensional table
 Set event types for aggregation

TABLE_VERSION 1

*/

/*drop table d_event_type;*/

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
