INSERT INTO analytics.f_transactions (id, datetime, customer, creditcard, merchant_provider, campaign, affiliate, amount, processor_result, account, type, subtype, product_schedule, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5)
(
      SELECT
     '99999999-999e-44aa-999e-aaa9a99a9989',
     '2017-01-02T08:40:00.405Z'::timestamp,
     '99999999-999e-44aa-999e-aaa9a99a9999',
     '99999999-999e-44aa-999e-aaa9a99a9999',
     '6c40761d-8919-4ad6-884d-6a46a776cfb9',
     '99999999-999e-44aa-999e-aaa9a99a9999',
     '99999999-999e-44aa-999e-aaa9a99a9999',
     200,
     'success'::analytics.d_processor_result,
     'd26c1887-7ad4-4a44-be0b-e80dbce22774',
     'refund',
     'order',
     '99999999-999e-44aa-999e-aaa9a99a9999',
     '',
     '',
     '',
     '',
     ''
     UNION ALL
     SELECT
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '2017-01-03T21:40:41.405Z'::timestamp,
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      40,
      'success'::analytics.d_processor_result,
      '99999999-999e-44aa-999e-aaa9a99a9999',
      'new',
      'upsell',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '',
      '',
      '',
      '',
      ''
     UNION ALL
     SELECT
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      '2017-01-02T18:40:41.405Z'::timestamp,
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      179.99,
      'success'::analytics.d_processor_result,
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      'new',
      'order',
      '2200669e-5e49-4335-9995-9c02f041d91b',
      '',
      '',
      '',
      '',
      ''
   EXCEPT
   SELECT
     ft.id,
     ft.datetime,
     ft.customer,
     ft.creditcard,
     ft.merchant_provider,
     ft.campaign,
     ft.affiliate,
     ft.amount,
     ft.processor_result,
     ft.account,
     ft.type,
     ft.subtype,
     ft.product_schedule,
     ft.subaffiliate_1,
     ft.subaffiliate_2,
     ft.subaffiliate_3,
     ft.subaffiliate_4,
     ft.subaffiliate_5
   FROM analytics.f_transactions ft);
