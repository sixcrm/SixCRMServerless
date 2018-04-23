SELECT
  DISTINCT tps.product_schedule_id as product_schedule
FROM
  analytics.f_transaction_product_schedule tps
INNER JOIN analytics.f_transaction t ON t.id = tps.transaction_id
WHERE
   t.datetime BETWEEN %L AND %L AND tps.product_schedule_id IS NOT NULL %s
