SELECT
  ft.id,
  ft.datetime,
  ft.customer,
  ft.affiliate,
  ft.campaign,
  ft.merchant_provider,
  ft.amount,
  ft.processor_result,
  ft.type,
  null as cycle,
  null as recycle
FROM f_transactions ft
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
