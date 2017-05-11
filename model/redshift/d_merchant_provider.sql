DROP TABLE d_merchant_provider;
CREATE TABLE d_merchant_provider
(
  merchant_provider VARCHAR(36),
  activity_flag      VARCHAR(8)
) DISTSTYLE ALL;

COMMENT ON COLUMN d_mmerchant_provider.activity_flag IS 'Active, inactive';


