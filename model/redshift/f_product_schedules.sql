/*DROP TABLE f_product_schedules;**/

CREATE TABLE f_product_schedules
(
  session_id       VARCHAR(36) NOT NULL,
  product_schedule VARCHAR(36) NOT NULL,
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP

)
  DISTKEY (session_id
);

COMMENT ON TABLE f_product_schedules IS 'Child fact table build on different product schedules in data';
