SELECT
  DISTINCT merchant_provider as mid
FROM
  analytics.f_transaction
WHERE
   datetime BETWEEN %L AND %L AND merchant_provider IS NOT NULL %s
