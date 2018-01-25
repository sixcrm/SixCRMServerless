SELECT
  DATE_TRUNC('day',datetime) AS datetime,
  sum(queue) AS count
FROM
  (
SELECT
  datetime,
  case when current_queuename = {{queue_name}} then  1 else 0 end queue,
  case when current_queuename = lead(previous_queuename,1,null) over (partition by id_rebill order by datetime) then 1 else 0 end queue_moved_on
FROM
  f_rebills
WHERE 1=1
  {{filter}}
  AND (current_queuename = {{queue_name}}  OR previous_queuename = {{queue_name}} )
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
) ft
WHERE 1=1
  AND queue = 1 AND queue_moved_on != 1
GROUP BY DATE_TRUNC('{{period}}',DATETIME)
ORDER BY DATE_TRUNC('{{period}}',DATETIME)
{{order}}
LIMIT {{limit}}
OFFSET {{offset}};
