SELECT version
FROM sys_sixcrm.sys_table_version
WHERE table_name = "f_transactions";



CREATE TABLE IF NOT EXISTS sys_sixcrm.sys_table_version
(
  table_name varchar(100),
  version integer,
  datetime timestamp
);


SELECT *
FROM sys_sixcrm.sys_table_version;

create schema if not exists sys_sixcrm;
create schema if not exists backup;
