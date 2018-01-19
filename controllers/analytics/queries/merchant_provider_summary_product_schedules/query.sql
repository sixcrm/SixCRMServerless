SELECT t.merchant_provider,
       max(num_transactions_today) num_transactions_today,
       max(num_transactions_week) num_transactions_week,
       max(num_transactions_month) num_transactions_month,
       max(amount_transactions_today) amount_transactions_today,
       max(amount_transactions_week) amount_transactions_week,
       max(amount_transactions_month) amount_transactions_month
FROM
  (SELECT merchant_provider,
          SUM(CASE
                  WHEN date_trunc('day', CURRENT_TIMESTAMP) = date_trunc('day', datetime) THEN 1
                  ELSE 0
              END ) num_transactions_today,
          SUM(CASE
                  WHEN date_trunc('week', CURRENT_TIMESTAMP) = date_trunc('week', datetime) THEN 1
                  ELSE 0
              END ) num_transactions_week,
          SUM(CASE
                  WHEN date_trunc('month', CURRENT_TIMESTAMP) = date_trunc('month', datetime) THEN 1
                  ELSE 0
              END ) num_transactions_month,
          SUM(CASE
                  WHEN date_trunc('day', CURRENT_TIMESTAMP) = date_trunc('day', datetime) THEN amount
                  ELSE 0
              END ) amount_transactions_today,
          SUM(CASE
                  WHEN date_trunc('week', CURRENT_TIMESTAMP) = date_trunc('week', datetime) THEN amount
                  ELSE 0
              END ) amount_transactions_week,
          SUM(CASE
                  WHEN date_trunc('month', CURRENT_TIMESTAMP) = date_trunc('month', datetime) THEN amount
                  ELSE 0
              END ) amount_transactions_month
   FROM f_product_schedules
   WHERE 1=1
     {{filter}}
     AND datetime BETWEEN CURRENT_TIMESTAMP - interval '30 days' AND CURRENT_TIMESTAMP
   GROUP BY merchant_provider
   {{union}}
 ) t
GROUP BY merchant_provider
ORDER BY {{order_field}} {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
