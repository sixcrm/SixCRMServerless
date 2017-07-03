SELECT merchant_provider,
       max(num_transactions_today) num_transactions_today,
       max(num_transactions_week) num_transactions_week,
       max(num_transactions_month) num_transactions_month,
       max(amount_transactions_today) amount_transactions_today,
       max(amount_transactions_week) amount_transactions_week,
       max(amount_transactions_month) amount_transactions_month
FROM
  (SELECT merchant_provider,
          SUM(CASE
                  WHEN date_trunc('day', getdate()) = date_trunc('day', datetime) THEN 1
                  ELSE 0
              END ) num_transactions_today,
          SUM(CASE
                  WHEN date_trunc('week', getdate()) = date_trunc('week', datetime) THEN 1
                  ELSE 0
              END ) num_transactions_week,
          SUM(CASE
                  WHEN date_trunc('month', getdate()) = date_trunc('month', datetime) THEN 1
                  ELSE 0
              END ) num_transactions_month,
          SUM(CASE
                  WHEN date_trunc('day', getdate()) = date_trunc('day', datetime) THEN amount
                  ELSE 0
              END ) amount_transactions_today,
          SUM(CASE
                  WHEN date_trunc('week', getdate()) = date_trunc('week', datetime) THEN amount
                  ELSE 0
              END ) amount_transactions_week,
          SUM(CASE
                  WHEN date_trunc('month', getdate()) = date_trunc('month', datetime) THEN amount
                  ELSE 0
              END ) amount_transactions_month
   FROM f_transactions
   WHERE 1
     {{filter}}
     AND datetime BETWEEN add_months(getdate(),-1) AND getdate()
   GROUP BY merchant_provider
   {{union}}
 )
GROUP BY merchant_provider
ORDER BY {{metric}} {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
