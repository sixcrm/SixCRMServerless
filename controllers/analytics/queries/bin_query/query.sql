SELECT
  number_id,
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
where number_id = {{number_id}};
