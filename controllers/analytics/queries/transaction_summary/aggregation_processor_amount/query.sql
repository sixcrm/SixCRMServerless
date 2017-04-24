SELECT rt.result,
       COALESCE(SUM(amount),0) AS sum_amount,
       COALESCE(COUNT(*),0) AS transaction_count,
       DATE_TRUNC('{{period}}',rt.rt_stamp) AS hour
FROM (SELECT *
      FROM f_transactions
      WHERE account = '{{account}}') ft
  RIGHT JOIN (SELECT RESULT,
                     DATE_TRUNC('{{period}}',stamp) rt_stamp
              FROM d_dates,
                   d_results
              GROUP BY RESULT,
                       DATE_TRUNC('{{period}}',stamp) sw) rt
          ON (ft.result = rt.result
         AND DATE_TRUNC ('{{period}}',ft.stamp) = rt_stamp)
WHERE rt.rt_stamp BETWEEN DATE '{{start}}' AND DATE '{{end}}'
GROUP BY rt.result,
         rt_stamp
ORDER BY 4;
