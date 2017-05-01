SELECT
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'new' THEN 1
        ELSE 0
      END
  ) AS new_sale_count,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'new' THEN amount
        ELSE 0
      END
  ) AS new_sale_amount,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'rebill' THEN 1
        ELSE 0
      END
  ) AS rebill_sale_count,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'rebill' THEN amount
        ELSE 0
      END
  ) AS rebill_sale_amount,
  SUM(
      CASE
        WHEN processor_result = 'decline'  THEN 1
        ELSE 0
      END
  ) AS declines_count,
  SUM(
      CASE
        WHEN processor_result = 'decline'  THEN amount
        ELSE 0
      END
  ) AS declines_amount,
  SUM(
      CASE
        WHEN processor_result = 'error'  THEN 1
        ELSE 0
      END
  ) AS error_count,
  SUM(
      CASE
        WHEN processor_result = 'error'  THEN amount
        ELSE 0
      END
  ) AS error_amount,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'new' AND transaction_subtype='upsell' THEN 1
        ELSE 0
      END
  ) AS upsell_sale_count,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'new' AND transaction_subtype='upsell' THEN amount
        ELSE 0
      END
  ) AS upsell_sale_amount,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'new' AND transaction_subtype ='main' THEN 1
        ELSE 0
      END
  ) AS main_sale_count,
  SUM(
      CASE
        WHEN processor_result = 'success' AND transaction_type = 'new' AND transaction_subtype ='main' THEN amount
        ELSE 0
      END
  ) AS main_sale_amount
FROM f_transactions
WHERE 1
  {{filter}}
  AND   datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}';
