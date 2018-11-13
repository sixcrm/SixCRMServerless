-- gateway
-- provider_type: only credit cards currently
-- monthly_cap: use the max from the gateway
-- gross_orders	sessions with a transaction
-- sales:	session with at least one successful transaction that is not an upsell
-- sales_percentage:	sales / gross_orders
-- sales_revenue: sum of sales amount
-- declines: session without a successful transaction and at least one failure
-- decline_percentage: declines / gross_orders
-- chargebacks: sessions with a chargeback
-- chargeback_expense: sum of chargebacks
-- chargeback_percentage: chargebacks / sales
-- full_refunds: sessions with a transaction that was fully refunded
-- full_refund_expense: sum of transactions that were fully refunded
-- full_refund_percentage: full_refunds / sales
-- partial_refunds: sessions with a transaction that was partially refunded
-- partial_refund_expense: sum of transactions that were partially refunded
-- partial_refund_percentage: partial_refunds / sales
-- total_refund_expenses: full_refund_expense + partial_refund_expense
-- adjusted_sales_revenue: sales_revenue - (full_refund_expense + partial_refund_expense)

SELECT
	gateways.merchant_provider_name as gateway,
	'Credit Card' AS provider_type,
	'USD' AS currency,
	gateways.monthly_cap AS monthly_cap,
	CAST(COALESCE(gross_orders.attempts, 0) AS INT) AS gross_orders,
	CAST(COALESCE(sales.sales, 0) AS INT) AS sales,
	COALESCE(CAST(COALESCE(gross_orders.attempts, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS sales_percentage,
	CAST(ROUND(COALESCE(sales.renveue, 0), 2) AS DOUBLE PRECISION) AS sales_revenue,
	CAST(COALESCE(declines.declines, 0) AS INT) AS declines,
	COALESCE(CAST(COALESCE(declines.declines, 0) AS DOUBLE PRECISION) / CAST(gross_orders.attempts AS DOUBLE PRECISION), 0) AS decline_percentage,
	CAST(COALESCE(chargebacks.chargebacks, 0) AS INT) AS chargebacks,
	CAST(ROUND(COALESCE(chargebacks.chargeback_expense, 0), 2) AS DOUBLE PRECISION) AS chargeback_expense,
	COALESCE(CAST(COALESCE(chargebacks.chargebacks, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS chargeback_percentage,
	CAST(COALESCE(full_refunds.refunds, 0) AS INT) AS full_refunds,
	CAST(ROUND(COALESCE(full_refunds.refunds_expense, 0), 2) AS DOUBLE PRECISION) AS full_refund_expense,
	COALESCE(CAST(COALESCE(full_refunds.refunds, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS full_refund_percentage,
	CAST(COALESCE(partial_refunds.refunds, 0) AS INT) AS partial_refunds,
	CAST(ROUND(COALESCE(partial_refunds.refunds_expense, 0), 2) AS DOUBLE PRECISION) AS partial_refund_expense,
	COALESCE(CAST(COALESCE(partial_refunds.refunds, 0) AS DOUBLE PRECISION) / CAST(sales.sales AS DOUBLE PRECISION), 0) AS partial_refund_percentage,
	CAST(ROUND(COALESCE(full_refunds.refunds_expense, 0) + COALESCE(partial_refunds.refunds_expense, 0), 2) AS DOUBLE PRECISION) AS total_refund_expenses,
	CAST(ROUND(COALESCE(sales.renveue, 0) + COALESCE(full_refunds.refunds_expense, 0) + COALESCE(partial_refunds.refunds_expense, 0), 2) AS DOUBLE PRECISION) AS adjusted_sales_revenue

FROM

	(
		-- all gateways with transactions
		SELECT
			t.merchant_provider,
			t.merchant_provider_name,
			MAX(t.merchant_provider_monthly_cap) as monthly_cap
		FROM analytics.f_transaction t
		INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
		LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
		WHERE %s -- i = 1
		GROUP BY t.merchant_provider, t.merchant_provider_name
	) as gateways

	LEFT OUTER JOIN

	(
		-- sessions with a transaction
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT s.id) as attempts
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
		LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
		WHERE %s -- i = 2
		GROUP BY t.merchant_provider
	) AS gross_orders

	ON gateways.merchant_provider = gross_orders.merchant_provider

	LEFT OUTER JOIN

	(
		-- sessions with a successful transactions that is not an upsell
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT s.id) as sales,
			SUM(t.amount) as renveue
		FROM analytics.f_session s
		INNER JOIN analytics.f_transaction t ON s.id = t.session
		-- only pull transactions with the correct products and schedules
		INNER JOIN (
			SELECT
				DISTINCT t.id
			FROM analytics.f_transaction t
			INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
			LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
			WHERE t.processor_result = 'success' AND t.transaction_type = 'sale' AND t.subtype NOT LIKE 'upsell%' %s -- i = 3
		) sub on sub.id = t.id
		WHERE %s -- i = 4
		GROUP BY t.merchant_provider
	) sales

	ON gateways.merchant_provider = sales.merchant_provider

	LEFT OUTER JOIN

	(
		-- sessions with no successful transactions and at least one failure
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
			INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
			LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
			WHERE %s AND t.processor_result = 'success' AND t.transaction_type = 'sale' --i = 5
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
			INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
			LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
			WHERE %s AND (t.processor_result = 'decline' OR t.processor_result = 'error') AND t.transaction_type = 'sale' -- i = 6
		) sub_failure
		ON s.id = sub_failure.id
		WHERE %s AND sub_success.id IS NULL AND sub_failure.id IS NOT NULL -- i = 7
		GROUP BY sub_failure.merchant_provider
	) declines

	ON gateways.merchant_provider = declines.merchant_provider

	LEFT OUTER JOIN

	(
		-- sessions with a chargeback
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT t.session) AS chargebacks,
			SUM(t.amount) AS chargeback_expense
		FROM analytics.f_transaction t
		-- only pull transactions with the correct products and schedules
		INNER JOIN (
			SELECT
				DISTINCT t.id
			FROM analytics.f_transaction t
			INNER JOIN analytics.f_transaction_chargeback ftc ON ftc.transaction_id = t.id
			INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
			LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
			WHERE 1=1 %s -- i = 8
		) sub on sub.id = t.id
		WHERE %s -- i = 9
		GROUP BY t.merchant_provider
	) chargebacks

	ON gateways.merchant_provider = chargebacks.merchant_provider

	LEFT OUTER JOIN

	(
		-- sessions with transactions that are full refunds
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT t.session) AS refunds,
			SUM(t.amount) AS refunds_expense
		FROM analytics.f_transaction t
		-- only pull transactions with the correct products and schedules
		INNER JOIN (
			SELECT
				DISTINCT t.id
			FROM analytics.f_transaction t
			INNER JOIN analytics.f_transaction associated ON associated.id = t.associated_transaction
			INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
			LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
			WHERE t.processor_result = 'success' AND t.transaction_type = 'refund' AND associated.amount <= t.amount %s -- i = 10
		) sub on sub.id = t.id
		WHERE %s -- i = 11
		GROUP BY t.merchant_provider
	) full_refunds

	ON gateways.merchant_provider = full_refunds.merchant_provider

	LEFT OUTER JOIN

	(
		-- sessions with transactions that are partial refunds
		SELECT
			t.merchant_provider,
			COUNT(DISTINCT t.session) AS refunds,
			SUM(t.amount) AS refunds_expense
		FROM analytics.f_transaction t
		-- only pull transactions with the correct products and schedules
		INNER JOIN (
			SELECT
				DISTINCT t.id
			FROM analytics.f_transaction t
			INNER JOIN analytics.f_transaction associated ON associated.id = t.associated_transaction
			INNER JOIN analytics.f_transaction_product p ON p.transaction_id = t.id
			LEFT OUTER JOIN analytics.f_transaction_product_schedule ps ON ps.transaction_id = t.id
			WHERE t.processor_result = 'success' AND t.transaction_type = 'refund' AND associated.amount > t.amount %s -- i = 12
		) sub on sub.id = t.id
		WHERE %s -- i = 13
		GROUP BY t.merchant_provider
	) partial_refunds

	ON gateways.merchant_provider = partial_refunds.merchant_provider
