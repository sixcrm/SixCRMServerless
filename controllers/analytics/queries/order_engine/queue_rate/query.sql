SELECT
  queuename,
  num_of_failed_rebills / num_of_rebills_from_queue AS failure_rate,
  num_of_error_rebills / num_of_rebills_from_queue AS error_rate,
  num_of_success_rebills / num_of_rebills_from_queue AS success_rate,
  num_of_expired_rebills / num_of_rebills_from_queue AS expired_rate
FROM
  (SELECT
     previous_queuename AS queuename,
     count(*)              num_of_rebills_from_queue,
     sum(
         CASE
         WHEN current_queuename LIKE '%failed' or current_queuename LIKE '%recover'
           THEN 1
         ELSE 0
         END
     )                     num_of_failed_rebills,
     sum(
         CASE
         WHEN current_queuename LIKE '%error'
           THEN 1
         ELSE 0
         END
     )                     num_of_error_rebills,
     sum(
         CASE
         WHEN current_queuename NOT LIKE '%error' and current_queuename NOT LIKE '%failed' and current_queuename NOT LIKE '%recover'
           THEN 1
         ELSE 0
         END
     )                     num_of_success_rebills,
     sum(
         CASE
         WHEN m_datetime = datetime and datetime < CURRENT_DATE + interval '14 days'
           THEN 1
         ELSE 0
         END
     )                     num_of_expired_rebills
     FROM
(
  SELECT fr.*,
         max(datetime) over (partition by id_rebill) as m_datetime
  FROM f_rebills fr
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND previous_queuename NOT LIKE '%failed' and previous_queuename != 'recover' ) rebill_sub_1
GROUP BY previous_queuename) rebill_sub_2;
