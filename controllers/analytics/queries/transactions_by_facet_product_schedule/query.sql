SELECT
  {{facet}},
  transactions_count,
  SUM(CASE WHEN R_ID IN ({{limit}}+1 + {{offset}},0) THEN all_transactions_count ELSE 0 END)
  OVER () AS all_transactions_count,
  transactions_amount,
  SUM(CASE WHEN R_ID IN ({{limit}}+1 + {{offset}},0) THEN all_transactions_amount ELSE 0 END)
  OVER () AS all_transactions_amount
FROM
  (SELECT
     R_ID,
     {{facet}},
     transactions_count,
     all_transactions_count,
     transactions_amount,
     all_transactions_amount
   FROM
     (SELECT R_ID,
        CASE WHEN R_ID = {{limit}}+1 + {{offset}}
          THEN 'all-other'
        ELSE {{facet}} END           AS {{facet}},
        CASE WHEN R_ID = {{limit}}+1 + {{offset}}
          THEN all_transactions_count - r_sum_count
        ELSE transactions_count END  AS transactions_count,
        all_transactions_count,
        CASE WHEN R_ID = {{limit}}+1 + {{offset}}
          THEN all_transactions_amount - r_sum_amount
        ELSE transactions_amount END AS transactions_amount,
        all_transactions_amount
      FROM
        (
          SELECT
            {{facet}},
            transactions_count,
            all_transactions_count,
            transactions_amount,
            sum(transactions_amount)
            OVER ()
                                                 AS       all_transactions_amount,
            sum(transactions_count)
            OVER (
              ORDER BY transactions_count {{order}}
              ROWS BETWEEN {{limit}} PRECEDING AND 0 FOLLOWING ) r_sum_count,
            sum(transactions_amount)
            OVER (
              ORDER BY transactions_count {{order}}
              ROWS BETWEEN {{limit}} PRECEDING AND 0 FOLLOWING ) r_sum_amount,
            ROW_NUMBER()
            OVER (
              ORDER BY transactions_count {{order}} ) AS       R_ID
          FROM
            (
              SELECT
                {{facet}},
                count(*)    AS transactions_count,
                sum(count(*))
                OVER ( )    AS all_transactions_count,
                sum(amount) AS transactions_amount
              FROM analytics.f_transactions
              WHERE 1 = 1
                    {{filter}}
                    AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
                    AND {{facet}} IS NOT NULL
              GROUP BY {{facet}}
            ) t1
          ORDER BY transactions_count {{order}}
          LIMIT {{limit}}+1
          OFFSET {{offset}}
        ) t2 ) t3
   UNION ALL
     SELECT 0 AS R_ID,
       'none'      AS {{facet}},
       count(*)    AS transactions_count,
       1           AS all_transactions_count,
       sum(amount) AS transactions_amount,
       sum(amount) AS all_transactions_amount
     FROM analytics.f_transactions
     WHERE 1 = 1
           {{filter}}
           AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
           AND {{facet}} IS NULL
     GROUP BY {{facet}}
  ) t1
ORDER BY transactions_count {{order}}
