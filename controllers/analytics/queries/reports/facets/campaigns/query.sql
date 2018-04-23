SELECT
  DISTINCT campaign
FROM
  analytics.f_transaction
WHERE
   datetime BETWEEN %L AND %L AND campaign IS NOT NULL %s
