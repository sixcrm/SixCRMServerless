/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS d_datetime;

CREATE TABLE IF NOT EXISTS d_datetime
(
  datetime_id SERIAL PRIMARY KEY,
  datetime TIMESTAMP
);
