CREATE SCHEMA product_setup;

CREATE TABLE IF NOT EXISTS product_setup.m_release (
    id INT NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_m_release PRIMARY KEY (id)
);
