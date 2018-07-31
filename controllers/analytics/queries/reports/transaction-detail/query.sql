SELECT
  t.id,
  t.alias,
  t.datetime,
  CASE WHEN c.transaction_id IS NULL THEN 'no' ELSE 'yes' END AS chargeback,
  t.processor_result AS response,
  CASE WHEN t.transaction_type = 'sale' THEN t.amount ELSE 0 END AS amount,
  CASE WHEN t.transaction_type = 'refund' THEN t.amount WHEN t.transaction_type = 'reverse' THEN t.amount ELSE 0 END AS refund,
  t.merchant_provider,
  t.merchant_provider_name,
  t.rebill,
  t.rebill_alias,
  t.session,
  t.session_alias,
  t.creditcard,
  t.customer,
  t.customer_name
FROM analytics.f_transaction t
LEFT JOIN analytics.f_transaction_chargeback c ON c.transaction_id = t.id
WHERE t.datetime BETWEEN TIMESTAMP %L::DATE + '00:00:00'::TIME AND TIMESTAMP %L::DATE + '23:59:59'::TIME %s
ORDER BY %s %s
LIMIT %L
OFFSET %L;
