/* Refactored merchant provider query */

/* Materialize MERCHANT providers for query */

DROP TABLE IF EXISTS tmp_merchant_provider;
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_merchant_provider
(
  merchant_provider VARCHAR(128)
) DISTSTYLE ALL;

INSERT INTO tmp_merchant_provider VALUES
  ('15224d91-ff5d-4282-aa2c-783ad2fb925b'),
  ('8d1e896f-c50d-4a6b-8c84-d5661c16a046'),
  ('6c40761d-8919-4ad6-884d-6a46a776cfb9'),
  ('79189a4a-ed89-4742-aa96-afcd7f6c08fb');

/* Main query */

SELECT
  mp.merchant_provider,
  mp.processor_result,
  coalesce(sum_amount, 0)        AS sum_amount,
  coalesce(transaction_count, 0) AS transaction_count
FROM
  (
    SELECT
      merchant_provider,
      processor_result,
      SUM(amount) AS sum_amount,
      COUNT(*)    AS transaction_count
    FROM f_transactions
    WHERE 1=1
          AND merchant_provider IN (('15224d91-ff5d-4282-aa2c-783ad2fb925b'),
                                    ('8d1e896f-c50d-4a6b-8c84-d5661c16a046'),
                                    ('6c40761d-8919-4ad6-884d-6a46a776cfb9'),
                                    ('79189a4a-ed89-4742-aa96-afcd7f6c08fb'))
    --                     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
    GROUP BY
      processor_result,
      merchant_provider
  ) out RIGHT JOIN (
                     SELECT
                       merchant_provider,
                       dpr.processor_result
                     FROM
                       (
                         SELECT merchant_provider
                         FROM
                           tmp_merchant_provider
                       ) ft
                       CROSS JOIN d_processor_result dpr
                   ) mp
    ON (mp.merchant_provider = out.merchant_provider AND mp.processor_result = out.processor_result)
ORDER BY merchant_provider, processor_result;
