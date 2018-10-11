CREATE TABLE analytics.d_customer (
	id VARCHAR(36) NOT NULL,
	account VARCHAR(36) NOT NULL,
	firstname VARCHAR(100),
	lastname VARCHAR(100),
	email VARCHAR(255),
	phone VARCHAR(100),
	city VARCHAR(100),
	state VARCHAR(100),
	zip VARCHAR(10),
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	CONSTRAINT pk_f_customer PRIMARY KEY (id)
);
