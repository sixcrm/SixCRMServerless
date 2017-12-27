SELECT coalesce(SUM(fe.count_click),0) AS count_click,
       coalesce(SUM(fe.count_partials),0) AS count_partials,
       SUM(
         case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_partials / fe.count_click
         end
       ) AS partials_percent,
       SUM(coalesce(decline_count,0)) AS decline_count,
       SUM(
         coalesce(
           case
            when decline_count = 0 then 0
            else 1.0*decline_count / fe.count_click
           end
       ,0)) AS declines_percent,
       coalesce(SUM(fe.count_sales),0) AS count_sales,
       SUM(
         case
          when coalesce(fe.count_sales,0) = 0 then 0
          else 1.0*fe.count_sales / fe.count_click
         end
       ) AS sales_percent,
       coalesce(SUM(fe.count_upsell),0) AS count_upsell,
       SUM(
         case
          when coalesce(fe.count_upsell,0) = 0 then 0
          else 1.0*fe.count_upsell / fe.count_click
         end
       ) AS upsell_percent,
       coalesce(SUM(sum_upsell),0) AS sum_upsell,
       coalesce(SUM(sum_amount),0) AS sum_amount
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
   WHERE 1=1
    {{filter}}
   AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate) fe
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
          affiliate
   FROM f_transactions
   WHERE 1=1
    {{filter}}
   AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate) ft ON (fe.affiliate = ft.affiliate)
