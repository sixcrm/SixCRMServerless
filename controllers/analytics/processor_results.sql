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
