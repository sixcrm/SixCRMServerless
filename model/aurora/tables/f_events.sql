/*
23.02.2017 J.C. Lozano Initial table definition for agg_merchant_provider_transactions @ aurora db
*/

DROP TABLE IF EXISTS f_events;

CREATE TABLE IF NOT EXISTS f_events
(
  session          VARCHAR(36) NOT NULL,
  type             ENUM('click', 'lead', 'order', 'upsell', 'confirm'),
  datetime         TIMESTAMP    NOT NULL,
  account          VARCHAR(36)  NOT NULL,
  campaign         VARCHAR(36)  NOT NULL,
  product_schedule VARCHAR(36),
  affiliate        VARCHAR(36),
  subaffiliate_1   VARCHAR(36),
  subaffiliate_2   VARCHAR(36),
  subaffiliate_3   VARCHAR(36),
  subaffiliate_4   VARCHAR(36),
  subaffiliate_5   VARCHAR(36),
  PRIMARY KEY (account,datetime)
);
