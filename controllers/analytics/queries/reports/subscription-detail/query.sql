SELECT
	s.rebill_id,
	s.product_schedule_id,
	s.rebill_alias,
	s.product_schedule_name,
	s.status,
	s.cycle,
	s.interval,
	s.session_alias,
	s.session,
	s.datetime,
	s.amount,
	s.item_count AS items,
	s.campaign,
	s.campaign_name,
	s.merchant_provider_name,
	s.merchant_provider,
	s.customer,
	s.customer_name
FROM analytics.f_subscription s
WHERE s.datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
ORDER BY %s %s
LIMIT %L
OFFSET %L;
