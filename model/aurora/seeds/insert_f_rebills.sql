insert into analytics.f_rebills
(select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62e','bill','','e2da743b-1531-4b7d-aa3e-fa6cb080e18b', '2017-04-06T18:40:41.405Z'::timestamp
  UNION
select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62f','hold','bill','e2da743b-1531-4b7d-aa3e-fa6cb080e18b','2017-04-07T18:40:41.405Z'::timestamp
  UNION
select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62g','pending','hold','e2da743b-1531-4b7d-aa3e-fa6cb080e18b',timestamp'2017-04-08T19:40:41.405Z'
  UNION
select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62v','shipped','pending','e2da743b-1531-4b7d-aa3e-fa6cb080e18b',timestamp'2017-04-09T18:40:41.405Z'
  UNION
select '3ff106b8-4ad0-4d1e-8082-d6894f4ea62z','delivered','shipped','e2da743b-1531-4b7d-aa3e-fa6cb080e18b',timestamp'2017-04-10T18:40:41.405Z'
EXCEPT
select
  id_rebill,
  current_queuename,
  previous_queuename,
  account,
  datetime
from analytics.f_rebills
);
