INSERT INTO f_sessions
(id,
 account,
 customer,
 campaign,
 completed,
 created_at,
 updated_at,
 affiliate,
 subaffiliate_1,
 subaffiliate_2,
 subaffiliate_3,
 subaffiliate_4,
 subaffiliate_5,
 cid
)
  SELECT
    '668ad918-0d09-4116-a6fe-0e8a9eda36f7',
    'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    '24f7c851-29d4-4af9-87c5-0298fa74c689',
    '70a6689a-5814-438b-b9fd-dd484d0812f9',
    'false',
    getdate(),
    getdate(),
    '332611c7-8940-42b5-b097-c49a765e055a',
    '6b6331f6-7f84-437a-9ac6-093ba301e455',
    '22524f47-9db7-42f9-9540-d34a8909b072',
    'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    'fb10d33f-da7d-4765-9b2b-4e5e42287726'


select * from f_sessions;
