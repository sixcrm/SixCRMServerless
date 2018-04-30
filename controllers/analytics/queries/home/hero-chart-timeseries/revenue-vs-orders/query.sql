SELECT
	s.generate_series as datetime,
	COALESCE(o.orders, 0) as orders,
	COALESCE(tr.revenue, 0) as revenue
FROM
	(	SELECT *
		FROM generate_series( %L::DATE + '00:00:00'::TIME, %L::DATE + '00:00:00'::TIME, %L::interval)) s
LEFT OUTER JOIN
	( SELECT COUNT ( 1 ) AS orders,
		DATE_TRUNC(%L, datetime) as datetime
		FROM analytics.f_event
		WHERE datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME
			AND "type" = 'order' %s
		GROUP BY DATE_TRUNC(%L, datetime)
		) o
ON s.generate_series = o.datetime
LEFT OUTER JOIN
	( SELECT SUM ( amount ) AS revenue,
		DATE_TRUNC(%L, datetime) as datetime
		FROM analytics.f_transaction
		WHERE datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME
			AND transaction_type = 'sale' AND processor_result = 'success' %s
		GROUP BY DATE_TRUNC(%L, datetime)
		) tr
ON s.generate_series = tr.datetime;
