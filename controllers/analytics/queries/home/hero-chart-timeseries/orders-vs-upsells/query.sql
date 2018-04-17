SELECT
	s.generate_series as datetime,
	COALESCE(o.orders, 0) as orders,
	COALESCE(u.upsells, 0) as upsells
FROM
	(	SELECT *
		FROM generate_series( '{{start}}'::DATE + '00:00:00'::TIME, '{{end}}'::DATE + '00:00:00'::TIME, '1 {{period}}'::interval)) s
LEFT OUTER JOIN
	( SELECT COUNT ( 1 ) AS orders,
		DATE_TRUNC('{{period}}', datetime) as datetime
		FROM analytics.f_event
		WHERE datetime BETWEEN TIMESTAMP '{{start}}'::DATE + '00:00:00'::TIME AND TIMESTAMP '{{end}}'::DATE + '23:59:59'::TIME AND "type" = 'order' {{filter}}
		GROUP BY DATE_TRUNC('{{period}}', datetime)
		) o
ON s.generate_series = o.datetime
LEFT OUTER JOIN
	( SELECT COUNT ( 1 ) AS upsells,
		DATE_TRUNC('{{period}}', datetime) as datetime
		FROM analytics.f_transaction
		WHERE datetime BETWEEN TIMESTAMP '{{start}}'::DATE + '00:00:00'::TIME AND TIMESTAMP '{{end}}'::DATE + '23:59:59'::TIME AND "type" = 'new' AND "subtype" LIKE 'upsell%' {{filter}}
		GROUP BY DATE_TRUNC('{{period}}', datetime)
		) u
ON s.generate_series = u.datetime;
