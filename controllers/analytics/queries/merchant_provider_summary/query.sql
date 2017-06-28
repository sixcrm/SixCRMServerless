select
merchant_provider,
sum(case
    when date_trunc('day', getdate()) = date_trunc('day', datetime) then 1
    else 0
    end
   ) num_transactions_today,
sum(case
    when date_trunc('week', getdate()) = date_trunc('week', datetime) then 1
    else 0
    end
   ) num_transactions_week,
sum(case
    when date_trunc('month', getdate()) = date_trunc('month', datetime) then 1
    else 0
    end
   ) num_transactions_month,
sum(case
    when date_trunc('day', getdate()) = date_trunc('day', datetime) then amount
    else 0
    end
   )  amount_transactions_today,
sum(case
    when date_trunc('week', getdate()) = date_trunc('week', datetime) then amount
    else 0
    end
   ) amount_transactions_week,
sum(case
    when date_trunc('month', getdate()) = date_trunc('month', datetime) then amount
    else 0
    end
   ) amount_transactions_month
from f_transactions
where 1
{{filter}}
and datetime between  add_months(getdate(),-1) and getdate()
group by merchant_provider;
