SELECT
  DATE_TRUNC('{{period}}',datetime) AS datetime,
  sum(queue) AS count
FROM
  (
SELECT
  fr.datetime,
  case when fr.current_queuename = {{queuename}} then  1 else 0 end queue,
  case when fr.current_queuename = lead(previous_queuename,1) over (partition by fr.id_rebill order by datetime) then 1 else 0 end queue_moved_on
FROM
  f_rebills fr
WHERE 1=1
  {{filter}}
  AND (fr.current_queuename = {{queuename}}  OR fr.previous_queuename = {{queuename}} )
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
) ft
WHERE 1=1
  AND queue = 1 AND queue_moved_on != 1
GROUP BY DATE_TRUNC('{{period}}',DATETIME)
ORDER BY DATE_TRUNC('{{period}}',DATETIME)
{{order}}
LIMIT {{limit}}
OFFSET {{offset}};
