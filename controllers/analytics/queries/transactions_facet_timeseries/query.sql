SELECT
  rt.{{facet}},
  COALESCE(SUM(amount),0) AS sum_amount,
  COALESCE(COUNT(ft.id),0) AS transaction_count,
  DATE_TRUNC('{{period}}',rt.rt_datetime) AS {{period}}
FROM
  (
    SELECT
      *
    FROM
      f_transactions
    WHERE 1
      {{filter}}
      AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  ) ft
  RIGHT JOIN
  (
    SELECT
      {{facet}},
      DATE_TRUNC('{{period}}',datetime) rt_datetime
    FROM
      d_datetime,
      (
        SELECT
          distinct {{facet}}
        FROM
          f_transactions
          WHERE 1
          {{filter}}
      )
    WHERE 1
      AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
    GROUP BY
      {{facet}},
      DATE_TRUNC('{{period}}',datetime)
  ) rt
  ON
    (ft.{{facet}} = rt.{{facet}} AND DATE_TRUNC ('{{period}}',ft.datetime) = rt_datetime)
WHERE
  rt.rt_datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY
  rt.{{facet}},
  rt_datetime
ORDER BY
  {{period}},
  {{facet}}
