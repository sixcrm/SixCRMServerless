/*
14.05.2017 A.Zelen Activity Fact table, anticipating accumulating fact table type

*/

DROP TABLE f_activity;

CREATE TABLE f_activity
(
  id               VARCHAR(128) NOT NULL,
  datetime         TIMESTAMP    NOT NULL,
  actor            VARCHAR(128)  NOT NULL,
  actor_type       VARCHAR(128),
  action           VARCHAR(128),
  acted_upon       VARCHAR(128),
  acted_upon_type  VARCHAR(128),
  associated_with  VARCHAR(128),
  accociated_with_type VARCHAR(128)
)
  distkey (actor) INTERLEAVED sortkey (datetime);


COMMENT ON TABLE f_activity Is 'Fact table builed around activity';