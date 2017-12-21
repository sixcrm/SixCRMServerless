INSERT INTO f_events (session, type, datetime, account, campaign, product_schedule, affiliate, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5)
  ((
   SELECT
      '99999999-999e-44aa-999e-aaa9a99a9999',
      'lead',
      timestamp'2017-01-01 00:00:00.000000',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
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
      'lead',
      timestamp'2017-04-06T18:40:41.405Z',
      'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '12529a17-ac32-4e46-b05b-83862843055d',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      '',
      '',
      '',
      '',
      ''
    UNION ALL
    SELECT
      '008ad918-0d09-4116-a6fe-0e8a9eda3600',
      'lead',
      timestamp'2017-04-06T18:40:41.405Z',
      'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '8d1e896f-c50d-4a6b-8c84-d5661c16a046',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      '',
      '',
      '',
      '',
      ''
    UNION ALL
    SELECT
      '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b',
      'lead',
      timestamp'2017-04-06T18:40:41.405Z',
      'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '2200669e-5e49-4335-9995-9c02f041d91b',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      '',
      '',
      '',
      '',
      ''
    UNION ALL
    SELECT
      '7b556e82-5a4c-4199-b8bc-0d86b3d8b47b',
      'lead',
      timestamp'2017-04-06T18:40:41.405Z',
      'd3fa3bf3-7824-49f4-8261-87674482bf1c',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '300848c1-8b83-4b8d-aff9-529ba6459d0f',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      '',
      '',
      '',
      '',
      ''
   )
   EXCEPT
   SELECT
     fe.session,
     fe.type,
     fe.datetime,
     fe.account,
     fe.campaign,
     fe.product_schedule,
     fe.affiliate,
     fe.subaffiliate_1,
     fe.subaffiliate_2,
     fe.subaffiliate_3,
     fe.subaffiliate_4,
     fe.subaffiliate_5
   FROM f_events fe);
