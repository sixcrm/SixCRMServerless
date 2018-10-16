WITH agg AS (
    SELECT
        r.id,
        SUM(CASE WHEN t.processor_result = 'success' AND (t.transaction_type = 'refund' OR t.transaction_type = 'reverse') THEN t.amount ELSE 0 END) AS refunds,
        COUNT(c.transaction_id) AS chargebacks,
		SUM(CASE WHEN t.processor_result = 'success' THEN 0 ELSE 1 END) AS errors,
        SUM(CASE WHEN t.processor_result = 'success' THEN t.amount ELSE 0 END) AS total
    FROM analytics.f_rebill r
    LEFT JOIN analytics.f_transaction t ON r.id = t.rebill
    LEFT JOIN analytics.f_transaction_chargeback c ON t.id = c.transaction_id
    GROUP BY r.id
), rr AS (
	SELECT rebill_id, SUM(item_count) AS returns
	FROM analytics.f_rebill_return
	GROUP BY rebill_id
)
SELECT
	r.id,
	r.alias,
	CASE WHEN agg.errors > 0 THEN 'error' ELSE r.status END AS status,
	r.datetime,
	r.amount,
	r.item_count AS items,
    COALESCE(rr.returns, 0) AS returns,
	COALESCE(agg.refunds, 0) AS refunds,
	COALESCE(agg.chargebacks, 0) AS chargebacks,
	COALESCE(agg.total, 0) AS total,
	r.campaign,
	r.campaign_name,
	r.type,
	r.customer,
	r.customer_name
FROM analytics.f_rebill r
LEFT JOIN agg ON r.id = agg.id
LEFT JOIN rr ON r.id = rr.rebill_id
WHERE r.datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
ORDER BY %s %s
LIMIT %L
OFFSET %L;
