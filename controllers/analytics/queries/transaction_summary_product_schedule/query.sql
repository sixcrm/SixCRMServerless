SELECT
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' THEN 1
        ELSE 0
      END
  ),0) AS new_sale_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' THEN amount
        ELSE 0
      END
  ),0) AS new_sale_amount,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'rebill' THEN 1
        ELSE 0
      END
  ),0) AS rebill_sale_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'rebill' THEN amount
        ELSE 0
      END
  ),0) AS rebill_sale_amount,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'decline'  THEN 1
        ELSE 0
      END
  ),0) AS declines_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'decline'  THEN amount
        ELSE 0
      END
  ),0) AS declines_amount,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'error'  THEN 1
        ELSE 0
      END
  ),0) AS error_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'error'  THEN amount
        ELSE 0
      END
  ),0) AS error_amount,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' AND subtype='upsell' THEN 1
        ELSE 0
      END
  ),0) AS upsell_sale_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' AND subtype='upsell' THEN amount
        ELSE 0
      END
  ),0) AS upsell_sale_amount,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' AND subtype ='main' THEN 1
        ELSE 0
      END
  ),0) AS main_sale_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'new' AND subtype ='main' THEN amount
        ELSE 0
      END
  ),0) AS main_sale_amount
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}';
