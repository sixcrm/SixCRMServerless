/*
09.01.2017 A.Zelen Table for tracking migrations
*/

CREATE TABLE IF NOT EXISTS sys_sixcrm.sys_change_log
(
  change_number integer,
  datetime timestamp,
  description varchar(500)
);

GRANT INSERT,SELECT,DELETE,DELETE ON sys_sixcrm.sys_change_log TO PUBLIC;
