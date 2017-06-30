/*
02.05.2017 A.Zelen Initial table definition

*/

DROP TABLE f_events;

CREATE TABLE f_events
(
  session          VARCHAR(128) NOT NULL encode ZSTD,
  type             VARCHAR(10) NOT NULL encode Text255,
  datetime         TIMESTAMP    NOT NULL encode delta,
  account          VARCHAR(36)  NOT NULL encode Runlength,
  campaign         VARCHAR(36)  NOT NULL encode ZSTD,
  product_schedule VARCHAR(36) encode ZSTD,
  affiliate        VARCHAR(36) encode ZSTD,
  subaffiliate_1   VARCHAR(128) encode ZSTD,
  subaffiliate_2   VARCHAR(128) encode ZSTD,
  subaffiliate_3   VARCHAR(128) encode ZSTD,
  subaffiliate_4   VARCHAR(128) encode ZSTD,
  subaffiliate_5   VARCHAR(128)
)
  SORTKEY (account,datetime);

COMMENT ON TABLE d_datetime IS 'Fact table with information about events';
