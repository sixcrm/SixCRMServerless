SELECT
  id,
  sum(amount) AS amount
FROM analytics.f_rebill
WHERE 1=1
  {{filter}}
  AND ( current_queuename = {{queuename}} OR previous_queuename = {{queuename}} )
GROUP BY id
HAVING COUNT(*) = 1 AND max(current_queuename) = {{queuename}}
ORDER BY AMOUNT {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
