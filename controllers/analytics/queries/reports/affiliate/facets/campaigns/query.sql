SELECT
  DISTINCT campaign
FROM
  analytics.f_events
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' {{filter}}
