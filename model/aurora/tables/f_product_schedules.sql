/*
23.02.2017 J.C. Lozano Initial table definition @ aurora db
*/

DROP TABLE IF EXISTS f_product_schedules;

CREATE TABLE IF NOT EXISTS f_product_schedules
(
  product_schedule VARCHAR(36) NOT NULL PRIMARY key
);
