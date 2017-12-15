/*
21.04.2017 A.Zelen Alter script modifiying

TABLE_VERSION 1
*/

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='alter_script_11092017';

INSERT INTO sys_sixcrm.sys_table_version
     SELECT 'alter_script_11092017',1,getdate();

ALTER TABLE f_transactions RENAME COLUMN transaction_type to type;
ALTER TABLE f_transactions RENAME COLUMN transaction_subtype to subtype;

ALTER TABLE f_transactions ADD COLUMN result VARCHAR(16) ENCODE ZSTD;
ALTER TABLE f_transactions ADD COLUMN associated_transaction VARCHAR(36) ENCODE ZSTD;
