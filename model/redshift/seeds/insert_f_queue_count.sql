insert into f_queue_count(queuename,account,count,datetime)
  (select 'delivered','d3fa3bf3-7824-49f4-8261-87674482bf1c',523432,date'2017-03-01T17:23:43.043Z'
      UNION
    select 'hold','d3fa3bf3-7824-49f4-8261-87674482bf1c',523432,date'2017-03-01T17:23:43.043Z'
      UNION
    select 'bill','d3fa3bf3-7824-49f4-8261-87674482bf1c',523432,date'2017-03-01T17:23:43.043Z')
    EXCEPT
    SELECT queuename,account,count,datetime from f_queue_count;
