insert into f_queue_count(queuename,account,count,datetime)
  (
    select 'delivered','d26c1887-7ad4-4a44-be0b-e80dbce22774',523432,date'2017-03-01T17:23:43.043Z'
    UNION
    select 'hold','d26c1887-7ad4-4a44-be0b-e80dbce22774',523432,date'2017-03-01T17:23:43.043Z'
    UNION
    select 'bill','d26c1887-7ad4-4a44-be0b-e80dbce22774',523432,date'2017-03-01T17:23:43.043Z'
    UNION
    select 'bill','d26c1887-7ad4-4a44-be0b-e80dbce22774',212,date'2017-03-02T17:23:43.043Z'
    UNION
    select 'bill','d26c1887-7ad4-4a44-be0b-e80dbce22774',21,date'2017-03-02T00:23:43.043Z'
  )
    EXCEPT
    SELECT queuename,account,count,datetime from f_queue_count;
