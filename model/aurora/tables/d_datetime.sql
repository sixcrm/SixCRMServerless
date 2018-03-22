DROP TABLE IF EXISTS analytics.d_datetime;

CREATE TABLE IF NOT EXISTS analytics.d_datetime (
    datetime_id SERIAL PRIMARY KEY,
    datetime TIMESTAMP
);