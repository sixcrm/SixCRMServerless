/*
23.02.2017 J.C.Lozano Initial table definition @ aurora db
*/

DROP TYPE IF EXISTS analytics.d_event_type;

CREATE TYPE analytics.d_event_type AS ENUM('click','lead','order','upsell','confirm', 'new', 'rebill');
