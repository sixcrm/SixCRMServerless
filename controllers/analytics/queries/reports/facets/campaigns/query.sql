SELECT
  DISTINCT campaign
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' AND campaign IS NOT NULL {{filter}}
