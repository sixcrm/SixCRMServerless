SELECT ft.affiliate,
       coalesce(fe.count_click,0) AS count_click,
       coalesce(fe.count_partials,0) AS count_partials,
       case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_partials / fe.count_click
       end AS partials_percent,
       coalesce(fail_count,0) AS fail_count,
       coalesce(
         case
           when coalesce(fe.count_click,0) = 0 then 0
           else 1.0*fail_count / fe.count_click
         end,
       0) AS fail_percent,
       coalesce(fe.count_sales,0) AS count_sales,
       case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_sales / fe.count_click
       end AS sales_percent,
       coalesce(fe.count_upsell,0) AS count_upsell ,
       case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_upsell / fe.count_click
       end AS upsell_percent,
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
                    WHEN type= 'upsell' THEN 1
                    ELSE NULL
                END) count_upsell,
          count(CASE
                    WHEN type ='order' THEN 1
                    ELSE NULL
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_event fe
   WHERE 1=1
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
                         AND processor_result ='fail' THEN 1
                    ELSE NULL
                END) fail_count,
          affiliate,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_transaction
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate,
            DATE_TRUNC('{{period}}',datetime)) ft ON (fe.affiliate = ft.affiliate
                                                      AND fe.{{period}} = ft.{{period}})
ORDER BY affiliate,{{period}} {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
