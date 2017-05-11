SELECT
  mp.merchant_provider,
  mp.processor_result,
  mp.time_flag                   AS {{period}},
  coalesce(sum_amount, 0)        AS sum_amount,
  coalesce(transaction_count, 0) AS transaction_count
FROM
  (SELECT
     merchant_provider,
     dpr.processor_result,
     time_flag
   FROM
     (
       SELECT merchant_provider AS merchant_provider
       FROM
         d_merchant_provider
       WHERE 1
             AND activity_flag = true
             AND merchant_provider IN ({{merchant_providers}})
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
                     merchant_provider,
                     processor_result,
                     SUM(amount)                 AS sum_amount,
                     COUNT(*)                    AS transaction_count,
                     DATE_TRUNC('{{period}}', datetime) AS time_flag
                   FROM f_transactions
                   WHERE 1
                         {{filter}}
                         AND merchant_provider IN ({{merchant_providers}})
                         AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
                   GROUP BY
                     processor_result,
                     merchant_provider,
                     DATE_TRUNC('{{period}}', datetime)
                 ) out
    ON (mp.merchant_provider = out.merchant_provider AND mp.processor_result = out.processor_result AND
        mp.time_flag = out.time_flag)
ORDER BY merchant_provider, {{period}}, processor_result;
