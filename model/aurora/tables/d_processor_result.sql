DROP TYPE IF EXISTS analytics.d_processor_result;

CREATE TYPE analytics.d_processor_result AS ENUM ( 'success',
  'decline',
  'error'
);