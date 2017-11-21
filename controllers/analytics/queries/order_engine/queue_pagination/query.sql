SELECT
  fq.queuename,
  fq.account,
  fq.count,
  fq.datetime
FROM f_queue_count fq
WHERE 1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
