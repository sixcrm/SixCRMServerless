CREATE OR REPLACE FUNCTION create_d_processor_result ()
  RETURNS INT
AS $$
BEGIN
  IF NOT EXISTS (
      SELECT
        1
      FROM
        pg_type
      WHERE
        typname = 'd_processor_result') THEN
      CREATE TYPE analytics.d_processor_result AS ENUM ( 'success', 'declined', -- this is the register response, not sure we will ever use this?
        'fail', -- this is mapped to decline in the register, but this is the transaction result
        'error'
);
  END IF;
END;
$$
LANGUAGE plpgsql;

