/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TYPE IF EXISTS analytics.d_activity_type;

CREATE TYPE analytics.d_activity_type AS ENUM('Active','Inactive');
