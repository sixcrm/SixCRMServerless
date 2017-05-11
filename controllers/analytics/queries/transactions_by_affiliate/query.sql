SELECT
  *,
  (affiliate_count * 100.0 / (sum(affiliate_count) OVER ())) AS affiliate_perc
FROM
  (
    SELECT
      affiliate,
      coalesce(count(*), 0) AS affiliate_count
    FROM f_transactions
    WHERE 1
    {{filter}}
    AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
    GROUP BY affiliate
  )
ORDER BY affiliate_perc {{order}}
LIMIT {{limit}}
