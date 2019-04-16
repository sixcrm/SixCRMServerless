CREATE TABLE product_setup.product (
	id UUID NOT NULL PRIMARY KEY,
	account_id UUID NOT NULL,
	name VARCHAR(55) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT now(),
	updated_at TIMESTAMP NOT NULL DEFAULT now(),
	price NUMERIC(19,2) NOT NULL CHECK (price >= 0),
	is_shippable BOOLEAN NOT NULL,
	shipping_price NUMERIC(19,2) CHECK (shipping_price IS NULL OR shipping_price >= 0),
	shipping_delay INTERVAL,
	fulfillment_provider_id UUID,
	description TEXT,
	sku VARCHAR(36),
	image_urls TEXT[] NOT NULL,
	merchant_provider_group_id UUID,
	CHECK (is_shippable = FALSE OR (shipping_price IS NOT NULL AND shipping_delay IS NOT NULL AND fulfillment_provider_id IS NOT NULL))
);

CREATE INDEX ix_product_account_id ON product_setup.product(account_id);
