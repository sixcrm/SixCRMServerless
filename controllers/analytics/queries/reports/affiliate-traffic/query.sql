-- Partial	Session without a successful transaction
-- Gross orders	Sessions with a transaction
-- Sale	Session with at least one successful transaction
-- Sale Percentage	Sales / Gross Orders
-- Decline	Session without a successful transaction and at least one failure
-- Decline Percentage	Declines / Gross Orders
-- Sales Revenue	SUM of successful transaction amounts
-- Upsell	Sessions with a successful transaction that is of type upsell
-- Average Order Value (AOV) AVERAGE((Sale * Order Price + Upsell * Order Price) / Sales) = (sale revenue + upsell revenue) / sales

SELECT
	clicks.affiliate,
	COALESCE(clicks.clicks, 0) AS clicks,
	COALESCE(partials.partials, 0) AS partials,
	COALESCE(CAST(COALESCE(partials.partials, 0) AS DOUBLE PRECISION) / CAST(clicks.clicks AS DOUBLE PRECISION), 0) AS partials_percentage,
	COALESCE(gross_orders.attempts, 0) AS gross_orders,
	COALESCE(CAST(COALESCE(gross_orders.attempts, 0) AS DOUBLE PRECISION) / CAST(clicks.clicks AS DOUBLE PRECISION), 0) AS gross_order_percentage,
	COALESCE(sales.sales, 0) AS sales,
	COALESCE(CAST(COALESCE(gross_orders.attempts, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS sales_percentage,
	COALESCE(sales.renveue, 0) AS sales_revenue,
	COALESCE(upsells.upsells, 0) AS upsells,
	COALESCE(CAST(COALESCE(upsells.upsells, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS upsells_percentage,
	COALESCE(upsells.renveue, 0) AS upsells_revenue,
	COALESCE(sales.sales, 0) + COALESCE(upsells.upsells, 0) AS blended_sales,
	COALESCE(sales.renveue, 0) + COALESCE(upsells.renveue, 0) AS blended_sales_revenue,
	COALESCE((COALESCE(sales.renveue, 0) + COALESCE(upsells.renveue, 0)) / sales.sales, 0) AS aov,
	COALESCE(declines.declines, 0) AS declines,
	COALESCE(CAST(COALESCE(declines.declines, 0) AS DOUBLE PRECISION) / CAST(gross_orders.attempts AS DOUBLE PRECISION), 0) AS declines_percentage
FROM
(
	-- todo: can we match these based on the session to particular products or schedules?
	SELECT
		s.affiliate,
		COUNT(1) AS clicks
	FROM analytics.f_event s
	WHERE %s AND "type" = 'click' -- i = 1
	GROUP BY s.affiliate
) clicks

LEFT OUTER JOIN

(
	-- sessions with no successful transaction
	SELECT
	 s.affiliate,
	 COUNT(s.id) as partials
	FROM analytics.f_session s
	LEFT OUTER JOIN
		(SELECT
			DISTINCT s.id
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		-- INNER JOIN analytics.f_transaction_product tp ON t.id = tp.transaction_id
		-- LEFT OUTER JOIN analytics.f_transaction_product_schedule tps ON t.id = tps.transaction_id AND tp.product_id = tps.product_id
		WHERE %s AND t.processor_result = 'success') sub_success  -- i = 2
	ON s.id = sub_success.id
	WHERE %s AND sub_success.id IS NULL  -- i = 3
	GROUP BY s.affiliate

) partials

ON clicks.affiliate = partials.affiliate

LEFT OUTER JOIN

(
	-- sessions with no successful transactions and at least one failure
	SELECT
	 s.affiliate,
	 COUNT(s.id) as declines
	FROM analytics.f_session s
	LEFT OUTER JOIN
		(
		--sessions with a success
		SELECT
			DISTINCT s.id
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		-- INNER JOIN analytics.f_transaction_product tp ON t.id = tp.transaction_id
		-- LEFT OUTER JOIN analytics.f_transaction_product_schedule tps ON t.id = tps.transaction_id AND tp.product_id = tps.product_id
		WHERE %s AND t.processor_result = 'success') sub_success  -- i = 4
	ON s.id = sub_success.id
	LEFT OUTER JOIN
		(
		--sessions with a failure
		SELECT
			DISTINCT s.id
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		-- INNER JOIN analytics.f_transaction_product tp ON t.id = tp.transaction_id
		-- LEFT OUTER JOIN analytics.f_transaction_product_schedule tps ON t.id = tps.transaction_id AND tp.product_id = tps.product_id
		WHERE %s AND t.processor_result = 'fail') sub_failure  -- i = 5
	ON s.id = sub_failure.id
	WHERE %s AND sub_success.id IS NULL AND sub_failure.id IS NOT NULL  -- i = 6
	GROUP BY s.affiliate

) declines

ON clicks.affiliate = declines.affiliate

LEFT OUTER JOIN

(
	-- sessions with transactions
	SELECT
		COUNT(DISTINCT s.id) as attempts,
		s.affiliate
	FROM analytics.f_session s
	INNER JOIN analytics.f_transaction t ON s.id = t.session
	-- INNER JOIN analytics.f_transaction_product tp ON t.id = tp.transaction_id
	-- LEFT OUTER JOIN analytics.f_transaction_product_schedule tps ON t.id = tps.transaction_id AND tp.product_id = tps.product_id
	WHERE %s  -- i = 7
	GROUP BY s.affiliate
) gross_orders

ON clicks.affiliate = gross_orders.affiliate

LEFT OUTER JOIN

(
	-- sessions with a successful transactions that is not an upsell
	SELECT
		COUNT(DISTINCT s.id) as sales,
		SUM(t.amount) as renveue,
		s.affiliate
	FROM analytics.f_session s
	INNER JOIN analytics.f_transaction t ON s.id = t.session
	-- INNER JOIN (
	-- 	SELECT DISTINCT id
	-- 	FROM analytics.f_transaction t
		-- INNER JOIN analytics.f_transaction_product tp ON t.id = tp.transaction_id
		-- LEFT OUTER JOIN analytics.f_transaction_product_schedule tps ON t.id = tps.transaction_id AND tp.product_id = tps.product_id
	-- 	WHERE 1 = 1 %s --filter on product id  -- i = 8
	-- ) tp ON tp.id = t.id
	WHERE %s AND t.processor_result = 'success' AND t.subtype NOT LIKE 'upsell%'  -- i = 9
	GROUP BY s.affiliate
) sales

ON clicks.affiliate = sales.affiliate

LEFT OUTER JOIN

(
	-- sessions with a successful transaction that is an upsell
	SELECT
		COUNT(DISTINCT s.id) as upsells,
		SUM(t.amount) as renveue,
		s.affiliate
	FROM analytics.f_session s
	INNER JOIN analytics.f_transaction t ON s.id = t.session
	-- INNER JOIN (
	-- 	SELECT DISTINCT id
	-- 	FROM analytics.f_transaction t
		-- INNER JOIN analytics.f_transaction_product tp ON t.id = tp.transaction_id
		-- LEFT OUTER JOIN analytics.f_transaction_product_schedule tps ON t.id = tps.transaction_id AND tp.product_id = tps.product_id
	-- 	WHERE 1 = 1 %s --filter on product id  -- i = 10
	-- ) tp ON tp.id = t.id
	WHERE %s AND t.processor_result = 'success' AND t.subtype LIKE 'upsell%'  -- i = 11
	GROUP BY s.affiliate
) upsells

ON clicks.affiliate = upsells.affiliate