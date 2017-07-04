/* 03.03.2017 Table for tracking versions of tables

*/


CREATE TABLE IF NOT EXISTS sys_sixcrm.sys_table_version
(
  table_name varchar(100),
  version integer,
  datetime timestamp
);
