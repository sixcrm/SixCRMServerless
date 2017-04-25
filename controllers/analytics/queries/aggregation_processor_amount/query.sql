SELECT
  rt.processor_result,
  COALESCE(SUM(amount),0) AS sum_amount,
  COALESCE(COUNT(*),0) AS transaction_count,
  DATE_TRUNC('{{period}}',rt.rt_datetime) AS {{period}}
FROM
  (
    SELECT
      *
    FROM
      f_transactions
    WHERE 1
      {{filter}}
    AND
      account = '{{account}}'
  ) ft
  RIGHT JOIN
  (
    SELECT
      processor_result,
      DATE_TRUNC('{{period}}',datetime) rt_datetime
    FROM
      d_datetime,
      d_processor_result
    GROUP BY
      processor_result,
      DATE_TRUNC('{{period}}',datetime)
  ) rt
  ON
    (ft.processor_result = rt.processor_result AND DATE_TRUNC ('{{period}}',ft.datetime) = rt_datetime)
WHERE
  rt.rt_datetime BETWEEN DATE '{{start}}' AND DATE '{{end}}'
GROUP BY
  rt.processor_result,
  rt_datetime
ORDER BY
  {{period}}
