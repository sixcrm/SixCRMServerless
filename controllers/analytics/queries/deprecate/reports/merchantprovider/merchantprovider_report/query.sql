SELECT
  merchant_provider,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' THEN 1
        ELSE 0
      END
  ),0) AS sale_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' THEN amount
        ELSE 0
      END
  ),0) AS sale_gross_revenue,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'refund' THEN amount
        ELSE 0
      END
  ),0) AS refund_expenses,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'refund' THEN 1
        ELSE 0
      END
  ),0) AS refund_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' THEN amount
        ELSE 0
      END
  ),0) -
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'refund' THEN amount
        ELSE 0
      END
  ),0) AS net_revenue,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' AND datetime >= DATE_TRUNC('Month',current_date) THEN 1
        ELSE 0
      END
  ),0) AS mtd_sales_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' AND datetime >= DATE_TRUNC('Month',current_date) THEN amount
        ELSE 0
      END
  ),0) AS mtd_gross_count
FROM analytics.f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY merchant_provider
LIMIT {{limit}}
OFFSET {{offset}};