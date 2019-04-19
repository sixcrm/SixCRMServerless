CREATE SCHEMA subscriptions;

CREATE TABLE subscriptions.subscription (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	account_id UUID NOT NULL,
	customer_id UUID NOT NULL,
	product_schedule_id UUID NOT NULL REFERENCES product_setup.product_schedule(id),
	name VARCHAR(55) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	merchant_provider_id UUID,
	requires_confirmation BOOLEAN NOT NULL
);

CREATE INDEX ix_subscription_account_id ON subscriptions.subscription(account_id);

CREATE TABLE subscriptions.subscription_cycle (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	subscription_id UUID NOT NULL REFERENCES subscriptions.subscription(id),
	name VARCHAR(55),
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	length INTERVAL,
	position INT NOT NULL CHECK (position >= 0),
	next_position INT CHECK (next_position IS NULL OR next_position >= 0),
	price NUMERIC(19,2) NOT NULL CHECK (price >= 0),
	shipping_price NUMERIC(19,2) CHECK (shipping_price IS NULL OR shipping_price >= 0)
);

CREATE TABLE subscriptions.subscription_cycle_product (
	subscription_cycle_id UUID NOT NULL REFERENCES subscriptions.subscription_cycle(id),
	product_id UUID NOT NULL REFERENCES product_setup.product(id),
	PRIMARY KEY (subscription_cycle_id, product_id),
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	quantity INT NOT NULL CHECK (quantity > 0),
	is_shipping BOOLEAN NOT NULL,
	position INT NOT NULL CHECK (position >= 0)
);
