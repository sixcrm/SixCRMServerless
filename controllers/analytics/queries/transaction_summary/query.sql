SELECT result,
      SUM(amount) AS sum_amount,
      COUNT(*) AS transaction_count,
      DATE_TRUNC('{{period}}', stamp) AS {{period}}
FROM f_transactions
WHERE account = '{{account}}'
AND   stamp BETWEEN DATE '{{start}}' AND DATE '{{end}}'
GROUP BY result,
        DATE_TRUNC('{{period}}',stamp)
ORDER BY 4
