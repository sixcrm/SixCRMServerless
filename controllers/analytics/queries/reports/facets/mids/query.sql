SELECT
  DISTINCT merchant_provider as mid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' AND merchant_provider IS NOT NULL {{filter}}
