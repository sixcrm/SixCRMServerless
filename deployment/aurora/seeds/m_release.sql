INSERT INTO analytics.m_release (id) (
  SELECT
    1)
EXCEPT
SELECT
  id
FROM
  analytics.m_release;

