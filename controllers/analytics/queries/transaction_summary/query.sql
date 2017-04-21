select /* Aggregation by processor amount  */
result, sum(amount) as sum_amount , count(*) as transaction_count
from
f_transactions
where account = $1::text
and stamp between $2::text and $3::text
group by result
