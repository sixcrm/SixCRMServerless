SELECT coalesce(SUM(fe.count_click),0) AS count_click,
       coalesce(SUM(fe.count_partials),0) AS count_partials,
       coalesce(SUM(
         case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_partials / fe.count_click
         end
       ),0) AS partials_percent,
       coalesce(SUM(coalesce(fail_count,0)),0) AS fail_count,
       coalesce(SUM(
         coalesce(
           case
            when fe.count_click = 0 then 0
            else 1.0*fail_count / fe.count_click
           end
       ,0)),0) AS fail_percent,
       coalesce(SUM(fe.count_sales),0) AS count_sales,
       coalesce(SUM(
         case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_sales / fe.count_click
         end
       ),0) AS sales_percent,
       coalesce(SUM(fe.count_upsell),0) AS count_upsell,
       coalesce(SUM(
         case
          when coalesce(fe.count_click,0) = 0 then 0
          else 1.0*fe.count_upsell / fe.count_click
         end
       ),0) AS upsell_percent,
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
                    WHEN type= 'upsell' THEN 1
                    ELSE NULL
                END) count_upsell,
          count(CASE
                    WHEN type ='order' THEN 1
                    ELSE NULL
                END) count_sales
   FROM analytics.f_event fe
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
                         AND processor_result ='fail' THEN 1
                    ELSE NULL
                END) fail_count,
          affiliate
   FROM analytics.f_transaction
   WHERE 1=1
    {{filter}}
   AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
   GROUP BY affiliate) ft ON (fe.affiliate = ft.affiliate)
