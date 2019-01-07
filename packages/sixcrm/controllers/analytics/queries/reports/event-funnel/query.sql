SELECT
  COALESCE(SUM(count_click), 0) count_click,
  COALESCE(SUM(count_lead), 0) count_lead,
  COALESCE(SUM(count_order), 0) count_order,
  COALESCE(SUM(count_confirm), 0) count_confirm,
  COALESCE(SUM(m_upsell), 0) count_upsell
FROM (
  SELECT
    SUM( CASE WHEN TYPE = 'click' THEN
        1
      ELSE
        0
  END) count_click,
  SUM( CASE WHEN TYPE = 'lead' THEN
      1
    ELSE
      0
  END) count_lead,
  SUM( CASE WHEN TYPE = 'order' THEN
      1
    ELSE
      0
  END) count_order,
  SUM( CASE WHEN TYPE = 'confirm' THEN
      1
    ELSE
      0
  END) count_confirm,
  MAX( CASE WHEN TYPE = 'upsell' THEN
      1
    ELSE
      0
  END) m_upsell
FROM
  analytics.f_event e
WHERE %s
GROUP BY "session") fe;
