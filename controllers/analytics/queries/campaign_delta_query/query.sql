SELECT
  campaign,
  percent_change_count,
  percent_change_amount
FROM
  (SELECT
     main.campaign                                                                                 AS campaign,
     ((main.sum_amount - coalesce(prior.sum_amount,0)) / main.sum_amount) *
     100                                                                                           AS percent_change_amount,
     ((main.transaction_count - coalesce(prior.transaction_count,0)) / main.transaction_count) *
     100                                                                                           AS percent_change_count
   FROM
     (SELECT
        campaign,
        SUM(amount) AS sum_amount,
        COUNT(*)    AS transaction_count
      FROM f_transactions
      WHERE 1
        {{filter}}
        AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
      GROUP BY campaign) main LEFT OUTER JOIN
     (SELECT
        campaign,
        SUM(amount) AS sum_amount,
        COUNT(*)    AS transaction_count
      FROM f_transactions
      WHERE 1
        {{filter}}
        AND datetime BETWEEN TIMESTAMP '{{start}}' - (TIMESTAMP '{{end}}' - TIMESTAMP '{{start}}') AND dateadd(microsec,-1,'{{start}}')
      GROUP BY campaign) prior
       ON (main.campaign = prior.campaign))
ORDER BY abs(percent_change_count) DESC,percent_change_count,percent_change_amount;
