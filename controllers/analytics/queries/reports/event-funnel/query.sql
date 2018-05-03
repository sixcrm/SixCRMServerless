SELECT
  COALESCE(sum(count_click), 0) count_click,
  COALESCE(sum(count_lead), 0) count_lead,
  COALESCE(sum(count_order), 0) count_order,
  COALESCE(sum(count_confirm), 0) count_confirm,
  COALESCE(sum(m_upsell), 0) count_upsell
FROM (
  SELECT
    sum( CASE WHEN TYPE = 'click' THEN
        1
      ELSE
        0
END) count_click,
sum( CASE WHEN TYPE = 'lead' THEN
    1
  ELSE
    0
END) count_lead,
sum( CASE WHEN TYPE = 'order' THEN
    1
  ELSE
    0
END) count_order,
sum( CASE WHEN TYPE = 'confirm' THEN
    1
  ELSE
    0
END) count_confirm,
max( CASE WHEN TYPE = 'upsell' THEN
    1
  ELSE
    0
END) m_upsell
FROM
  analytics.f_event e
WHERE %s
GROUP BY
  "session") fe;

