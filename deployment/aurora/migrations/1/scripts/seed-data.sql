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
    'success',
		'decline',
		'fail',
		'error')
EXCEPT
SELECT
  id
FROM
  analytics.d_processor_result;
