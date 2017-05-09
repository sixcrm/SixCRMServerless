DROP TABLE d_merchant_processor;
CREATE TABLE d_merchant_processor
(
  merchant_processor VARCHAR(36),
  activity_flag      VARCHAR(8)
) DISTSTYLE ALL;

COMMENT ON COLUMN d_merchant_processor.activity_flag IS 'Active, inactive';


