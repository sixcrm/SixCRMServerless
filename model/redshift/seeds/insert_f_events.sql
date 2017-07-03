INSERT INTO f_events (session, type, datetime, account, campaign, product_schedule, affiliate, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5)
  ((SELECT
      '99999999-999e-44aa-999e-aaa9a99a9999',
      'lead',
      '2017-01-01 00:00:00.000000',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999')
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
