SELECT SUM(fe.count_click) AS count_click,
       SUM(fe.count_partials) AS count_partials,
       SUM(decode(fe.count_click,0,0, 1.0*fe.count_partials / fe.count_click)) AS partials_percent,
       SUM(coalesce(decline_count,0)) AS decline_count,
       SUM(coalesce(decode(decline_count,0,0, 1.0*decline_count / fe.count_click),0)) AS declines_percent,
       SUM(fe.count_sales) AS count_sales,
       SUM(decode(fe.count_sales,0,0, 1.0*fe.count_sales / fe.count_click)) AS sales_percent,
       SUM(fe.count_upsell) AS count_upsell,
       SUM(decode(fe.count_upsell,0,0, 1.0*fe.count_upsell / fe.count_click)) AS upsell_percent,
       SUM(sum_upsell) AS sum_upsell,
       SUM(sum_amount) AS sum_amount
FROM
  (SELECT affiliate,
          count(CASE
                    WHEN type='click' THEN 1
                    ELSE NULL
                END) count_click,
          count(CASE
                    WHEN type='lead' THEN 1
                    ELSE NULL
                END) count_partials,
          count(CASE
                    WHEN type LIKE 'upsell%' THEN 1
                    ELSE NULL
                END) count_upsell,
          count(CASE
                    WHEN type ='order' THEN 1
                    ELSE NULL
                END) count_sales
   FROM f_events fe
   WHERE 1
    {{filter}}
   AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate) fe
RIGHT OUTER JOIN
  (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN transaction_subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN transaction_subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          affiliate
   FROM f_transactions
   WHERE 1
    {{filter}}
   AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate) ft ON (fe.affiliate = ft.affiliate)
