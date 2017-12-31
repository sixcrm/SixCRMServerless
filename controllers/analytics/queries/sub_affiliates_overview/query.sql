SELECT affiliate,
       sum(amount) AS amount
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY affiliate;
