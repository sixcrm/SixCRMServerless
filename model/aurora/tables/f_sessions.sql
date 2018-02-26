/*
23.02.2017 J.C.Lozano Initial table definition  @ aurora db
*/

DROP TABLE IF EXISTS f_sessions;

CREATE TABLE IF NOT EXISTS f_sessions
(
  id             VARCHAR(36) NOT NULL PRIMARY KEY ,
  account        VARCHAR(36) NOT NULL,
  customer       VARCHAR(36) NOT NULL,
  campaign       VARCHAR(36) NOT NULL,
  completed      TINYINT(1)  NOT NULL,
  created_at     TIMESTAMP,
  updated_at     TIMESTAMP,
  affiliate      VARCHAR(36),
  subaffiliate_1 VARCHAR(36),
  subaffiliate_2 VARCHAR(36),
  subaffiliate_3 VARCHAR(36),
  subaffiliate_4 VARCHAR(36),
  subaffiliate_5 VARCHAR(36),
  cid            VARCHAR(36)

);
