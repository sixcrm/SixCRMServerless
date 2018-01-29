/*
29.01.2018 A.Zelen Alter script modifiying rebill table and adding amount

TABLE_VERSION 2
*/

DELETE FROM sys_sixcrm.sys_change_log WHERE description ='0002_alter_script_29012018';

INSERT INTO sys_sixcrm.sys_change_log
     SELECT 2,getdate(),'0002_alter_script_29012018';

/* Alters and inserts */

ALTER TABLE f_rebills ADD COLUMN amount NUMERIC(8, 2);
UPDATE f_rebills SET amount = 0;
