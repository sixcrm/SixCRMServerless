SELECT
	s.generate_series as datetime,
	COALESCE(d.direct, 0) as direct,
	COALESCE(r.rebill, 0) as rebill
FROM
	(	SELECT *
		FROM generate_series( '{{start}}'::DATE + '00:00:00'::TIME, '{{end}}'::DATE + '00:00:00'::TIME, '1 {{period}}'::interval)) s
LEFT OUTER JOIN
	( SELECT SUM ( amount ) AS direct,
		DATE_TRUNC('{{period}}', datetime) as datetime
		FROM analytics.f_transactions 
		WHERE datetime BETWEEN TIMESTAMP '{{start}}'::DATE + '00:00:00'::TIME AND TIMESTAMP '{{end}}'::DATE + '23:59:59'::TIME AND "type" = 'new' AND subtype = 'main' {{filter}}
		GROUP BY DATE_TRUNC('{{period}}', datetime)
		) d
ON s.generate_series = d.datetime
LEFT OUTER JOIN
	( SELECT SUM ( amount ) AS rebill,
		DATE_TRUNC('{{period}}', datetime) as datetime
		FROM analytics.f_transactions 
		WHERE datetime BETWEEN TIMESTAMP '{{start}}'::DATE + '00:00:00'::TIME AND TIMESTAMP '{{end}}'::DATE + '23:59:59'::TIME AND "type" = 'rebill' {{filter}}
		GROUP BY DATE_TRUNC('{{period}}', datetime)
		) r
ON s.generate_series = r.datetime;