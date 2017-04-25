SELECT result,
      SUM(amount) AS sum_amount,
      COUNT(*) AS transaction_count,
      DATE_TRUNC('{{period}}', stamp) AS {{period}}
FROM f_transactions
WHERE 1
{{filter}}
AND account = '{{account}}'
AND   stamp BETWEEN DATE '{{start}}' AND DATE '{{end}}'
AND   ({{campaign}} IS NULL OR campaign IN ({{campaign}}))
GROUP BY result,
        DATE_TRUNC('{{period}}',stamp)
ORDER BY {{period}}
