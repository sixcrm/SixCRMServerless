SELECT
  cba.campaign,
  cba.campaign_name,
  cba.campaign_amount AS amount
FROM (
  SELECT
    t.campaign,
    MAX(t.campaign_name) AS campaign_name,
    COALESCE(SUM(t.amount), 0) AS campaign_amount
  FROM
    analytics.f_transaction t
  WHERE
    %s
    AND t.processor_result = 'success'
    AND t.transaction_type = 'sale'
  GROUP BY
    t.campaign) cba
ORDER BY
  cba.campaign_amount %s
LIMIT %s
