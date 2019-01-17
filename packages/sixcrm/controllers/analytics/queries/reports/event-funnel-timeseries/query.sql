SELECT
	 i.generate_series as datetime,
	 COALESCE(e.eventCount, 0) AS eventCount
FROM (SELECT * FROM generate_series( %L::DATE + '00:00:00'::TIME, %L::DATE + '00:00:00'::TIME, %L::interval )) i
LEFT OUTER JOIN (
		SELECT COUNT ( 1 ) AS eventCount,
		DATE_TRUNC(%L, datetime) as datetime
		FROM analytics.f_event f
		WHERE datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME AND "type" = %L %s
		GROUP BY DATE_TRUNC(%L, datetime)
) e
ON e.datetime = i.generate_series
