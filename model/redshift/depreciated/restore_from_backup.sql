insert into f_transactions
select * from backup.bkp_f_transactions;

insert into d_datetime
select * from backup.bkp_d_datetime ;

/*insert into d_event_type
select * from backup.bkp_d_event_type;*/

insert into d_merchant_provider
select * from backup.bkp_d_merchant_provider;

/*insert into d_processor_result
select * from backup.bkp_d_processor_result;*/

insert into f_activity
select * from backup.bkp_f_activity;

insert into f_events
select * from backup.bkp_f_events;



select count(*) from f_transactions
union
select count(*) from d_datetime
union
select count(*) from d_event_type
union
select count(*) from d_merchant_provider
union
select count(*) from d_processor_result
union
select count(*) from f_activity
union
select count(*) from f_events;
