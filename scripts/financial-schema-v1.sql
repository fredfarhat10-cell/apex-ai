-- Financial Agent Database Schema
-- Version 1.0
-- This script creates the necessary tables for the Financial Agent module

-- Users table (assumed to exist from main app)
-- CREATE TABLE IF NOT EXISTS users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   email TEXT UNIQUE NOT NULL,
--   name TEXT,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Financial Portfolios
CREATE TABLE IF NOT EXISTS financial_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT DEFAULT 'USD',
  total_value NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Positions (Holdings)
CREATE TABLE IF NOT EXISTS financial_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES financial_portfolios(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- 'stock', 'etf', 'bond', 'crypto', 'mutual_fund'
  quantity NUMERIC(15, 8) NOT NULL,
  avg_cost NUMERIC(15, 4) NOT NULL,
  current_price NUMERIC(15, 4),
  market_value NUMERIC(15, 2),
  unrealized_pnl NUMERIC(15, 2),
  unrealized_pnl_percent NUMERIC(8, 4),
  sector TEXT,
  region TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES financial_portfolios(id) ON DELETE CASCADE,
  position_id UUID REFERENCES financial_positions(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'buy', 'sell', 'dividend', 'deposit', 'withdrawal'
  ticker TEXT,
  quantity NUMERIC(15, 8),
  price NUMERIC(15, 4),
  total_amount NUMERIC(15, 2) NOT NULL,
  fees NUMERIC(15, 2) DEFAULT 0,
  notes TEXT,
  transaction_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Risk Scores
CREATE TABLE IF NOT EXISTS financial_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES financial_portfolios(id) ON DELETE CASCADE,
  overall_score NUMERIC(5, 2) NOT NULL, -- 0-100 scale
  volatility NUMERIC(8, 4),
  beta NUMERIC(8, 4),
  max_drawdown NUMERIC(8, 4),
  sharpe_ratio NUMERIC(8, 4),
  esg_score NUMERIC(5, 2), -- 0-100 scale
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'very_high'
  computed_at TIMESTAMP DEFAULT NOW()
);

-- ESG Ratings (Environmental, Social, Governance)
CREATE TABLE IF NOT EXISTS financial_esg_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  environmental_score NUMERIC(5, 2),
  social_score NUMERIC(5, 2),
  governance_score NUMERIC(5, 2),
  overall_esg_score NUMERIC(5, 2),
  controversy_level TEXT, -- 'none', 'low', 'medium', 'high'
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Market Data Cache
CREATE TABLE IF NOT EXISTS financial_market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  price NUMERIC(15, 4) NOT NULL,
  change NUMERIC(15, 4),
  change_percent NUMERIC(8, 4),
  volume BIGINT,
  market_cap NUMERIC(20, 2),
  pe_ratio NUMERIC(8, 4),
  dividend_yield NUMERIC(8, 4),
  week_52_high NUMERIC(15, 4),
  week_52_low NUMERIC(15, 4),
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(ticker, timestamp)
);

-- AI Insights and Recommendations
CREATE TABLE IF NOT EXISTS financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES financial_portfolios(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'recommendation', 'alert', 'analysis', 'warning'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  action_items JSONB,
  confidence_score NUMERIC(5, 2), -- 0-100 scale
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Bank/Brokerage Connections
CREATE TABLE IF NOT EXISTS financial_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'santander', 'chase', 'robinhood', 'fidelity', etc.
  account_id TEXT NOT NULL,
  account_name TEXT,
  account_type TEXT, -- 'checking', 'savings', 'brokerage', 'retirement'
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider, account_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON financial_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_portfolio_id ON financial_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON financial_positions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON financial_transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_scores_portfolio_id ON financial_risk_scores(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_market_data_ticker ON financial_market_data(ticker);
CREATE INDEX IF NOT EXISTS idx_insights_portfolio_id ON financial_insights(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON financial_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON financial_connections(user_id);
