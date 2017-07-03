/*DROP TABLE f_sessions;*/

CREATE TABLE f_sessions
(
  id             VARCHAR(36) NOT NULL,
  account        VARCHAR(36) NOT NULL,
  customer       VARCHAR(36) NOT NULL,
  campaign       VARCHAR(36) NOT NULL,
  completed      VARCHAR(6)  NOT NULL,
  created_at     TIMESTAMP,
  updated_at     TIMESTAMP,
  affiliate      VARCHAR(128),
  subaffiliate_1 VARCHAR(128),
  subaffiliate_2 VARCHAR(128),
  subaffiliate_3 VARCHAR(128),
  subaffiliate_4 VARCHAR(128),
  subaffiliate_5 VARCHAR(128),
  cid            VARCHAR(36)

)
  SORTKEY (id
);

COMMENT ON TABLE f_sessions IS 'Fact table build for session data';
