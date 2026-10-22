-- Execution-cost model (order-book slippage, short funding) and experience-memory snapshot.
ALTER TABLE paper_trades ADD COLUMN costs_json TEXT;
ALTER TABLE trade_outcomes ADD COLUMN funding_gbp REAL NOT NULL DEFAULT 0;
ALTER TABLE investigations ADD COLUMN memory_json TEXT;
