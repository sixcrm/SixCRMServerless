CREATE OR REPLACE FUNCTION create_d_event_type ()
  RETURNS INT
AS $$
BEGIN
  IF NOT EXISTS (
      SELECT
        1
      FROM
        pg_type
      WHERE
        typname = 'd_event_type') THEN
      CREATE TYPE analytics.d_event_type AS ENUM ( 'click', 'lead', 'order', 'upsell', 'upsell2', 'upsell3', 'upsell4', 'upsell5', 'upsell6', 'upsell7', 'upsell8', 'upsell9', 'downsell', 'downsell2', 'downsell3', 'downsell4', 'downsell5', 'downsell6', 'downsell7', 'downsell8', 'downsell9', 'confirm', 'new', 'rebill', 'refund', 'chargeback'
);
  END IF;
END;
$$
LANGUAGE plpgsql;

