SELECT
  subaffiliate_1,
  count(*) AS transactions_count,
  sum(count(*))
  OVER ( ) AS all_transactions
FROM f_transactions
WHERE 1
  {{filter}}
AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY subaffiliate_1
