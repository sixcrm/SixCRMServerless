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
where binnumber = {{binnumber}};
