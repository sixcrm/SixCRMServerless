SELECT
  DATE_TRUNC(%L, datetime) AS datetime,
  SUM(queue) AS count
FROM
(
  SELECT
    fr.datetime,
    CASE WHEN fr.current_queuename = queuename THEN
      1
    ELSE
      0
    END queue,
    CASE WHEN fr.current_queuename = lead(previous_queuename, 1)
    OVER (PARTITION BY
      fr.id
    ORDER BY
      datetime) THEN
      1
    ELSE
      0
  END queue_moved_on
  FROM analytics.f_rebill fr
    WHERE (fr.current_queuename = queuename OR fr.previous_queuename = queuename)
      AND datetime BETWEEN TIMESTAMP %L AND TIMESTAMP %L %s
) ft
WHERE queue = 1 AND queue_moved_on <> 1
GROUP BY DATE_TRUNC(%L, DATETIME)
ORDER BY DATE_TRUNC(%L, DATETIME) %L
LIMIT %L
OFFSET %L;

