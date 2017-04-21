/*
19.04.2017 A.Zelen

For a given account and a given date range, return the aggregated transactions by time period, transaction type and processor result.
account info and date range should be feed in, perhaps even the type of datapoint

*/

SELECT /* Granularity by day*/ TYPE,
       result,
       DATE_TRUNC('day',stamp) AS m_timestamp,
       COUNT(*) AS transaction_count,
       SUM(amount) AS sum_of_amount
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         TYPE,
         DATE_TRUNC('day',stamp)
ORDER BY 3 DESC;

SELECT /* Granularity by minutes */ TYPE,
       result,
       DATE_TRUNC('minute',stamp) AS m_timestamp,
       COUNT(*) AS transaction_count,
       SUM(amount) AS sum_of_amount
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         TYPE,
         DATE_TRUNC('minute',stamp)
ORDER BY 3 DESC;

SELECT /* All transactions  */ TYPE,
       result,
       COUNT(*) AS transaction_count,
       SUM(amount) AS sum_of_amount
FROM f_transactions
WHERE account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
AND   stamp BETWEEN DATE '03.01.2017' AND DATE '03.31.2017'
GROUP BY result,
         TYPE
ORDER BY 3 DESC;
