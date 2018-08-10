WITH agg AS
(
    SELECT
        r.id,
        SUM(rr.item_count) AS returns,
        COUNT(CASE WHEN t.transaction_type = 'refund' OR t.transaction_type = 'reverse' THEN 1 ELSE 0 END) AS refunds,
        COUNT(c.transaction_id) AS chargebacks,
        SUM(t.amount) AS total
    FROM analytics_test.f_rebill r
    LEFT JOIN analytics_test.f_rebill_return rr ON r.id = rr.rebill_id
    LEFT JOIN analytics_test.f_transaction t ON r.id = t.rebill
    LEFT JOIN analytics_test.f_transaction_chargeback c ON t.id = c.transaction_id
    GROUP BY r.id
)
SELECT
	r.id,
	r.alias,
	r.datetime,
	r.amount,
	r.item_count AS items,
	agg.returns,
	agg.refunds,
	agg.chargebacks,
	agg.total,
	r.campaign_id,
	r.campaign_name,
	r.type,
	r.customer_id,
	r.customer_name
FROM analytics_test.f_rebill r
JOIN agg ON r.id = agg.id
WHERE r.datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
ORDER BY %s %s
LIMIT %L
OFFSET %L;
