SELECT
  campaign,
  percent_change_amount,
  percent_change_count
FROM
    (SELECT
       campaign,
       ((sum_amount_main - coalesce(sum_amount_prior, 0))*1.0 / coalesce(sum_amount_main, 1)) *
       100.0 AS percent_change_amount,
       ((transaction_count_main - coalesce(transaction_count_prior, 0))*1.0 / coalesce(transaction_count_main, 1)) *
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
        FROM f_transactions
        WHERE 1
              {{filter}}
              AND datetime BETWEEN TIMESTAMP '{{start}}' - (TIMESTAMP '{{end}}' - TIMESTAMP '{{start}}') AND '{{end}}'
        GROUP BY campaign)
    )
     ORDER BY abs(percent_change_count) DESC, percent_change_count, percent_change_amount;
