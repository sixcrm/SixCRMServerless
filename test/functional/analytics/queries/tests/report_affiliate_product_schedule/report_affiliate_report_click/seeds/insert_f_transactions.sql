INSERT INTO analytics.f_transactions (id, datetime, customer, creditcard, merchant_provider, campaign, affiliate, amount, processor_result, account, type, subtype, product_schedule, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5)
  ((
     SELECT
      'e624af6a-21dc-4c64-b310-3b0523f8ca42',
      '2017-01-01T18:40:41.405Z'::timestamp,
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      34.99,
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
      '2017-01-01T18:40:41.406Z'::timestamp,
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
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
      '2017-01-01T18:40:41.407Z'::timestamp,
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      124.99,
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
     UNION ALL
     SELECT
      'b5a1753d-717a-4454-ab4e-2abeef1c306f',
      '2017-01-01T18:40:41.408Z'::timestamp,
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      1399,
      'success',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      'new',
      'order',
      '2200669e-5e49-4335-9995-9c02f041d91b',
      '',
      '',
      '',
      '',
      ''
     UNION ALL
     SELECT
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      '2017-01-02T18:40:41.409Z'::timestamp,
      '24f7c851-29d4-4af9-87c5-0298fa74c689',
      'df84f7bb-06bd-4daa-b1a3-6a2c113edd72',
      '6c40761d-8919-4ad6-884d-6a46a776cfb9',
      '70a6689a-5814-438b-b9fd-dd484d0812f9',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      139.99,
      'success',
      'd26c1887-7ad4-4a44-be0b-e80dbce22774',
      'new',
      'order',
      '2200669e-5e49-4335-9995-9c02f041d91b',
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
   FROM analytics.f_transactions ft);
