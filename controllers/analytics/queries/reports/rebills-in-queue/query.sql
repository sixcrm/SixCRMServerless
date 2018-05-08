SELECT
  r.id,
  CAST(SUM(r.amount) AS DOUBLE PRECISION) AS amount
FROM analytics.f_rebill r
WHERE ( r.current_queuename = %L OR r.previous_queuename = %L ) %s
GROUP BY r.id
HAVING COUNT(1) = 1 AND MAX(r.current_queuename) = %L
ORDER BY SUM(r.amount) %s
LIMIT %L
OFFSET %L;
