SELECT
  fe.affiliate,
  fe.count_click,
  fe.count_partials,
  decode(fe.count_click,0,0, 1.0*fe.count_partials / fe.count_click) partials_percent,
  coalesce(decline_count,0),
  coalesce(decode(decline_count,0,0, 1.0*decline_count / fe.count_click),0) declines_percent,
  fe.count_sales,
  decode(fe.count_sales,0,0, 1.0*fe.count_sales / fe.count_click) sales_percent,
  fe.count_upsell,
  decode(fe.count_upsell,0,0, 1.0*fe.count_upsell / fe.count_click) upsell_percent,
  sum_upsell,
  sum_amount,
  sum(sum_amount) over () all_sum_amount
FROM
(select
  affiliate,
  count( case when type='click' then 1 else null end) count_click,
  count( case when type='lead' then 1 else null end) count_partials,
  count( case when type like 'upsell%' then 1 else null end) count_upsell,
  count( case when type ='order' then 1 else null end) count_sales
from
f_events fe
where account ='d3fa3bf3-7824-49f4-8261-87674482bf1c'
  and datetime between '01-07-2017' and '05-07-2017'
group by affiliate)  fe RIGHT OUTER JOIN
(select
  sum(amount) sum_amount,
  sum(case when subtype like 'upsell%' then amount else 0 end ) sum_upsell,
  count(case when subtype in ('order','main') and processor_result ='decline' then 1 else null end ) decline_count,
  affiliate
from f_transactions
where account ='d3fa3bf3-7824-49f4-8261-87674482bf1c'
  and datetime between '01-07-2017' and '05-07-2017'
group by affiliate) ft
ON (fe.affiliate = ft.affiliate);


select distinct subtype from f_transactions;

select * from d_processor_result;
