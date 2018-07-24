SELECT
  t.datetime,
  CASE WHEN c.transaction_id IS NULL 'no' ELSE 'yes' AS chargeback,
  t.processor_result AS response,
  CASE WHEN t.transaction_type = 'sale' t.amount ELSE 0 AS amount,
  CASE WHEN t.transaction_type = 'refund' t.amount WHEN t.transaction_type = 'reverse' t.amount ELSE 0 AS refund,
  t.merchant_provider_name,
  t.alias,
  t.rebill_alias,
  t.session_alias,
  t.creditcard,
  t.customer_name
FROM analytics.f_transaction t
LEFT JOIN analytics.f_transaction_chargeback c ON c.transaction_id = t.id
