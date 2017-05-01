SELECT
  merchant_processor,
  processor_result,
  SUM(amount) AS sum_amount,
  COUNT(*) AS transaction_count,
  DATE_TRUNC('{{period}}', datetime) AS {{period}}
FROM f_transactions
WHERE 1
  {{filter}}
  AND account = '{{account}}'
  AND   datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY
  processor_result,
  merchant_processor,
  DATE_TRUNC('{{period}}',datetime)
ORDER BY
  merchant_processor,
  processor_result,
  {{period}};
