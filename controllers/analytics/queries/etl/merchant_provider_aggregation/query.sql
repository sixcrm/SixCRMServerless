INSERT INTO agg_merchant_provider_transactions
SELECT t.merchant_provider,
       account,
       date_trunc('day',CURRENT_TIMESTAMP) as datetime,
       sum(amount) AS amount_transactions_day,
       count(*) AS num_transactions_day
FROM f_transactions
WHERE 1=1
  AND datetime BETWEEN date_trunc('day',CURRENT_TIMESTAMP) - interval '30 days' AND date_trunc('day',CURRENT_TIMESTAMP) - interval '00:00:00.000001'
GROUP BY merchant_provider,
         account,
         date_trunc('day',CURRENT_TIMESTAMP);
