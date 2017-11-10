SELECT
  ft.id,
  ft.datetime,
  ft.customer,
  ft.creditcard,
  ft.merchant_provider,
  ft.campaign,
  ft.affiliate,
  ft.amount,
  ft.processor_result,
  ft.account,
  ft.type,
  ft.product_schedule,
  ft.subaffiliate_1,
  ft.subaffiliate_2,
  ft.subaffiliate_3,
  ft.subaffiliate_4,
  ft.subaffiliate_5,
  ft.subtype
FROM f_transactions ft
WHERE 1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}} OFFSET {{offset}};
