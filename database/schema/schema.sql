-- schema.sql

-- Create config_rules table
CREATE TABLE config_rules (
    id SERIAL PRIMARY KEY,                          
    name TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT,
    min_value_eth NUMERIC,
    max_value_eth NUMERIC,
    require_data BOOLEAN DEFAULT FALSE,
    min_gas_price_gwei NUMERIC,
    type INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table with FK to config_rules
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL,
    block_number INTEGER NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    value NUMERIC(38, 0),
    gas_price BIGINT,
    nonce INTEGER,
    rule_id INTEGER NOT NULL REFERENCES config_rules(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT NOW()
);
