INSERT INTO d_datetime(datetime)
SELECT dd
FROM generate_series( current_date-5, current_date, '1 second'::interval) dd
EXCEPT
SELECT datetime
FROM d_datetime;
