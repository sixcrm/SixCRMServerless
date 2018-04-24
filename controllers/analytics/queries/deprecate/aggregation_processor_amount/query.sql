SELECT
  rt.processor_result,
  COALESCE(SUM(amount),0) AS sum_amount,
  COALESCE(COUNT(ft.id),0) AS transaction_count,
  DATE_TRUNC('{{period}}',rt.rt_datetime) AS {{period}}
FROM
  (
    SELECT
      *
    FROM
      analytics.f_transaction
    WHERE 1=1
      {{filter}}
      AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  ) ft
  RIGHT JOIN
  (
    SELECT
      e.id as processor_result,
      DATE_TRUNC('{{period}}',datetime) rt_datetime
    FROM
      generate_series( '{{start}}'::timestamp, '{{end}}'::timestamp, '1 minute'::interval) datetime,
      (SELECT id FROM analytics.d_processor_result) e
    GROUP BY
      processor_result,
      DATE_TRUNC('{{period}}',datetime)
  ) rt
  ON
    (ft.processor_result = rt.processor_result AND DATE_TRUNC ('{{period}}',ft.datetime) = rt_datetime)
WHERE
  rt.rt_datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY
  rt.processor_result,
  rt_datetime
ORDER BY
  {{period}},
  processor_result