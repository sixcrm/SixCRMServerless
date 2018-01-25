/*
22.01.2017 A.Zelen Initial table definition for agg_merchant_provider_transactions

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS aggregation_dm.agg_merchant_provider_transactions;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='agg_merchant_provider_transactions';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'agg_merchant_provider_transactions',1,getdate();


CREATE TABLE IF NOT EXISTS aggregation_dm.agg_merchant_provider_transactions
(
  merchant_provider VARCHAR(36)  NOT NULL ENCODE ZSTD,
  account VARCHAR(36)  NOT NULL ENCODE RUNLENGTH,
  datetime DATE   NOT NULL ENCODE DELTA,
  num_transactions_day NUMERIC,
  amount_transactions_day NUMERIC
  )
    INTERLEAVED SORTKEY (account, datetime);

COMMENT ON TABLE aggregation_dm.agg_merchant_provider_transactions IS 'Aggregated table for merchant provider transactions on everyday';
