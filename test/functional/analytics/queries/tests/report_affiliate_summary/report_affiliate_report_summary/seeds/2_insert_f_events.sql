INSERT INTO analytics.f_events (id, session, TYPE, datetime, account, campaign, affiliate, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5) (
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9991', '99999999-999e-44aa-999e-aaa9a99a9999', 'lead', '2017-01-01 00:00:00.000'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999'
  UNION ALL
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9992', '668ad918-0d09-4116-a6fe-0e8a9eda36f7', 'lead', '2017-04-06T18:40:41.405Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  UNION ALL
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9993', '008ad918-0d09-4116-a6fe-0e8a9eda3600', 'lead', '2017-04-06T18:40:41.406Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  UNION ALL
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9994', '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', 'lead', '2017-04-06T18:40:41.407Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  UNION ALL
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9995', '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', 'lead', '2017-04-06T18:40:41.408Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', '', '', '', '', ''
  EXCEPT
  SELECT
    fe.id, fe.session, fe.type, fe.datetime, fe.account, fe.campaign, fe.affiliate, fe.subaffiliate_1, fe.subaffiliate_2, fe.subaffiliate_3, fe.subaffiliate_4, fe.subaffiliate_5
  FROM
    analytics.f_events fe);

