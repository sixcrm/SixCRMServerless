CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE product_setup.product
ALTER COLUMN id SET DEFAULT uuid_generate_v4();