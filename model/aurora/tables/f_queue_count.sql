/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS f_queue_count;

CREATE TABLE f_queue_count (
  queuename    VARCHAR(20)          NOT NULL ,
  account  VARCHAR(36)              NOT NULL,
  count    INTEGER,
  datetime TIMESTAMP,
  PRIMARY KEY (account, datetime)
);
