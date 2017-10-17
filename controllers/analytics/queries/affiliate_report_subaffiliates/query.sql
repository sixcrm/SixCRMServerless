with EVENTS_SUB1 as (SELECT subaffiliate_1 as subaffiliate,
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
          DATE_TRUNC({{period}},datetime) AS {{period}}
   FROM f_events fe
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_1 is not null
     AND subaffiliate_1 !=''
   GROUP BY subaffiliate_1,
            DATE_TRUNC({{period}},datetime)),
EVENTS_SUB2 as (SELECT subaffiliate_2 as subaffiliate,
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
          DATE_TRUNC({{period}},datetime) AS {{period}}
   FROM f_events fe
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_2 is not null
     AND subaffiliate_2 !=''
   GROUP BY subaffiliate_2,
            DATE_TRUNC({{period}},datetime)
   UNION
   SELECT * FROM EVENTS_SUB1),
EVENTS_SUB3 as (SELECT subaffiliate_3 as subaffiliate,
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
          DATE_TRUNC({{period}},datetime) AS {{period}}
   FROM f_events fe
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_3 is not null
     AND subaffiliate_3 !=''
   GROUP BY subaffiliate_3,
            DATE_TRUNC({{period}},datetime)
   UNION
   SELECT * FROM EVENTS_SUB2),
EVENTS_SUB4 as (SELECT subaffiliate_4 as subaffiliate,
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
          DATE_TRUNC({{period}},datetime) AS {{period}}
   FROM f_events fe
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_4 is not null
     AND subaffiliate_4 !=''
   GROUP BY subaffiliate_4,
            DATE_TRUNC({{period}},datetime)
   UNION
   SELECT * FROM EVENTS_SUB3),
EVENTS_SUB5 as (SELECT subaffiliate_5 as subaffiliate,
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
          DATE_TRUNC({{period}},datetime) AS {{period}}
   FROM f_events fe
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_5 is not null
     AND subaffiliate_5 !=''
   GROUP BY subaffiliate_5,
            DATE_TRUNC({{period}},datetime)
   UNION
   SELECT * FROM EVENTS_SUB4),
TRANSACTIONS_SUB1 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN transaction_subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN transaction_subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          DATE_TRUNC({{period}},datetime) AS {{period}},
          subaffiliate_1
   FROM f_transactions
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_1 is not null
     AND subaffiliate_1 !=''
   GROUP BY subaffiliate_1,
            DATE_TRUNC({{period}},datetime)),
TRANSACTIONS_SUB2 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN transaction_subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN transaction_subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          DATE_TRUNC({{period}},datetime) AS {{period}},
          subaffiliate_2
   FROM f_transactions
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_2 is not null
     AND subaffiliate_2 !=''
   GROUP BY subaffiliate_2,
            DATE_TRUNC({{period}},datetime)
  UNION
  SELECT * FROM TRANSACTIONS_SUB1),
TRANSACTIONS_SUB3 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN transaction_subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN transaction_subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          DATE_TRUNC({{period}},datetime) AS {{period}},
          subaffiliate_3
   FROM f_transactions
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_3 is not null
     AND subaffiliate_3 !=''
   GROUP BY subaffiliate_3,
            DATE_TRUNC({{period}},datetime)
  UNION
  SELECT * FROM TRANSACTIONS_SUB2),
TRANSACTIONS_SUB4 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN transaction_subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN transaction_subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          DATE_TRUNC({{period}},datetime) AS {{period}},
          subaffiliate_4
   FROM f_transactions
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_4 is not null
     AND subaffiliate_4 !=''
   GROUP BY subaffiliate_4,
            DATE_TRUNC({{period}},datetime)
  UNION
  SELECT * FROM TRANSACTIONS_SUB3),
TRANSACTIONS_SUB5 AS (SELECT sum(amount) sum_amount,
          sum(CASE
                  WHEN transaction_subtype LIKE 'upsell%' THEN amount
                  ELSE 0
              END) sum_upsell,
          count(CASE
                    WHEN transaction_subtype IN ('order','main')
                         AND processor_result ='decline' THEN 1
                    ELSE NULL
                END) decline_count,
          DATE_TRUNC({{period}},datetime) AS {{period}},
          subaffiliate_5 as subaffiliate
   FROM f_transactions
   WHERE 1
    {{filter}}
     AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
     AND subaffiliate_5 is not null
     AND subaffiliate_5 !=''
   GROUP BY subaffiliate_5,
            DATE_TRUNC({{period}},datetime)
  UNION
  SELECT * FROM TRANSACTIONS_SUB4)
SELECT fe.subaffiliate,
       fe.count_click,
       fe.count_partials,
       decode(fe.count_click,0,0, 1.0*fe.count_partials / fe.count_click) AS partials_percent,
       coalesce(decline_count,0) AS decline_count,
       coalesce(decode(decline_count,0,0, 1.0*decline_count / fe.count_click),0) AS declines_percent,
       fe.count_sales,
       decode(fe.count_sales,0,0, 1.0*fe.count_sales / fe.count_click) AS sales_percent,
       fe.count_upsell,
       decode(fe.count_upsell,0,0, 1.0*fe.count_upsell / fe.count_click) AS upsell_percent,
       sum_upsell,
       sum_amount,
       fe.{{period}} AS {{period}}
FROM EVENTS_SUB5 fe RIGHT OUTER JOIN TRANSACTIONS_SUB5 ft
  ON (fe.subaffiliate = ft.subaffiliate AND fe.{{period}} = ft.{{period}})
ORDER BY {{period}} {{order}}
LIMIT {{limit}}
OFFSET {{offset}};
