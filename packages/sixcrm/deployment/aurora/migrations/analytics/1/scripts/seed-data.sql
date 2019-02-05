INSERT INTO analytics.m_release (id) (
  SELECT
    1)
EXCEPT
SELECT
  id
FROM
  analytics.m_release;

INSERT INTO analytics.d_processor_result (id) (
  SELECT
    'success'
  UNION ALL
  SELECT
    'decline'
  UNION ALL
  SELECT
    'error')
EXCEPT
SELECT
  id
FROM
  analytics.d_processor_result;

INSERT INTO analytics.d_event_type (id) (
  SELECT
    'click'
  UNION ALL
  SELECT
    'lead'
  UNION ALL
  SELECT
    'order'
  UNION ALL
  SELECT
    'upsell'
  UNION ALL
  SELECT
    'upsell'
  UNION ALL
  SELECT
    'upsell2'
  UNION ALL
  SELECT
    'upsell3'
  UNION ALL
  SELECT
    'upsell4'
  UNION ALL
  SELECT
    'upsell5'
  UNION ALL
  SELECT
    'upsell6'
  UNION ALL
  SELECT
    'upsell7'
  UNION ALL
  SELECT
    'upsell8'
  UNION ALL
  SELECT
    'upsell9'
  UNION ALL
  SELECT
    'downsell'
  UNION ALL
  SELECT
    'downsell2'
  UNION ALL
  SELECT
    'downsell3'
  UNION ALL
  SELECT
    'downsell4'
  UNION ALL
  SELECT
    'downsell5'
  UNION ALL
  SELECT
    'downsell6'
  UNION ALL
  SELECT
    'downsell7'
  UNION ALL
  SELECT
    'downsell8'
  UNION ALL
  SELECT
    'downsell9'
  UNION ALL
  SELECT
    'confirm'
  UNION ALL
  SELECT
    'new'
  UNION ALL
  SELECT
    'rebill'
  UNION ALL
  SELECT
    'refund'
  UNION ALL
  SELECT
    'chargeback')
EXCEPT
SELECT
  id
FROM
  analytics.d_event_type;

