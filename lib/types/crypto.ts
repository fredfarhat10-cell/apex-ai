// Cryptocurrency exchange and wallet type definitions

export interface CryptoAccount {
  account_id: string
  exchange: "binance" | "crypto.com" | "kraken" | "coinbase"
  name: string
  type: "spot" | "futures" | "margin" | "savings"
  balances: CryptoBalance[]
  total_value_usd: number
}

export interface CryptoBalance {
  asset: string // BTC, ETH, USDT, etc.
  free: number // Available balance
  locked: number // Locked in orders
  total: number
  usd_value: number
  btc_value: number
}

export interface CryptoTransaction {
  transaction_id: string
  account_id: string
  type: "buy" | "sell" | "deposit" | "withdrawal" | "transfer" | "staking_reward" | "fee"
  asset: string
  amount: number
  price_usd: number
  total_usd: number
  fee: number
  fee_asset: string
  timestamp: string
  status: "completed" | "pending" | "failed"
}

export interface CryptoWallet {
  wallet_id: string
  provider: "metamask" | "phantom" | "trust_wallet"
  name: string
  address: string
  chain: "ethereum" | "solana" | "bsc" | "polygon" | "arbitrum"
  balances: CryptoBalance[]
  total_value_usd: number
}

export interface CryptoPortfolio {
  total_value_usd: number
  total_value_btc: number
  accounts: CryptoAccount[]
  wallets: CryptoWallet[]
  top_holdings: {
    asset: string
    total_amount: number
    usd_value: number
    percentage: number
  }[]
  performance_24h: {
    change_usd: number
    change_percent: number
  }
}
