SELECT
  DISTINCT campaign
FROM
  analytics.f_events
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' AND campaign IS NOT NULL {{filter}}
