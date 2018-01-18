SELECT
  DATE_TRUNC('{{period}}',DATETIME) AS datetime,
  COUNT(*) AS count
FROM
  f_rebills 
WHERE 1=1
 {{filter}}
 AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY DATE_TRUNC('{{period}}',DATETIME)
ORDER BY DATE_TRUNC('{{period}}',DATETIME)
{{order}}
LIMIT {{limit}}
OFFSET {{offset}};
