SELECT
  processor_result,
  SUM(amount) AS sum_amount,
  COUNT(*) AS transaction_count,
  DATE_TRUNC('{{period}}', datetime) AS {{period}}
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND   datetime BETWEEN DATE '{{start}}' AND DATE '{{end}}'
GROUP BY processor_result,
  DATE_TRUNC('{{period}}',datetime)
ORDER BY {{period}}
