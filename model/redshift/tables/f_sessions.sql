/*
05.07.2017 A.Zelen Logic from idempotent versioning

TABLE_VERSION 1
*/

DROP TABLE IF EXISTS f_sessions;

/*
Technical Debt:  completed is now a boolean
*/
CREATE TABLE IF NOT EXISTS f_sessions
(
  id             VARCHAR(36) NOT NULL,
  account        VARCHAR(36) NOT NULL,
  customer       VARCHAR(36) NOT NULL,
  campaign       VARCHAR(36) NOT NULL,
  completed      VARCHAR(6)  NOT NULL,
  created_at     TIMESTAMP,
  updated_at     TIMESTAMP,
  affiliate      VARCHAR(36),
  subaffiliate_1 VARCHAR(36),
  subaffiliate_2 VARCHAR(36),
  subaffiliate_3 VARCHAR(36),
  subaffiliate_4 VARCHAR(36),
  subaffiliate_5 VARCHAR(36),
  cid            VARCHAR(36)

) SORTKEY (id);

COMMENT ON TABLE f_sessions IS 'Fact table build for session data';
