SELECT
  rt.event_type,
  COALESCE(COUNT(ft.type),0) AS event_count,
  DATE_TRUNC('{{period}}',rt.rt_datetime) AS {{period}}
FROM
  (
    SELECT
      *
    FROM
      analytics.f_events
    WHERE 1=1
      {{filter}}
      AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  ) ft
  RIGHT JOIN
  (
    SELECT
      e.id as event_type,
      DATE_TRUNC('{{period}}',datetime) rt_datetime
    FROM
      generate_series( '{{start}}'::timestamp, '{{end}}'::timestamp, '1 minute'::interval) datetime,
      (SELECT id FROM analytics.d_event_type) e
    GROUP BY
      event_type,
      DATE_TRUNC('{{period}}',datetime)
  ) rt
  ON
    (ft.type = rt.event_type AND DATE_TRUNC ('{{period}}',ft.datetime) = rt_datetime)
WHERE
  rt.rt_datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY
  rt.event_type,
  rt_datetime
ORDER BY
  {{period}},
  event_type;
