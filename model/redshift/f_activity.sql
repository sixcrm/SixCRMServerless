/*
14.05.2017 A.Zelen Activity Fact table, anticipating accumulating fact table type

*/


CREATE TABLE f_activity
(
  id               VARCHAR(36) NOT NULL,
  datetime         TIMESTAMP    NOT NULL,
  actor            VARCHAR(36)  NOT NULL,
  actor_type       VARCHAR(36),
  action           VARCHAR(36),
  acted_upon       VARCHAR(36),
  acted_upon_type  VARCHAR(36),
  associated_with  VARCHAR(36),
  associated_with_type VARCHAR(36)
)
  sortkey (datetime);


COMMENT ON TABLE f_activity Is 'Fact table builed around activities of actors';