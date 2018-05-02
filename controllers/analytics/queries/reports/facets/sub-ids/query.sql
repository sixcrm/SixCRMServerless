SELECT
  subaffiliate_1 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN %L
  AND %L
  AND subaffiliate_1 IS NOT NULL %s
UNION
SELECT
  subaffiliate_2 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN %L
  AND %L
  AND subaffiliate_2 IS NOT NULL %s
UNION
SELECT
  subaffiliate_3 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN %L
  AND %L
  AND subaffiliate_3 IS NOT NULL %s
UNION
SELECT
  subaffiliate_4 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN %L
  AND %L
  AND subaffiliate_4 IS NOT NULL %s
UNION
SELECT
  subaffiliate_5 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN %L
  AND %L
  AND subaffiliate_5 IS NOT NULL %s
