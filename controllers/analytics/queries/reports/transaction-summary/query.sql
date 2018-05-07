SELECT
	s.generate_series as datetime,
	id AS processor_result,
	CAST(COALESCE(e.count, 0) AS INT) AS transaction_count,
	CAST(COALESCE(e.amount, 0) AS DOUBLE PRECISION) AS transaction_total
FROM analytics.d_processor_result pr
CROSS JOIN (SELECT * FROM generate_series( %L::DATE + '00:00:00'::TIME, %L::DATE + '23:59:59'::TIME, %L::interval )) s
LEFT OUTER JOIN (
		SELECT
			f.processor_result,
			COUNT ( 1 ) AS count,
			SUM(f.amount) AS amount,
			DATE_TRUNC(%L, datetime) AS datetime
		FROM analytics.f_transaction f
		WHERE datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
		GROUP BY DATE_TRUNC(%L, datetime), f.processor_result
) e ON e.datetime = s.generate_series AND e.processor_result = pr.id
ORDER BY s.generate_series;
