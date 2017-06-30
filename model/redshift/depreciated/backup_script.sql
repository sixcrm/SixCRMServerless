create table backup.bkp_f_transactions
  as
select * from f_transactions;

create table backup.bkp_d_datetime
  as
select * from d_datetime;

create table backup.bkp_d_event_type
as
select * from d_event_type;

create table backup.bkp_d_merchant_provider
  as
select * from d_merchant_provider;

create table backup.bkp_d_processor_result
  as
select * from d_processor_result;

create table backup.bkp_f_activity
  as
select * from f_activity;

create table backup.bkp_f_events
  as
select * from f_events;


