/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TYPE IF EXISTS d_event_type;

CREATE TYPE d_event_type AS ENUM('click','lead','order','upsell','confirm');
