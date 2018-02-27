/*
30.11.2017 A.Zelen Fact table containing queue counts
08.12.2017 A.Zelen Changed sortkey
08.12.2017 A.Zelen Added amount column

TABLE_VERSION 2
*/

DROP TABLE IF EXISTS f_rebills;

DELETE FROM sys_sixcrm.sys_table_version WHERE table_name ='f_rebills';

INSERT INTO sys_sixcrm.sys_table_version
   SELECT 'f_rebills',2,getdate();

CREATE TABLE IF NOT EXISTS f_rebills (
  id_rebill VARCHAR(36),
  current_queuename    VARCHAR(20) NOT NULL ENCODE ZSTD,
  previous_queuename    VARCHAR(20) NOT NULL ENCODE ZSTD,
  account  VARCHAR(36) NOT NULL ENCODE RUNLENGTH,
  datetime TIMESTAMP ENCODE DELTA,
  amount             NUMERIC(8, 2)
) INTERLEAVED SORTKEY (account, id_rebill,datetime);

COMMENT ON TABLE f_rebills IS 'Fact table with information about rebills (orders)';
COMMENT ON COLUMN f_rebills.current_queuename IS 'Name of the current queue where the rebill is located';
COMMENT ON COLUMN f_rebills.previous_queuename IS 'Name of the previous queue from where the rebill came';
COMMENT ON COLUMN f_rebills.datetime IS 'Date time of entering the current queue';
COMMENT ON COLUMN f_rebills.amount IS 'Amount tied to rebill';
