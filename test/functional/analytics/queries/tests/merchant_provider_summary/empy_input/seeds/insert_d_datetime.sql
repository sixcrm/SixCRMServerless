INSERT INTO analytics.d_datetime(datetime)
SELECT dd
FROM generate_series( current_date-5, current_date, '1 second'::interval) dd
EXCEPT
SELECT datetime
FROM analytics.d_datetime;
