SELECT
	ps.product_schedule_name AS name,
	SUM(t.amount) AS amount
FROM analytics.f_transaction t
INNER JOIN analytics.f_transaction_product_schedule ps on ps.transaction_id = t.id
WHERE %s AND t.processor_result = 'success' AND t.transaction_type = 'sale'
GROUP BY ps.product_schedule_id, ps.product_schedule_name
ORDER BY SUM(t.amount) %s
LIMIT %s
