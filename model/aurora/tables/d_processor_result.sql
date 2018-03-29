DROP TYPE IF EXISTS analytics.d_processor_result;

CREATE TYPE analytics.d_processor_result AS ENUM ( 'success',
  'declined', -- this is the register response, not sure we will ever use this?
  'fail', -- this is mapped to decline in the register, but this is the transaction result
  'error'
);

