CREATE TABLE product_setup.product_schedule (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	account_id UUID NOT NULL,
	name VARCHAR(55) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	merchant_provider_group_id UUID,
	requires_confirmation BOOLEAN NOT NULL
);

CREATE INDEX ix_product_schedule_account_id ON product_setup.product_schedule(account_id);

CREATE TABLE product_setup.cycle (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	product_schedule_id UUID REFERENCES product_setup.product_schedule(id),
	name VARCHAR(55),
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	length INTERVAL,
	position INT NOT NULL CHECK (position >= 0),
	next_position INT CHECK (next_position IS NULL OR next_position >= 0),
	price NUMERIC(19,2) NOT NULL CHECK (price >= 0),
	shipping_price NUMERIC(19,2) CHECK (shipping_price IS NULL OR shipping_price >= 0)
);

CREATE TABLE product_setup.cycle_product (
	cycle_id UUID REFERENCES product_setup.cycle(id),
	product_id UUID REFERENCES product_setup.product(id),
	PRIMARY KEY (cycle_id, product_id),
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	quantity INT NOT NULL CHECK (quantity > 0),
	is_shipping BOOLEAN NOT NULL,
	position INT NOT NULL CHECK (position >= 0)
);
