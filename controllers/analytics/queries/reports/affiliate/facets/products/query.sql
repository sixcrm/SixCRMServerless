SELECT
  DISTINCT tp.product_id as product
FROM
  analytics.f_transaction_product tp
INNER JOIN analytics.f_transaction t ON t.id = tp.transaction_id
WHERE
  t.datetime BETWEEN '{{start}}' AND '{{end}}' AND tp.product_id IS NOT NULL {{filter}}
