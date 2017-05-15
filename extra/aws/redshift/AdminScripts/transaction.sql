create table f_transactions
(
	id varchar(36) not null
		constraint f_transactions_pkey
			primary key,
	datetime timestamp not null,
	customer varchar(36) not null,
	creditcard varchar(36) not null,
	merchant_provider varchar(36) not null,
	campaign varchar(36) not null,
	affiliate varchar(36),
	amount numeric(8,2) not null,
	processor_result varchar(16) not null,
	account varchar(36) not null,
	transaction_type varchar(6) not null,
	product_schedule varchar(36),
	subaffiliate_1 varchar(128),
	subaffiliate_2 varchar(128),
	subaffiliate_3 varchar(128),
	subaffiliate_4 varchar(128),
	subaffiliate_5 varchar(128),
	transaction_subtype varchar(6)
)
;

