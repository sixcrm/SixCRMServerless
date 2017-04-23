SELECT result,
      SUM(amount) AS sum_amount,
      COUNT(*) AS transaction_count,
      DATE_TRUNC('month', stamp) AS day
FROM f_transactions
WHERE account = '{{account}}'
AND   stamp BETWEEN DATE '{{start}}' AND DATE '{{end}}'
GROUP BY result,
        DATE_TRUNC('month',stamp)
ORDER BY 4
