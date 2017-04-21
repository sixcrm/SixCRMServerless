/* 
20.04.2017 A.Zelen

For the last 30 days from this point in time add transaction count and sum_of_transactions

Req : timothydalbey 

    I?ll need to ask a bout a specific merchant process
    merchant_provider rather
    and I?ll need to ask for the same results across a group of merchant_providers
    and I?ll need to be able to specify the date range as parameters, as well as the account

*/

select /* Last 30 days by account  */
merchprocessor,
count(*) as transaction_count,
sum(amount) as sum_of_transactions
from 
f_transactions
where account = 'df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
and stamp between sysdate-30 and sysdate
group by merchprocessor;

select /* By merchprocessor list and date list*/
merchprocessor,
count(*) as transaction_count,
sum(amount) as sum_of_transactions
from 
f_transactions
where merchprocessor in ( '72473695-2691-51f9-a305-5c7d814f2882','2863e314-aee3-5cf9-a0c7-649ad06a49e1')
and stamp between date'03.01.2017' and date'03.31.2017'
group by merchprocessor

select /* By merchprocessor list, date list and account */
merchprocessor,
count(*) as transaction_count,
sum(amount) as sum_of_transactions
from 
f_transactions
where merchprocessor in ( '72473695-2691-51f9-a305-5c7d814f2882','2863e314-aee3-5cf9-a0c7-649ad06a49e1')
and account ='df6a75c8-67d1-5ec2-8d54-94ae46d817b3'
and stamp between date'03.01.2017' and date'03.31.2017'
group by merchprocessor;

