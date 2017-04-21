/* 21.04.2017 A.Zelen
   Queries with processor statuses

*/

select /* Aggregation by processor amount  */
result,sum(amount) as sum_amount ,count(*) as transaction_count
from
f_transactions
where account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
and stamp between date'03.01.2017' and date'03.31.2017'
group by result
