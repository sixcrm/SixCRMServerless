/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS analytics.f_events;

CREATE TABLE IF NOT EXISTS analytics.f_events
(
  session          VARCHAR(36) NOT NULL,
  "type"           analytics.d_event_type,
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
