/*
03.07.2017 A.Zelen Table for tracking versions of tables
03.07.2017 A.Zelen Logic from idempotent versioning
29.07.2017 A.Zelen Moved to own directory
*/

CREATE TABLE IF NOT EXISTS sys_sixcrm.sys_table_version
(
  table_name varchar(100),
  version integer,
  datetime timestamp
);
