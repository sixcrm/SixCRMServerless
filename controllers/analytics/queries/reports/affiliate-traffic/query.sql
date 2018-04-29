-- Partial	leads - session with a successful transaction
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
	CAST(COALESCE(clicks.clicks, 0) AS INT) AS clicks,
	CAST(COALESCE(partials.partials, 0) AS INT) AS partials,
	COALESCE(CAST(COALESCE(partials.partials, 0) AS DOUBLE PRECISION) / CAST(clicks.clicks AS DOUBLE PRECISION), 0) AS partials_percentage,
	CAST(COALESCE(gross_orders.attempts, 0) AS INT) AS gross_orders,
	COALESCE(CAST(COALESCE(gross_orders.attempts, 0) AS DOUBLE PRECISION) / CAST(clicks.clicks AS DOUBLE PRECISION), 0) AS gross_order_percentage,
	CAST(COALESCE(sales.sales, 0) AS INT) AS sales,
	COALESCE(CAST(COALESCE(gross_orders.attempts, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS sales_percentage,
	CAST(ROUND(COALESCE(sales.renveue, 0), 2) AS DOUBLE PRECISION) AS sales_revenue,
	CAST(COALESCE(upsells.upsells, 0) AS INT) AS upsells,
	COALESCE(CAST(COALESCE(upsells.upsells, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS upsells_percentage,
	CAST(ROUND(COALESCE(upsells.renveue, 0), 2) AS DOUBLE PRECISION) AS upsells_revenue,
	CAST(COALESCE(sales.sales, 0) + COALESCE(upsells.upsells, 0) AS INT) AS blended_sales,
	CAST(ROUND(COALESCE(sales.renveue, 0) + COALESCE(upsells.renveue, 0), 2) AS DOUBLE PRECISION) AS blended_sales_revenue,
	CAST(ROUND(COALESCE((COALESCE(sales.renveue, 0) + COALESCE(upsells.renveue, 0)) / sales.sales, 0), 2) AS DOUBLE PRECISION) AS aov,
	CAST(COALESCE(declines.declines, 0) AS INT) AS declines,
	COALESCE(CAST(COALESCE(declines.declines, 0) AS DOUBLE PRECISION) / CAST(gross_orders.attempts AS DOUBLE PRECISION), 0) AS declines_percentage
FROM
(
	SELECT
		s.affiliate,
		COUNT(1) AS clicks
	FROM analytics.f_event s
	WHERE %s AND "type" = 'click' -- i = 1
	GROUP BY s.affiliate
) clicks

LEFT OUTER JOIN

(
	-- leads - sessions with successful transaction = partial
	SELECT
		leads.affiliate,
		COALESCE(leads.leads, 0) - COALESCE(sub_success.successes, 0) AS partials
	FROM (SELECT
					s.affiliate,
					COUNT(1) AS leads
				FROM analytics.f_event s
				WHERE %s AND "type" = 'lead' -- i = 2
				GROUP BY s.affiliate
	) leads
	INNER JOIN (
		SELECT
			s.affiliate,
			COUNT(DISTINCT s.id) as successes
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		WHERE %s AND t.processor_result = 'success' AND t.transaction_type = 'sale'
		GROUP BY s.affiliate) sub_success -- i = 3
	ON leads.affiliate = sub_success.affiliate

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
		WHERE %s AND t.processor_result = 'success' AND t.transaction_type = 'sale') sub_success  -- i = 4
	ON s.id = sub_success.id
	LEFT OUTER JOIN
		(
		--sessions with a failure
		SELECT
			DISTINCT s.id
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		WHERE %s AND t.processor_result = 'fail' AND t.transaction_type = 'sale') sub_failure  -- i = 5
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
	WHERE %s AND t.processor_result = 'success' AND t.transaction_type = 'sale' AND t.subtype NOT LIKE 'upsell%'  -- i = 8
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
	WHERE %s AND t.processor_result = 'success' AND t.transaction_type = 'sale' AND t.subtype LIKE 'upsell%'  -- i = 9
	GROUP BY s.affiliate
) upsells

ON clicks.affiliate = upsells.affiliate
