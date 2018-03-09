INSERT INTO d_datetime(datetime)
SELECT dd
FROM generate_series( '2017-01-01'::timestamp, '2017-01-02'::timestamp, '1 second'::interval) dd
EXCEPT
SELECT datetime
FROM d_datetime;
