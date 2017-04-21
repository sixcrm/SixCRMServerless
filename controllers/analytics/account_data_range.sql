/* 
19.04.2017 A.Zelen

For a given account and a given date range, return the aggregated transactions by time period, transaction type and processor result. 
account info and date range should be feed in, perhaps even the type of datapoint 

*/

select /* Granularity by day*/
type,
result,
date_trunc('day',stamp) as m_timestamp,
count(*) as transaction_count,
sum(amount) as sum_of_amount 
from 
f_transactions
where account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
and stamp between date'03.01.2017' and date'03.31.2017'
group by result,type,date_trunc('day',stamp)
order by 3 desc;

select /* Granularity by minutes */
type,
result,
date_trunc('minute',stamp) as m_timestamp,
count(*) as transaction_count,
sum(amount) as sum_of_amount 
from 
f_transactions
where account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
and stamp between date'03.01.2017' and date'03.31.2017'
group by result,type,date_trunc('minute',stamp)
order by 3 desc;


select /* All transactions  */
type,
result,
count(*) as transaction_count,
sum(amount) as sum_of_amount 
from 
f_transactions
where account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
and stamp between date'03.01.2017' and date'03.31.2017'
group by result,type
order by 3 desc;



