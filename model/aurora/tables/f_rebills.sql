/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS analytics.f_rebills;

CREATE TABLE IF NOT EXISTS analytics.f_rebills (
  id_rebill VARCHAR(36) PRIMARY Key,
  current_queuename    VARCHAR(20) NOT NULL,
  previous_queuename    VARCHAR(20) NOT NULL,
  account  VARCHAR(36) NOT NULL,
  datetime TIMESTAMP,
  amount NUMERIC(8, 2),
  UNIQUE (account, id_rebill,datetime)
);
