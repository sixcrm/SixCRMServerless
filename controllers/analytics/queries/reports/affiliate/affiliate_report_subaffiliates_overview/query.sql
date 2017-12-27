WITH SUBAFFILIATES AS (SELECT subaffiliate_1 as subaffiliate,
       SUM(amount) AS AMOUNT
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND subaffiliate_1 !=''
  AND subaffiliate_1 IS NOT NULL
GROUP BY subaffiliate_1
UNION ALL
SELECT subaffiliate_2 as subaffiliate,
       SUM(amount) AS AMOUNT
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND subaffiliate_2 !=''
  AND subaffiliate_2 IS NOT NULL
GROUP BY subaffiliate_2
UNION ALL
SELECT subaffiliate_3 as subaffiliate,
       SUM(amount) AS AMOUNT
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND subaffiliate_3 !=''
  AND subaffiliate_3 IS NOT NULL
GROUP BY subaffiliate_3
UNION ALL
SELECT subaffiliate_4 as subaffiliate,
       SUM(amount) AS AMOUNT
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND subaffiliate_4 !=''
  AND subaffiliate_4 IS NOT NULL
GROUP BY subaffiliate_4
UNION ALL
SELECT subaffiliate_5 as subaffiliate,
       SUM(amount) AS AMOUNT
FROM f_transactions
WHERE 1=1
  {{filter}}
  AND datetime BETWEEN TIMESTAMP '{{start}}' AND TIMESTAMP '{{end}}'
  AND subaffiliate_5 !=''
  AND subaffiliate_5 IS NOT NULL
GROUP BY subaffiliate_5
)
SELECT subaffiliate,
       sum(amount) as amount
FROM SUBAFFILIATES
GROUP BY subaffiliate;
