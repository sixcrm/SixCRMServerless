SELECT *
FROM
  (SELECT
     campaign,
     coalesce(sum(amount), 0) AS campaign_amount
   FROM f_transactions
   WHERE 1
         {{filter}}
         AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY campaign)
ORDER BY campaign_amount {{order}}
LIMIT {{limit}};
