select /* Aggregation by processor amount  */
result, sum(amount) as sum_amount , count(*) as transaction_count
from
f_transactions
where account = $1::text
and stamp between date'3.1.2017' and date'3.31.2017'
group by result
