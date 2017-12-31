INSERT INTO public.f_transactions (id, datetime, customer, creditcard, merchant_provider, campaign, affiliate, amount, processor_result, account, type, subtype, product_schedule, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5)
  ((
     SELECT
      '99999999-999e-44aa-999e-aaa9a99a9999',
      timestamp'2017-01-01T18:50:41.405Z',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      '99999999-999e-44aa-999e-aaa9a99a9999',
      120,
      'success',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
      'e624af6a-21dc-4c64-b310-3b0523f8ca42',
      timestamp'2017-01-01T08:10:41.405Z',
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      3.99,
      'success',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      'new',
      'order',
      '12529a17-ac32-4e46-b05b-83862843055d',
      '',
      '',
      '',
      '',
      ''
     UNION ALL
     SELECT
      'cf3cd926-b321-453a-99be-591611f07e3d',
      timestamp'2017-01-01T09:45:41.405Z',
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      4.99,
      'success',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      'new',
      'order',
      '12529a17-ac32-4e46-b05b-83862843055d',
      '',
      '',
      '',
      '',
      ''
     UNION ALL
     SELECT
      '07110153-41c5-4a7f-ae49-8204d7ba7ff0',
      timestamp'2017-01-01T20:20:41.405Z',
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      '6b6331f6-7f84-437a-9ac6-093ba301e455',
      0.1,
      'success',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      'new',
      'order',
      '300848c1-8b83-4b8d-aff9-529ba6459d0f',
      '',
      '',
      '',
      '',
      ''
   )
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
   FROM f_transactions ft);
