/*
23.02.2017 J.C.Lozano Initial table definition for agg_merchant_provider_transactions @ aurora db
*/

DROP TABLE IF EXISTS d_bin;

CREATE TABLE IF NOT EXISTS d_bin
(
  binnumber    INTEGER      NOT NULL PRIMARY KEY,
  brand        VARCHAR(128) NOT NULL,
  bank         VARCHAR(128) NOT NULL,
  type         VARCHAR(128),
  level        VARCHAR(128),
  country      VARCHAR(128) NOT NULL,
  info         VARCHAR(128) NOT NULL,
  country_iso  VARCHAR(2) NOT NULL,
  country2_iso VARCHAR(3) NOT NULL,
  country3_iso INTEGER,
  webpage      VARCHAR(128),
  phone        VARCHAR(128)

);