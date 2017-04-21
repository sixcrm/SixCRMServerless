/* 
21.04.2017 A.Zelen Initial table definition

*/

drop table f_transactions;

create table f_transactions(
id varchar(36) not null primary key, /* It is no enforced but it is nice to have */
stamp timestamp not null,
customer varchar(36) not null,
creditcard varchar(36) not null,
merchprocessor varchar(36) not null,
campaign varchar(36) not null,
affiliate varchar(36),
amount decimal(8,2) not null,
result varchar(16) not null,
product varchar(36) not null, /* Not sure about this one, ignore it for now*/
account varchar(36) not null,
type varchar(6) not null,
schedule varchar(36))
distkey(account)
INTERLEAVED sortkey(customer,stamp);

