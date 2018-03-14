/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TYPE IF EXISTS analytics.d_processor_result;

CREATE TYPE analytics.d_processor_result AS ENUM('success','decline','error');
