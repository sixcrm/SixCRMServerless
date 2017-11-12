SELECT ft.affiliate,
       nvl(fe.count_click,0) AS count_click,
       nvl(fe.count_partials,0) AS count_partials,
       decode(nvl(fe.count_click,0),0,0, 1.0*fe.count_partials / fe.count_click) AS partials_percent,
       coalesce(decline_count,0) AS decline_count,
       coalesce(decode(nvl(decline_count,0),0,0, 1.0*decline_count / fe.count_click),0) AS declines_percent,
       nvl(fe.count_sales,0) AS count_sales,
       decode(nvl(fe.count_sales,0),0,0, 1.0*fe.count_sales / fe.count_click) AS sales_percent,
       nvl(fe.count_upsell,0) AS count_upsell ,
       decode(nvl(fe.count_upsell,0),0,0, 1.0*fe.count_upsell / fe.count_click) AS upsell_percent,
       sum_upsell,
       sum_amount,
       ft.{{period}} AS {{period}}
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
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM f_events fe
   WHERE 1
     {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate,
            DATE_TRUNC('{{period}}',datetime)) fe
RIGHT OUTER JOIN
  (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          affiliate,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM f_transactions
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate,
            DATE_TRUNC('{{period}}',datetime)) ft ON (fe.affiliate = ft.affiliate
                                                      AND fe.{{period}} = ft.{{period}})
ORDER BY affiliate,{{period}} {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
