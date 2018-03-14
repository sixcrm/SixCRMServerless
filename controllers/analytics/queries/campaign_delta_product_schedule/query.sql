 SELECT
  campaign,
  percent_change_amount,
  percent_change_count
FROM
    (SELECT
       campaign,
       ((greatest(sum_amount_main, 1) - greatest(sum_amount_prior, 1))*1.0 / greatest(sum_amount_prior, 1)) *
       100.0 AS percent_change_amount,
       ((greatest(transaction_count_main, 1) - greatest(transaction_count_prior, 1))*1.0 / greatest(transaction_count_prior, 1)) *
       100.0 AS percent_change_count
     FROM
       (SELECT
          campaign,
          SUM(
              CASE WHEN datetime >= TIMESTAMP '{{start}}'
                THEN amount
              ELSE 0
              END
          )        AS sum_amount_main,
          SUM(CASE WHEN datetime >= TIMESTAMP '{{start}}'
            THEN 1
              ELSE 0
              END) AS transaction_count_main,
          SUM(CASE WHEN datetime < TIMESTAMP '{{start}}'
            THEN amount
              ELSE 0
              END) AS sum_amount_prior,
          SUM(CASE WHEN datetime < TIMESTAMP '{{start}}'
            THEN 1
              ELSE 0
              END) AS transaction_count_prior
        FROM analytics.f_transactions
        WHERE 1 = 1
              {{filter}}
              AND datetime BETWEEN TIMESTAMP '{{start}}' - (TIMESTAMP '{{end}}' - TIMESTAMP '{{start}}') AND TIMESTAMP '{{end}}'
        GROUP BY campaign) cd
    ) cd
     ORDER BY abs(percent_change_count) DESC, percent_change_count, percent_change_amount
LIMIT {{limit}};
