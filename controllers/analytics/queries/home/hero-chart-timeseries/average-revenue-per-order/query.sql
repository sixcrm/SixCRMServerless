SELECT
	s.generate_series as datetime,
	CASE o.orders
		WHEN 0 THEN 0
		ELSE tr.revenue / o.orders
	END AS averageRevenue
FROM
	(	SELECT *
		FROM generate_series( '{{start}}'::DATE + '00:00:00'::TIME, '{{end}}'::DATE + '00:00:00'::TIME, '1 {{period}}'::interval)) s
LEFT OUTER JOIN
	( SELECT COUNT ( 1 ) AS orders,
		DATE_TRUNC('{{period}}', datetime) as datetime
		FROM analytics.f_events 
		WHERE datetime BETWEEN TIMESTAMP '{{start}}'::DATE + '00:00:00'::TIME AND TIMESTAMP '{{end}}'::DATE + '23:59:59'::TIME AND "type" = 'order' {{filter}}
		GROUP BY DATE_TRUNC('{{period}}', datetime)
		) o
ON s.generate_series = o.datetime
LEFT OUTER JOIN
	( SELECT SUM ( amount ) AS revenue,
		DATE_TRUNC('{{period}}', datetime) as datetime
		FROM analytics.f_transactions
		WHERE processor_result = 'success' AND datetime BETWEEN TIMESTAMP '{{start}}'::DATE + '00:00:00'::TIME AND TIMESTAMP '{{end}}'::DATE + '23:59:59'::TIME {{filter}}
		GROUP BY DATE_TRUNC('{{period}}', datetime)
		) tr
ON s.generate_series = tr.datetime;