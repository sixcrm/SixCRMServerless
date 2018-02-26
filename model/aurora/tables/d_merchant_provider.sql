/*
23.02.2017 J.C.Lozano Initial table definition for agg_merchant_provider_transactions @ aurora db
*/

DROP TABLE IF EXISTS d_merchant_provider;

CREATE TABLE IF NOT EXISTS d_merchant_provider
(
  merchant_provider_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  merchant_provider VARCHAR(36),
  activity_flag     ENUM('Active','Inactive')
);
