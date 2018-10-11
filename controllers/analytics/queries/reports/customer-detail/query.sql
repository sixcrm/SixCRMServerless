WITH o AS (
    SELECT
        customer,
        COUNT(1) AS orders,
        SUM(amount) AS total_sale_amount,
        COUNT(rr.rebill_id) AS returns
    FROM analytics.f_rebill r
    LEFT JOIN analytics.f_rebill_return rr ON r.id = rr.rebill_id
    GROUP BY customer
), t AS (
    SELECT
        customer,
        COUNT(1) AS refunds,
        SUM(amount) AS refund_amount
    FROM analytics.f_transaction
    WHERE transaction_type = 'refund'
    GROUP BY customer
)
SELECT
	CASE WHEN o.orders IS NULL THEN 'partial' ELSE 'active' END AS status,
    firstname,
    lastname,
    email,
    phone,
    city,
    state,
    zip,
    created_at,
    updated_at,
    COALESCE(o.orders, 0) AS orders,
    COALESCE(o.total_sale_amount, 0) AS total_sale_amount,
    COALESCE(o.returns, 0) AS returns,
    COALESCE(t.refunds, 0) AS refunds,
    COALESCE(t.refund_amount, 0) AS refund_amount
FROM analytics.d_customer c
LEFT JOIN o ON c.id = o.customer
LEFT JOIN t ON c.id = t.customer
WHERE c.created_at BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
ORDER BY %s %s
LIMIT %L
OFFSET %L;
