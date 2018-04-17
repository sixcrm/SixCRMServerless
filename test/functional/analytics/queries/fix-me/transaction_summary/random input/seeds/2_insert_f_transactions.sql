INSERT INTO analytics.f_transactions (id, session, datetime, customer, creditcard, merchant_provider, campaign, affiliate, amount, processor_result, account, TYPE, subtype, subaffiliate_1, subaffiliate_2, subaffiliate_3, subaffiliate_4, subaffiliate_5) (
  SELECT
    '99999999-999e-44aa-999e-aaa9a99a9999', '668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-01-01 10:06:54.000'::timestamp, '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', '99999999-999e-44aa-999e-aaa9a99a9999', 0, 'success', '99999999-999e-44aa-999e-aaa9a99a9999', 'new', 'upsell', '', '', '', '', ''
  UNION ALL
  SELECT
    'e624af6a-21dc-4c64-b310-3b0523f8ca42','668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-04-06T18:40:41.405Z'::timestamp, '24f7c851-29d4-4af9-87c5-0298fa74c689', 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72', '6c40761d-8919-4ad6-884d-6a46a776cfb9', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', 34.99, 'success', 'd3fa3bf3-7824-49f4-8261-87674482bf1c', 'new', 'order', '', '', '', '', ''
  UNION ALL
  SELECT
    'cf3cd926-b321-453a-99be-591611f07e3d','668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-04-06T18:40:41.406Z'::timestamp, '24f7c851-29d4-4af9-87c5-0298fa74c689', 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72', '6c40761d-8919-4ad6-884d-6a46a776cfb9', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', 4.99, 'success', 'd3fa3bf3-7824-49f4-8261-87674482bf1c', 'new', 'order', '', '', '', '', ''
  UNION ALL
  SELECT
    '07110153-41c5-4a7f-ae49-8204d7ba7ff0','668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-04-06T18:40:41.407Z'::timestamp, '24f7c851-29d4-4af9-87c5-0298fa74c689', 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72', '6c40761d-8919-4ad6-884d-6a46a776cfb9', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', 124.99, 'success', 'd3fa3bf3-7824-49f4-8261-87674482bf1c', 'new', 'order', '', '', '', '', ''
  UNION ALL
  SELECT
    'b5a1753d-717a-4454-ab4e-2abeef1c306f','668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-04-06T18:40:41.408Z'::timestamp, '24f7c851-29d4-4af9-87c5-0298fa74c689', 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72', '6c40761d-8919-4ad6-884d-6a46a776cfb9', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', 139.99, 'success', 'd3fa3bf3-7824-49f4-8261-87674482bf1c', 'new', 'order', '', '', '', '', ''
  UNION ALL
  SELECT
    'd26c1887-7ad4-4a44-be0b-e80dbce22774','668ad918-0d09-4116-a6fe-0e8a9eda36f7', '2017-01-02T18:40:41.409Z'::timestamp, '24f7c851-29d4-4af9-87c5-0298fa74c689', 'df84f7bb-06bd-4daa-b1a3-6a2c113edd72', '6c40761d-8919-4ad6-884d-6a46a776cfb9', '70a6689a-5814-438b-b9fd-dd484d0812f9', '6b6331f6-7f84-437a-9ac6-093ba301e455', 139.99, 'success', 'd26c1887-7ad4-4a44-be0b-e80dbce22774', 'new', 'order', '', '', '', '', ''
  EXCEPT
  SELECT
    ft.id, session, ft.datetime, ft.customer, ft.creditcard, ft.merchant_provider, ft.campaign, ft.affiliate, ft.amount, ft.processor_result, ft.account, ft.type, ft.subtype, ft.subaffiliate_1, ft.subaffiliate_2, ft.subaffiliate_3, ft.subaffiliate_4, ft.subaffiliate_5
  FROM
    analytics.f_transactions ft);

