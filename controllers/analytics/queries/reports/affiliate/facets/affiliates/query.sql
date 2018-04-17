SELECT
  DISTINCT affiliate
FROM
  analytics.f_events
WHERE
  datetime BETWEEN '{{start}}' AND '{{end}}' AND affiliate IS NOT NULL {{filter}}
