/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS analytics.f_activity;

CREATE TABLE IF NOT EXISTS analytics.f_activity
(
  id                   VARCHAR(36)  NOT NULL,
  datetime             TIMESTAMP    NOT NULL,
  account              VARCHAR(36),
  actor                VARCHAR(100) NOT NULL,
  actor_type           VARCHAR(100),
  action               VARCHAR(20),
  acted_upon           VARCHAR(100),
  acted_upon_type      VARCHAR(100),
  associated_with      VARCHAR(100),
  associated_with_type VARCHAR(100),
  PRIMARY KEY (id)
);

