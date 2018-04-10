INSERT INTO analytics.f_events (id, session, TYPE, datetime, account, campaign, affiliate, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5) (
  SELECT
    '11111111-1111-1111-1111-111111111111', '99999999-999e-44aa-999e-aaa9a99a9999', 'lead', '2017-01-01 00:00:01.000000'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999'
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111112', '99999999-999e-44aa-999e-aaa9a99a9999', 'lead', '2017-01-01 10:00:02.000000'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999'
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111113', '668ad918-0d09-4116-a6fe-0e8a9eda36f7', 'lead', '2017-01-01T18:40:41.405Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111114', '008ad918-0d09-4116-a6fe-0e8a9eda3600', 'lead', '2017-01-01T18:40:42.405Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111115', '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', 'lead', '2017-01-01T18:40:43.405Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111116', '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', 'lead', '2017-01-01T18:40:44.405Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  EXCEPT
  SELECT
    fe.id, fe.session, fe.type, fe.datetime, fe.account, fe.campaign, fe.affiliate, fe.subaffiliate_1, fe.subaffiliate_2, fe.subaffiliate_3, fe.subaffiliate_4, fe.subaffiliate_5
  FROM
    analytics.f_events fe);

