-- gross_orders = sessions with a transaction
-- sale =	session with at least one successful transaction that is not an upsell
-- decline = session without a successful transaction and at least one failure
-- decline percentage = 	Declines / Gross Orders

SELECT
	gateways.merchant_provider_name as gateway,
	'Credit Card' AS provider_type,
	'USD' AS currency,
	gateways.monthly_cap AS monthly_cap,
	COALESCE(gross_orders.attempts, 0) AS gross_orders,
	COALESCE(sales.sales, 0) AS sales,
	COALESCE(CAST(COALESCE(gross_orders.attempts, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS sales_percentage,
	COALESCE(sales.renveue, 0) AS sales_revenue,
	COALESCE(declines.declines, 0) AS declines,
	COALESCE(CAST(COALESCE(declines.declines, 0) AS DOUBLE PRECISION) / CAST(gross_orders.attempts AS DOUBLE PRECISION), 0) AS declines_percentage,
	COALESCE(chargebacks.chargebacks, 0) AS chargebacks,
	COALESCE(chargebacks.chargeback_expense, 0) AS chargeback_expense,
	COALESCE(CAST(COALESCE(chargebacks.chargebacks, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS chargeback_percentage,
	0 AS refunds,
	0 AS refund_expenses,
	0 AS refund_percentage,
	0 AS partial_refunds,
	0 AS partial_refund_expenses,
	0 AS partial_refund_percentage,
	0 AS total_refund_expenses,
	0 AS adjusted_sales_revenue

FROM

	(
		SELECT
			t.merchant_provider,
			t.merchant_provider_name,
			MAX(t.merchant_provider_monthly_cap) as monthly_cap
		FROM analytics.f_transaction t
		WHERE t.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00'
		GROUP BY t.merchant_provider, t.merchant_provider_name
	) as gateways

	LEFT OUTER JOIN

	(
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT s.id) as attempts
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		WHERE s.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00'
		GROUP BY t.merchant_provider
	) AS gross_orders

	ON gateways.merchant_provider = gross_orders.merchant_provider

	LEFT OUTER JOIN

	(
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT s.id) as sales,
			SUM(t.amount) as renveue
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		WHERE s.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00' AND t.processor_result = 'success' AND t.transaction_type = 'sale' AND t.subtype NOT LIKE 'upsell%'
		GROUP BY t.merchant_provider
	) sales

	ON gateways.merchant_provider = sales.merchant_provider

	LEFT OUTER JOIN

	(
		SELECT
			sub_failure.merchant_provider,
			COUNT(s.id) as declines
		FROM analytics.f_session s
		LEFT OUTER JOIN
		(
			--sessions with a success
			SELECT DISTINCT
				t.merchant_provider,
				s.id
			FROM analytics.f_session s
			INNER JOIN analytics.f_transaction t ON s.id = t.session
			WHERE s.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00' AND t.processor_result = 'success' AND t.transaction_type = 'sale'
		) sub_success
		ON s.id = sub_success.id
		LEFT OUTER JOIN
		(
			--sessions with a failure
			SELECT DISTINCT
				t.merchant_provider,
				s.id
			FROM analytics.f_session s
			INNER JOIN analytics.f_transaction t ON s.id = t.session
			WHERE s.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00' AND t.processor_result = 'fail' AND t.transaction_type = 'sale'
		) sub_failure
		ON s.id = sub_failure.id
		WHERE s.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00' AND sub_success.id IS NULL AND sub_failure.id IS NOT NULL
		GROUP BY sub_failure.merchant_provider
	) declines

	ON gateways.merchant_provider = declines.merchant_provider

	LEFT OUTER JOIN

	(
		SELECT
			t.merchant_provider,
			COUNT(1) AS chargebacks,
			SUM(t.amount) AS chargeback_expense
		FROM analytics.f_transaction t
		INNER JOIN analytics.f_transaction_chargeback ftc ON ftc.transaction_id = t.id
		WHERE t.datetime BETWEEN '2017-01-01 00:00:00' AND '2019-01-01 00:00:00'
		GROUP BY t.merchant_provider
	) chargebacks

	ON gateways.merchant_provider = chargebacks.merchant_provider


