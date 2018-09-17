SELECT
	s.id,
	s.alias,
	s.status,
	s.cycle,
	s.interval,
	s.datetime,
	s.amount,
	s.item_count AS items,
	s.campaign,
	s.campaign_name,
	s.customer,
	s.customer_name
FROM analytics.f_subscription s
WHERE s.datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
ORDER BY %s %s
LIMIT %L
OFFSET %L;
