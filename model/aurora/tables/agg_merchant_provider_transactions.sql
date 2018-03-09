/*
23.02.2017 J.C.Lozano Initial table definition for agg_merchant_provider_transactions @ aurora db
*/

DROP TABLE IF EXISTS aggregation_dm.agg_merchant_provider_transactions;

CREATE TABLE IF NOT EXISTS aggregation_dm.agg_merchant_provider_transactions
(
  merchant_provider VARCHAR(36)  NOT NULL,
  account VARCHAR(36)  NOT NULL,
  datetime DATE   NOT NULL,
  num_transactions_day NUMERIC,
  amount_transactions_day NUMERIC,
    PRIMARY KEY (account, datetime)
  );

COMMENT ON TABLE aggregation_dm.agg_merchant_provider_transactions IS 'Aggregated table for merchant provider transactions on everyday';
