insert into f_rebills
  (select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62e','bill','','d26c1887-7ad4-4a44-be0b-e80dbce22774',timestamp'2017-10-06T18:40:41.405Z'
  UNION
select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62e','hold','bill','d26c1887-7ad4-4a44-be0b-e80dbce22774',timestamp'2017-10-07T18:40:41.405Z'
EXCEPT
select
  id_rebill,
  current_queuename,
  previous_queuename,
  account,
  datetime
from
f_rebills
);
