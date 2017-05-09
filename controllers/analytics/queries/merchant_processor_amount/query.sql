SELECT
  mp.merchant_processor,
  mp.processor_result,
  mp.time_flag                   AS {{period}},
  coalesce(sum_amount, 0)        AS sum_amount,
  coalesce(transaction_count, 0) AS transaction_count
FROM
  (SELECT
     merchant_processor,
     dpr.processor_result,
     time_flag
   FROM
     (
       SELECT merchant_processor AS merchant_processor
       FROM
         d_merchant_processor
       WHERE 1
             AND activity_flag = true
             AND merchant_processor IN ({{merchant_processor}})
     ) ft
     CROSS JOIN d_processor_result dpr
     CROSS JOIN
     (
       SELECT DATE_TRUNC('{{period}}', datetime) AS time_flag
       FROM d_datetime dd
       WHERE dd.datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
       GROUP BY DATE_TRUNC('{{period}}', datetime)
     ) dd
  ) mp LEFT JOIN (
                   SELECT
                     merchant_processor,
                     processor_result,
                     SUM(amount)                 AS sum_amount,
                     COUNT(*)                    AS transaction_count,
                     DATE_TRUNC('{{period}}', datetime) AS time_flag
                   FROM f_transactions
                   WHERE 1
                         {{filter}}
                         AND merchant_processor IN ({{merchant_processor}})
                         AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
                   GROUP BY
                     processor_result,
                     merchant_processor,
                     DATE_TRUNC('{{period}}', datetime)
                 ) out
    ON (mp.merchant_processor = out.merchant_processor AND mp.processor_result = out.processor_result AND
        mp.time_flag = out.time_flag)
ORDER BY merchant_processor, {{period}}, processor_result;
