SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'f_transactions'

select *
from f_transactions
limit 3+1
offset 1;