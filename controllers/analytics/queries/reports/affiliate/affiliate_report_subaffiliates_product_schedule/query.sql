with EVENTS_SUB1 as (SELECT subaffiliate_1 as subaffiliate,
          sum(CASE
                    WHEN type='click' THEN 1
                    ELSE 0
                END) count_click,
          sum(CASE
                    WHEN type='lead' THEN 1
                    ELSE 0
                END) count_partials,
          sum(CASE
                    WHEN type= 'upsell' THEN 1
                    ELSE 0
                END) count_upsell,
          sum(CASE
                    WHEN type ='order' THEN 1
                    ELSE 0
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_events fe
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_1 is not null
     AND subaffiliate_1 !=''
   GROUP BY subaffiliate_1,
            DATE_TRUNC('{{period}}',datetime)),
EVENTS_SUB2 as (SELECT subaffiliate_2 as subaffiliate,
          sum(CASE
                    WHEN type='click' THEN 1
                    ELSE 0
                END) count_click,
          sum(CASE
                    WHEN type='lead' THEN 1
                    ELSE 0
                END) count_partials,
          sum(CASE
                    WHEN type= 'upsell' THEN 1
                    ELSE 0
                END) count_upsell,
          sum(CASE
                    WHEN type ='order' THEN 1
                    ELSE 0
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_events fe
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_2 is not null
     AND subaffiliate_2 !=''
   GROUP BY subaffiliate_2,
            DATE_TRUNC('{{period}}',datetime)
   UNION ALL
   SELECT * FROM EVENTS_SUB1),
EVENTS_SUB3 as (SELECT subaffiliate_3 as subaffiliate,
          sum(CASE
                    WHEN type='click' THEN 1
                    ELSE 0
                END) count_click,
          sum(CASE
                    WHEN type='lead' THEN 1
                    ELSE 0
                END) count_partials,
          sum(CASE
                    WHEN type= 'upsell' THEN 1
                    ELSE 0
                END) count_upsell,
          sum(CASE
                    WHEN type ='order' THEN 1
                    ELSE 0
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_events fe
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_3 is not null
     AND subaffiliate_3 !=''
   GROUP BY subaffiliate_3,
            DATE_TRUNC('{{period}}',datetime)
   UNION ALL
   SELECT * FROM EVENTS_SUB2),
EVENTS_SUB4 as (SELECT subaffiliate_4 as subaffiliate,
          sum(CASE
                    WHEN type='click' THEN 1
                    ELSE 0
                END) count_click,
          sum(CASE
                    WHEN type='lead' THEN 1
                    ELSE 0
                END) count_partials,
          sum(CASE
                    WHEN type= 'upsell' THEN 1
                    ELSE 0
                END) count_upsell,
          sum(CASE
                    WHEN type ='order' THEN 1
                    ELSE 0
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_events fe
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_4 is not null
     AND subaffiliate_4 !=''
   GROUP BY subaffiliate_4,
            DATE_TRUNC('{{period}}',datetime)
   UNION ALL
   SELECT * FROM EVENTS_SUB3),
EVENTS_SUB5 as (SELECT subaffiliate_5 as subaffiliate,
          sum(CASE
                    WHEN type='click' THEN 1
                    ELSE 0
                END) count_click,
          sum(CASE
                    WHEN type='lead' THEN 1
                    ELSE 0
                END) count_partials,
          sum(CASE
                    WHEN type= 'upsell' THEN 1
                    ELSE 0
                END) count_upsell,
          sum(CASE
                    WHEN type ='order' THEN 1
                    ELSE 0
                END) count_sales,
          DATE_TRUNC('{{period}}',datetime) AS {{period}}
   FROM analytics.f_events fe
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_5 is not null
     AND subaffiliate_5 !=''
   GROUP BY subaffiliate_5,
            DATE_TRUNC('{{period}}',datetime)
   UNION ALL
   SELECT * FROM EVENTS_SUB4),
TRANSACTIONS_SUB1 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          sum(CASE
                    WHEN subtype IN ('order','main')
                         AND processor_result ='fail' THEN 1
                    ELSE 0
                END) fail_count,
          DATE_TRUNC('{{period}}',datetime) AS {{period}},
          subaffiliate_1
   FROM analytics.f_transactions
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_1 is not null
     AND subaffiliate_1 !=''
   GROUP BY subaffiliate_1,
            DATE_TRUNC('{{period}}',datetime)),
TRANSACTIONS_SUB2 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          sum(CASE
                    WHEN subtype IN ('order','main')
                         AND processor_result ='fail' THEN 1
                    ELSE 0
                END) fail_count,
          DATE_TRUNC('{{period}}',datetime) AS {{period}},
          subaffiliate_2
   FROM analytics.f_transactions
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_2 is not null
     AND subaffiliate_2 !=''
   GROUP BY subaffiliate_2,
            DATE_TRUNC('{{period}}',datetime)
  UNION ALL
  SELECT * FROM TRANSACTIONS_SUB1),
TRANSACTIONS_SUB3 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          sum(CASE
                    WHEN subtype IN ('order','main')
                         AND processor_result ='fail' THEN 1
                    ELSE 0
                END) fail_count,
          DATE_TRUNC('{{period}}',datetime) AS {{period}},
          subaffiliate_3
   FROM analytics.f_transactions
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_3 is not null
     AND subaffiliate_3 !=''
   GROUP BY subaffiliate_3,
            DATE_TRUNC('{{period}}',datetime)
  UNION ALL
  SELECT * FROM TRANSACTIONS_SUB2),
TRANSACTIONS_SUB4 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          sum(CASE
                    WHEN subtype IN ('order','main')
                         AND processor_result ='fail' THEN 1
                    ELSE 0
                END) fail_count,
          DATE_TRUNC('{{period}}',datetime) AS {{period}},
          subaffiliate_4
   FROM analytics.f_transactions
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_4 is not null
     AND subaffiliate_4 !=''
   GROUP BY subaffiliate_4,
            DATE_TRUNC('{{period}}',datetime)
  UNION ALL
  SELECT * FROM TRANSACTIONS_SUB3),
TRANSACTIONS_SUB5 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          sum(CASE
                    WHEN subtype IN ('order','main')
                         AND processor_result ='fail' THEN 1
                    ELSE 0
                END) fail_count,
          DATE_TRUNC('{{period}}',datetime) AS {{period}},
          subaffiliate_5 as subaffiliate
   FROM analytics.f_transactions
   WHERE 1=1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_5 is not null
     AND subaffiliate_5 !=''
   GROUP BY subaffiliate_5,
            DATE_TRUNC('{{period}}',datetime)
  UNION ALL
  SELECT * FROM TRANSACTIONS_SUB4)
SELECT ft.subaffiliate,
       coalesce(fe.count_click,0) AS count_click,
       coalesce(fe.count_partials,0) AS count_partials,
       case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_partials / fe.count_click
       end AS partials_percent,
       coalesce(fail_count,0) AS fail_count,
       coalesce(
         case
            when coalesce(fail_count,0) = 0 then 0
            else 1.0*fail_count / fe.count_click
            end
       ,0) AS fail_percent,
       coalesce(fe.count_sales,0) AS count_sales,
       case
          when coalesce(fe.count_sales,0) = 0 then 0
          else 1.0*fe.count_sales / fe.count_click
       end AS sales_percent,
       coalesce(fe.count_upsell,0) AS count_upsell ,
       case
          when coalesce(fe.count_upsell,0) = 0 then 0
          else 1.0*fe.count_upsell / fe.count_click
       end AS upsell_percent,
       sum_upsell,
       sum_amount,
       fe.{{period}} AS {{period}}
FROM EVENTS_SUB5 fe RIGHT OUTER JOIN TRANSACTIONS_SUB5 ft
  ON (fe.subaffiliate = ft.subaffiliate AND fe.{{period}} = ft.{{period}})
ORDER BY {{period}} {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
