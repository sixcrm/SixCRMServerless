INSERT INTO analytics.f_sessions (id, datetime, account, campaign) (
  SELECT
    '668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-01-01 00:00:01.000Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999'
  UNION ALL
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9999', '2017-01-01 00:00:01.000Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999'
    UNION ALL
  SELECT
    '008ad918-0d09-4116-a6fe-0e8a9eda3600', '2017-01-01 00:00:01.000Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999'
   UNION ALL
  SELECT
    '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', '2017-01-01 00:00:01.000Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999'
	EXCEPT
  SELECT
    fe.id, fe.datetime, fe.account, fe.campaign
  FROM
    analytics.f_sessions fe);

