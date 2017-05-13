SELECT
  {{facet}},
  count(*) AS transactions_count,
  sum(count(*))
  OVER ( ) AS all_transactions
FROM f_transactions
WHERE 1
  {{filter}}
AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY {{facet}}
ORDER BY transactions_count {{order}}
LIMIT {{limit}} OFFSET {{offset}}
