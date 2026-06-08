-- Blocks table (main blockchain ledger)
CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  block_number INTEGER UNIQUE NOT NULL,
  hash VARCHAR(255) UNIQUE NOT NULL,
  prev_hash VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  property_id VARCHAR(50),
  owner_name VARCHAR(255),
  aadhaar_last4 VARCHAR(4),
  pan VARCHAR(10),
  survey_no VARCHAR(100),
  khasra_no VARCHAR(100),
  area NUMERIC,
  circle_rate NUMERIC,
  declared_value NUMERIC,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  city VARCHAR(100),
  property_type VARCHAR(50),
  event_type VARCHAR(50),
  status VARCHAR(50),
  notes TEXT,
  new_owner VARCHAR(255),
  stamp_duty NUMERIC,
  registration_fee NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud rejections table
CREATE TABLE IF NOT EXISTS fraud_rejections (
  id SERIAL PRIMARY KEY,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  owner_name VARCHAR(255),
  pan VARCHAR(10),
  aadhaar_last4 VARCHAR(4),
  city VARCHAR(100),
  survey_no VARCHAR(100),
  declared_value NUMERIC,
  circle_rate NUMERIC,
  area NUMERIC,
  rejection_reasons JSONB,
  raw_data JSONB
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_blocks_property_id ON blocks(property_id);
CREATE INDEX IF NOT EXISTS idx_blocks_city ON blocks(city);
CREATE INDEX IF NOT EXISTS idx_blocks_event_type ON blocks(event_type);
CREATE INDEX IF NOT EXISTS idx_blocks_owner_name ON blocks(owner_name);
CREATE INDEX IF NOT EXISTS idx_blocks_survey_no ON blocks(survey_no);
CREATE INDEX IF NOT EXISTS idx_fraud_city ON fraud_rejections(city);
