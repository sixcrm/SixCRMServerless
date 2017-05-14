SELECT
  {{facet}},
  transactions_count,
  all_transactions_count,
  transactions_amount,
  sum(transactions_amount)
  OVER ()
    AS all_transactions_amount
FROM
  (SELECT
     {{facet}},
     count(*)    AS transactions_count,
     sum(count(*))
     OVER ( )    AS all_transactions_count,
     sum(amount) AS transactions_amount
   FROM f_transactions
   WHERE 1
         {{filter}}
         AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY {{facet}})
ORDER BY transactions_count {{order}}
LIMIT {{limit}} OFFSET {{offset}}
