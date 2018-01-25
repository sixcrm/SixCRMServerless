SELECT merchant_provider,
          SUM(CASE
                  WHEN date_trunc('day', CURRENT_TIMESTAMP) = date_trunc('day', datetime) THEN num_transactions_day
                  ELSE 0
              END ) num_transactions_today,
          SUM(CASE
                  WHEN date_trunc('week', CURRENT_TIMESTAMP) = date_trunc('week', datetime) THEN num_transactions_day
                  ELSE 0
              END ) num_transactions_week,
          SUM(CASE
                  WHEN date_trunc('month', CURRENT_TIMESTAMP) = date_trunc('month', datetime) THEN num_transactions_day
                  ELSE 0
              END ) num_transactions_month,
          SUM(CASE
                  WHEN date_trunc('day', CURRENT_TIMESTAMP) = date_trunc('day', datetime) THEN amount_transactions_day
                  ELSE 0
              END ) amount_transactions_today,
          SUM(CASE
                  WHEN date_trunc('week', CURRENT_TIMESTAMP) = date_trunc('week', datetime) THEN amount_transactions_day
                  ELSE 0
              END ) amount_transactions_week,
          SUM(CASE
                  WHEN date_trunc('month', CURRENT_TIMESTAMP) = date_trunc('month', datetime) THEN amount_transactions_day
                  ELSE 0
              END ) amount_transactions_month
   FROM agg_merchant_provider_transactions
   WHERE 1=1
     {{filter}}
     AND datetime BETWEEN date_trunc('day', CURRENT_TIMESTAMP) - interval '29 days' AND date_trunc('day', CURRENT_TIMESTAMP) - interval '00:00:00.000001'
GROUP BY merchant_provider;
