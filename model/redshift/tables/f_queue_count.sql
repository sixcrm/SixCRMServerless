/*
11.10.2017 A.Zelen Fact table containing queue counts

TABLE_VERSION 2
*/

DROP TABLE IF EXISTS f_queue_count;

CREATE TABLE f_queue_count (
  queuename    VARCHAR(20)          NOT NULL ENCODE ZSTD,
  account  VARCHAR(36)              NOT NULL ENCODE RUNLENGTH,
  count    INTEGER,
  datetime TIMESTAMP ENCODE DELTA
)
  INTERLEAVED SORTKEY (account, datetime);
