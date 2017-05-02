/*
02.05.2017 A.Zelen Initial table definition

*/

DROP TABLE f_events;

CREATE TABLE f_events
(
  session          VARCHAR(128) NOT NULL,
  type             VARCHAR(128) NOT NULL,
  datetime         TIMESTAMP    NOT NULL,
  account          VARCHAR(36)  NOT NULL,
  campaign         VARCHAR(36)  NOT NULL,
  product_schedule VARCHAR(36),
  affiliate        VARCHAR(36),
  subaffiliate_1   VARCHAR(128),
  subaffiliate_2   VARCHAR(128),
  subaffiliate_3   VARCHAR(128),
  subaffiliate_4   VARCHAR(128),
  subaffiliate_5   VARCHAR(128)
)
  distkey (account
) INTERLEAVED sortkey (datetime
);
