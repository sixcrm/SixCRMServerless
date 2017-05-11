SELECT
  mp.merchant_provider,
  mp.processor_result,
  coalesce(sum_amount, 0)        AS sum_amount,
  coalesce(transaction_count, 0) AS transaction_count
FROM
  (
   SELECT
     merchant_provider,
     dpr.processor_result
   FROM
     (
       SELECT merchant_provider AS merchant_provider
       FROM
         d_merchant_provider
       WHERE 1
             AND activity_flag = 'active'
             AND merchant_provider IN ({{merchantprovider}})
     ) ft
     CROSS JOIN d_processor_result dpr
  ) mp LEFT JOIN (
                   SELECT
                     merchant_provider,
                     processor_result,
                     SUM(amount)                 AS sum_amount,
                     COUNT(*)                    AS transaction_count
                   FROM f_transactions
                   WHERE 1
                      {{filter}}
                      AND merchant_provider IN ({{merchantprovider}})
                      AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
                   GROUP BY
                     processor_result,
                     merchant_provider
                 ) out
    ON (mp.merchant_provider = out.merchant_provider AND mp.processor_result = out.processor_result)
ORDER BY merchant_provider, processor_result;
