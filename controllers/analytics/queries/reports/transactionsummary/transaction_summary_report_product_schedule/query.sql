/* transaction_summary_report */

SELECT
  date_trunc('day',datetime)  AS period,
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
  ),0) AS sale_revenue,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'rebill' THEN 1
        ELSE 0
      END
  ),0) AS rebill_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'rebill' THEN amount
        ELSE 0
      END
  ),0) AS rebill_revenue,
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
  ),0) +
  coalesce(SUM(
      CASE
        WHEN processor_result = 'success' AND type = 'rebill' THEN amount
        ELSE 0
      END
  ),0) gross_revenue,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'decline' THEN 1
        ELSE 0
      END
  ),0) AS declines_count,
  coalesce(SUM(
      CASE
        WHEN processor_result = 'decline'  THEN amount
        ELSE 0
      END
  ),0) AS declines_revenue,
  coalesce(SUM(
      CASE
        WHEN type = 'chargeback' THEN 1
        ELSE 0
      END
  ),0) AS chargeback_count,
  count(distinct case when type='new' then customer else null end) as current_active_customer,
  0 count_alert_count
FROM f_product_schedules
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
GROUP BY date_trunc('day',datetime)
LIMIT {{limit}}
OFFSET {{offset}};
