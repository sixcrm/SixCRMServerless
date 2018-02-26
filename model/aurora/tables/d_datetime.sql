/*
23.02.2017 J.C.Lozano Initial table definition for agg_merchant_provider_transactions @ aurora db
*/

DROP TABLE IF EXISTS d_datetime;

CREATE TABLE IF NOT EXISTS d_datetime
(
  datetime_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  datetime TIMESTAMP
);
