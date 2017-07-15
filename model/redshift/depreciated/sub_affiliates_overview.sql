select
  affiliate,
  sum(amount)
from dev.public.f_transactions
where 1
  AND datetime BETWEEN TIMESTAMP '01.01.2017' AND TIMESTAMP '07.01.2017'
group by affiliate;