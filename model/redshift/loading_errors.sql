SELECT le.starttime,
       d.query,
       d.line_number,
       d.colname,
       d.value,
       le.raw_line,
       le.err_reason
FROM stl_loaderror_detail d,
     stl_load_errors le
WHERE d.query = le.query
ORDER BY le.starttime DESC LIMIT 100;

SELECT *
FROM stl_load_errors
ORDER BY starttime desc limit 1;


