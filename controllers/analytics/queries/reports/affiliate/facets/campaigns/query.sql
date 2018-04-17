SELECT
  DISTINCT campaign
FROM
  analytics.f_event
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' AND campaign IS NOT NULL {{filter}}
