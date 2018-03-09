SELECT
  DATE_TRUNC('day',DATETIME) AS datetime,
  SUM(fq.count) AS count
FROM f_queue_count fq
WHERE 1=1
 {{filter}}
 AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY DATE_TRUNC('day',DATETIME)
ORDER BY DATE_TRUNC('day',DATETIME)
{{order}}
LIMIT {{limit}}
OFFSET {{offset}};
