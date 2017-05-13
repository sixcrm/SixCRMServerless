SELECT
  fe.session,
  fe.type,
  fe.datetime,
  fe.account,
  fe.campaign,
  fe.product_schedule,
  fe.affiliate,
  fe.subaffiliate_1,
  fe.subaffiliate_2,
  fe.subaffiliate_3,
  fe.subaffiliate_4,
  fe.subaffiliate_5
FROM
  f_events fe
WHERE 1
{{filter}}
AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
ORDER BY DATETIME {{order}}
LIMIT {{limit}} OFFSET {{offset}};
