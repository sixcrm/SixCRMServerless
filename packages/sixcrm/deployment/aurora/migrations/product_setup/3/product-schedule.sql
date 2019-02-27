CREATE TABLE product_schedule (
	id UUID NOT NULL PRIMARY KEY,
	account_id UUID NOT NULL,
	name VARCHAR(55) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	merchant_provider_group_id UUID NOT NULL,
	requires_confirmation BOOLEAN NOT NULL
);

CREATE INDEX ix_product_schedule_account_id ON product_setup.product_schedule(account_id);

CREATE TABLE cycle (
	id UUID NOT NULL PRIMARY KEY,
	product_schedule_id NOT NULL REFERENCES product_schedule(id),
	name VARCHAR(55) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	is_monthly BOOLEAN NOT NULL,
	length INT CHECK (length IS NULL OR length > 0),
	position INT NOT NULL CHECK (position >= 0),
	next_position INT CHECK (next_position IS NULL OR next_position >= 0),
	price NUMERIC(19,2) NOT NULL CHECK (price >= 0),
	shipping_price NUMERIC(19,2) CHECK (shipping_price IS NULL OR shipping_price >= 0),
	CHECK (is_monthly = true OR length IS NOT NULL)
);

CREATE TABLE cycle_products (
	cycle_id UUID NOT NULL REFERENCES cycle(id),
	product_id UUID NOT NULL REFERENCES product(id),
	PRIMARY KEY (cycle_id, product_id),
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	quantity INT NOT NULL CHECK (quantity > 0),
	is_shipping BOOLEAN NOT NULL,
	position INT NOT NULL CHECK (position > 0)
);
