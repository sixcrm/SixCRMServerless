SELECT
  queuename,
  num_of_failed_rebills / num_of_rebills_from_queue AS failure_percentage
FROM
  (SELECT
     previous_queuename AS queuename,
     count(*)              num_of_rebills_from_queue,
     sum(
         CASE
         WHEN current_queuename LIKE 'fail%' or current_queuename LIKE 'pending%'
           THEN 1
         ELSE 0
         END
     )                     num_of_failed_rebills
FROM f_rebills
WHERE 1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND previous_queuename NOT LIKE 'fail%' and previous_queuename != 'pending'
GROUP BY previous_queuename);
