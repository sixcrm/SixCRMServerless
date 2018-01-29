/*
29.01.2018 A.Zelen Alter script modifiying rebill table and adding amount

TABLE_VERSION 1
*/

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='0002_alter_script_29012018';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT '0002_alter_script_29012018',1,getdate();

ALTER TABLE f_rebills ADD COLUMN amount NUMERIC(8, 2);
