/* 21.04.2017 A.Zelen
   Queries with processor statuses

*/

SELECT /* Aggregation by processor amount  */ result,
       SUM(amount) AS sum_amount,
       COUNT(*) AS transaction_count
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result;

SELECT /* Aggregation by processor amount and minutes  */ result,
       SUM(amount) AS sum_amount,
       COUNT(*) AS transaction_count,
       DATE_TRUNC('minute',stamp) AS minutes
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         DATE_TRUNC('minute',stamp)
ORDER BY 4;

SELECT /* Aggregation by processor amount and hour  */ result,
       SUM(amount) AS sum_amount,
       COUNT(*) AS transaction_count,
       DATE_TRUNC('hour',stamp) AS hour
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         DATE_TRUNC('hour',stamp)
ORDER BY 4;

SELECT /* Aggregation by processor amount and day  */ result,
       SUM(amount) AS sum_amount,
       COUNT(*) AS transaction_count,
       DATE_TRUNC('day',stamp) AS day
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         DATE_TRUNC('day',stamp)
ORDER BY 4;

SELECT /* Aggregation by processor amount and month  */ result,
       SUM(amount) AS sum_amount,
       COUNT(*) AS transaction_count,
       DATE_TRUNC('month',stamp) AS day
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         DATE_TRUNC('month',stamp)
ORDER BY 4;

SELECT /* Aggregation by result and data spoofing */ rt.result,
       COALESCE(SUM(amount),0) AS sum_amount,
       COALESCE(COUNT(*),0) AS transaction_count,
       DATE_TRUNC('day',rt.rt_stamp) AS hour
FROM (SELECT *
      FROM f_transactions
      WHERE account = 'ffdb91c2-d2dc-4301-86a4-a48f64c6c503') ft
  RIGHT JOIN (SELECT RESULT,
                     DATE_TRUNC('day',stamp) rt_stamp
              FROM d_dates,
                   d_results
              GROUP BY RESULT,
                       DATE_TRUNC('day',stamp) sw) rt
          ON (ft.result = rt.result
         AND DATE_TRUNC ('day',ft.stamp) = rt_stamp)
WHERE rt.rt_stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY rt.result,
         rt_stamp
ORDER BY 4;
