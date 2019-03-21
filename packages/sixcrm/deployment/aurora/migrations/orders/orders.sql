CREATE TABLE orders.order (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	account_id UUID NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	alias CHAR(10) NOT NULL UNIQUE,
	campaign_id UUID NOT NULL,
	customer_id UUID NOT NULL
);

CREATE INDEX ix_order_account_id ON orders.order(account_id);

CREATE TABLE orders.line_item (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	order_id UUID NOT NULL REFERENCES orders.order(id),
	name VARCHAR(55) NOT NULL,
	amount NUMERIC(19,2) NOT NULL CHECK (amount >= 0),
	merchant_provider_group_id UUID
);

CREATE TABLE orders.subscription_line_item (
	line_item_id UUID NOT NULL REFERENCES orders.line_item(id),
	subscription_cycle_id UUID NOT NULL REFERENCES subscriptions.subscription_cycle(id)
);

CREATE TABLE orders.line_item_product (
	line_item_id UUID NOT NULL REFERENCES orders.line_item(id),
	product_id UUID NOT NULL REFERENCES product_setup.product(id),
	description TEXT,
	sku VARCHAR(36),
	image_urls TEXT[] NOT NULL,
	is_shippable BOOLEAN NOT NULL,
	shipping_price NUMERIC(19,2) CHECK (shipping_price IS NULL OR shipping_price >= 0),
	shipping_delay INTERVAL,
	fulfillment_provider_id UUID
);

CREATE TABLE orders.transaction (
	id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
	order_id UUID NOT NULL REFERENCES orders.order(id),
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	alias CHAR(10) NOT NULL UNIQUE,
	merchant_provider_id UUID NOT NULL,
	amount NUMERIC(19,2) NOT NULL,
	credit_card_id UUID,
	type VARCHAR(20) NOT NULL,
	processor_response TEXT,
	result VARCHAR(20) NOT NULL
);
