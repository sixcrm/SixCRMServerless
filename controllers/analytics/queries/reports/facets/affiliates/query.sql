SELECT
  DISTINCT affiliate
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN %L AND %L AND affiliate IS NOT NULL %s
