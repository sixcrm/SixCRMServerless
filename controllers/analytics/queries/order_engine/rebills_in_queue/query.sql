SELECT
  id_rebill,
  sum(amount) AS amount
FROM f_rebills
WHERE 1=1
  {{filter}}
  AND ( current_queuename = {{queuename}} OR previous_queuename = {{queuename}} )
GROUP BY id_rebill
HAVING COUNT(*) = 1 AND max(current_queuename) = {{queuename}}
ORDER BY AMOUNT {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
