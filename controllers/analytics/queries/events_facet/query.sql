SELECT
  {{facet}},
  count(*) AS events_count,
  sum(count(*))
  OVER ( ) AS all_events
FROM f_events
WHERE 1
  {{filter}}
AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY {{facet}}
