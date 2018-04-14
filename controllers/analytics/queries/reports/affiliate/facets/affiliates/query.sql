SELECT
  DISTINCT affiliate
FROM
  analytics.f_events
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' {{filter}}
