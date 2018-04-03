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
    'fail'
  UNION ALL
  SELECT
    'error')
EXCEPT
SELECT
  id
FROM
  analytics.d_processor_result;

