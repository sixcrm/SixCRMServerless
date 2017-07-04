/*
14.06.2017 A.Zelen Merchant provider types.
Dimensional table is needed for faster upload.

TABLE_VERSION 1

*/


/*DROP TABLE d_merchant_provider;*/

CREATE TABLE IF NOT EXISTS d_merchant_provider
(
  merchant_provider VARCHAR(36),
  activity_flag     VARCHAR(8)
) DISTSTYLE ALL;

COMMENT ON COLUMN d_merchant_provider.activity_flag IS 'Active, inactive';
COMMENT ON TABLE d_merchant_provider IS 'Dimensional table of all merchant providers';
