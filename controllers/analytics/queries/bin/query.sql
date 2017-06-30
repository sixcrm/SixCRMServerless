SELECT
  binnumber,
  brand,
  bank,
  type,
  level,
  country,
  info,
  country_iso,
  country2_iso,
  country3_iso,
  webpage,
  phone
FROM
  d_bin
WHERE 1
 {{filter}}
ORDER BY binnumber {{order}}
LIMIT {{limit}} OFFSET {{offset}};
