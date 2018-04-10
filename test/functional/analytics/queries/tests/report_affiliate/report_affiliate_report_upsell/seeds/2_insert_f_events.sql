INSERT INTO analytics.f_events (id, session, TYPE, datetime, account, campaign, affiliate, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5) (
  SELECT
    '11111111-1111-1111-1111-111111111111', '668ad918-0d09-4116-a6fe-0e8a9eda36f7', 'click', '2017-01-01T18:40:41.405Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '', '', '', '', ''
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111112', '008ad918-0d09-4116-a6fe-0e8a9eda3600', 'upsell', '2017-01-01T18:40:41.406Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '', '', '', '', ''
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111113', '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', 'upsell', '2017-01-01T18:40:41.407Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '', '', '', '', ''
  UNION ALL
  SELECT
    '11111111-1111-1111-1111-111111111114', '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b', 'click', '2017-01-02T18:40:41.408Z'::timestamp, 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '70a6689a-5814-438b-b9fd-dd484d0812f9', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', '', '', '', '', ''
  EXCEPT
  SELECT
    fe.id, fe.session, fe.type, fe.datetime, fe.account, fe.campaign, fe.affiliate, fe.subaffiliate_1, fe.subaffiliate_2, fe.subaffiliate_3, fe.subaffiliate_4, fe.subaffiliate_5
  FROM
    analytics.f_events fe);

