SELECT
  DATE_TRUNC('day',datetime) AS datetime,
  sum(queue) AS count
FROM
  (
SELECT
  datetime,
  case when current_queuename = {{queuename}} then  1 else 0 end queue,
  case when current_queuename = lead(previous_queuename,1,null) over (partition by id_rebill order by datetime) then 1 else 0 end queue_moved_on
FROM
  f_rebills
WHERE 1=1
  {{filter}}
  AND (current_queuename = {{queuename}}  OR previous_queuename = {{queuename}} )
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
) ft
WHERE 1=1
  AND queue = 1 AND queue_moved_on != 1
GROUP BY DATE_TRUNC('{{period}}',DATETIME)
ORDER BY DATE_TRUNC('{{period}}',DATETIME)
{{order}}
LIMIT {{limit}}
OFFSET {{offset}};
