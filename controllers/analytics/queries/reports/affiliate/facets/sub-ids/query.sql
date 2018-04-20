SELECT
  subaffiliate_1 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}'
  AND '{{end}}'
  AND subaffiliate_1 IS NOT NULL {{filter}}
UNION
SELECT
  subaffiliate_2 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}'
  AND '{{end}}'
  AND subaffiliate_2 IS NOT NULL {{filter}}
UNION
SELECT
  subaffiliate_3 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}'
  AND '{{end}}'
  AND subaffiliate_3 IS NOT NULL {{filter}}
UNION
SELECT
  subaffiliate_4 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}'
  AND '{{end}}'
  AND subaffiliate_4 IS NOT NULL {{filter}}
UNION
SELECT
  subaffiliate_5 AS subid
FROM
  analytics.f_transaction
WHERE
  datetime BETWEEN '{{start}}'
  AND '{{end}}'
  AND subaffiliate_5 IS NOT NULL {{filter}}
