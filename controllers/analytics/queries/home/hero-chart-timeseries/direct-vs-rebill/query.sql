SELECT
	s.generate_series as datetime,
	COALESCE(d.direct, 0) as direct,
	COALESCE(r.rebill, 0) as rebill
FROM
	(	SELECT *
		FROM generate_series( %L::DATE + '00:00:00'::TIME, %L::DATE + '00:00:00'::TIME, %L::interval)) s
LEFT OUTER JOIN
	( SELECT SUM ( amount ) AS direct,
		DATE_TRUNC(%L, datetime) as datetime
		FROM analytics.f_transaction
		WHERE datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME AND "type" = 'new' AND subtype = 'main' %s
		GROUP BY DATE_TRUNC(%L, datetime)
		) d
ON s.generate_series = d.datetime
LEFT OUTER JOIN
	( SELECT SUM ( amount ) AS rebill,
		DATE_TRUNC(%L, datetime) as datetime
		FROM analytics.f_transaction
		WHERE datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME AND "type" = 'rebill' %s
		GROUP BY DATE_TRUNC(%L, datetime)
		) r
ON s.generate_series = r.datetime;
