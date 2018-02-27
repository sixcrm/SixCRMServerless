/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TYPE IF EXISTS d_processor_result;

CREATE TYPE d_processor_result AS ENUM('success','decline','error');
