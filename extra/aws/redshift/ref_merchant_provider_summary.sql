/* Refactored merchant provider query */

/* Materialize MERCHANT providers for query */

DROP TABLE IF EXISTS tmp_d_merchant_provider_summary;
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_d_merchant_provider_summary
(
  merchant_provider VARCHAR(128),
  dummpy            NUMERIC DEFAULT 0
) DISTSTYLE ALL;

INSERT INTO tmp_d_merchant_provider_summary VALUES
  ('15224d91-ff5d-4282-aa2c-783ad2fb925b'),
  ('8d1e896f-c50d-4a6b-8c84-d5661c16a046'),
  ('6c40761d-8919-4ad6-884d-6a46a776cfb9'),
  ('79189a4a-ed89-4742-aa96-afcd7f6c08fb');

/* Main query */

SELECT
  merchant_provider,
  max(num_transactions_today)    num_transactions_today,
  max(num_transactions_week)     num_transactions_week,
  max(num_transactions_month)    num_transactions_month,
  max(amount_transactions_today) amount_transactions_today,
  max(amount_transactions_week)  amount_transactions_week,
  max(amount_transactions_month) amount_transactions_month
FROM
  (SELECT
     merchant_provider,
     SUM(CASE
         WHEN date_trunc('day', getdate()) = date_trunc('day', datetime)
           THEN 1
         ELSE 0
         END) num_transactions_today,
     SUM(CASE
         WHEN date_trunc('week', getdate()) = date_trunc('week', datetime)
           THEN 1
         ELSE 0
         END) num_transactions_week,
     SUM(CASE
         WHEN date_trunc('month', getdate()) = date_trunc('month', datetime)
           THEN 1
         ELSE 0
         END) num_transactions_month,
     SUM(CASE
         WHEN date_trunc('day', getdate()) = date_trunc('day', datetime)
           THEN amount
         ELSE 0
         END) amount_transactions_today,
     SUM(CASE
         WHEN date_trunc('week', getdate()) = date_trunc('week', datetime)
           THEN amount
         ELSE 0
         END) amount_transactions_week,
     SUM(CASE
         WHEN date_trunc('month', getdate()) = date_trunc('month', datetime)
           THEN amount
         ELSE 0
         END) amount_transactions_month
   FROM f_transactions
   WHERE 1
         AND merchant_provider IN (('15224d91-ff5d-4282-aa2c-783ad2fb925b'),
                                   ('8d1e896f-c50d-4a6b-8c84-d5661c16a046'),
                                   ('6c40761d-8919-4ad6-884d-6a46a776cfb9'),
                                   ('79189a4a-ed89-4742-aa96-afcd7f6c08fb'))
         AND datetime BETWEEN add_months(getdate(), -1) AND getdate()
   GROUP BY merchant_provider
   UNION
   SELECT
     merchant_provider,
     0 num_transactions_today,
     0 num_transactions_week,
     0 num_transactions_month,
     0 amount_transactions_today,
     0 amount_transactions_week,
     0 amount_transactions_month
   FROM tmp_d_merchant_provider_summary
  )
GROUP BY merchant_provider;
--ORDER BY {{order_field}} {{order}}--
--LIMIT {{limit}}
--OFFSET {{offset}};
