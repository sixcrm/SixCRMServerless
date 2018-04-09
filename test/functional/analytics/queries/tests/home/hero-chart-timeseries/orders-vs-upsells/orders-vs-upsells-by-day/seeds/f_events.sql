INSERT INTO analytics.f_events (session, type, datetime, account, campaign, affiliate, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5)
(
   SELECT
      '99999999-999e-44aa-999e-aaa9a99a9999',
      'order',
      '2017-01-02 00:00:00.000'::timestamp,
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999'
   UNION ALL
   SELECT
      '668ad918-0d09-4116-a6fe-0e8a9eda36f7',
      'order',
      '2017-01-03T18:40:41.405Z'::timestamp,
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      '',
      '',
      '',
      '',
      ''
   UNION ALL
   SELECT
      '668ad918-0d09-4116-a6fe-0e8a9eda36f7',
      'upsell',
      '2017-01-03T18:40:41.406Z'::timestamp,
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      '',
      '',
      '',
      '',
      ''
   EXCEPT
   SELECT
     fe.session,
     fe.type,
     fe.datetime,
     fe.account,
     fe.campaign,
     fe.affiliate,
     fe.subaffiliate_1,
     fe.subaffiliate_2,
     fe.subaffiliate_3,
     fe.subaffiliate_4,
     fe.subaffiliate_5
   FROM analytics.f_events fe);
