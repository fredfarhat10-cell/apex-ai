// Crypto Account Aggregation Service
// Manages syncing and storing crypto data from exchanges and wallets

import { openDB, type IDBPDatabase } from "idb"
import type { CryptoAccount, CryptoTransaction, CryptoWallet, CryptoBalance, CryptoPortfolio } from "./types/crypto"

const DB_NAME = "apex-crypto-data"
const DB_VERSION = 1

interface StoredCryptoAccount extends CryptoAccount {
  id: string
  userId: string
  accessToken: string
  lastSynced: string
}

interface StoredCryptoTransaction extends CryptoTransaction {
  id: string
  userId: string
}

interface StoredCryptoWallet extends CryptoWallet {
  id: string
  userId: string
  lastSynced: string
}

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Crypto accounts store
      if (!db.objectStoreNames.contains("crypto_accounts")) {
        const accountStore = db.createObjectStore("crypto_accounts", { keyPath: "id" })
        accountStore.createIndex("userId", "userId")
        accountStore.createIndex("exchange", "exchange")
      }

      // Crypto transactions store
      if (!db.objectStoreNames.contains("crypto_transactions")) {
        const txnStore = db.createObjectStore("crypto_transactions", { keyPath: "id" })
        txnStore.createIndex("userId", "userId")
        txnStore.createIndex("account_id", "account_id")
        txnStore.createIndex("timestamp", "timestamp")
      }

      // Crypto wallets store
      if (!db.objectStoreNames.contains("crypto_wallets")) {
        const walletStore = db.createObjectStore("crypto_wallets", { keyPath: "id" })
        walletStore.createIndex("userId", "userId")
        walletStore.createIndex("provider", "provider")
        walletStore.createIndex("address", "address")
      }
    },
  })

  return dbInstance
}

/**
 * Sync crypto accounts from an exchange
 */
export async function syncCryptoAccounts(
  userId: string,
  exchange: string,
  accessToken: string,
): Promise<StoredCryptoAccount[]> {
  const db = await getDB()

  // In production, this would call the actual exchange API
  // For now, we'll generate mock data
  const mockAccounts = generateMockCryptoAccounts(exchange)

  const storedAccounts: StoredCryptoAccount[] = []

  for (const account of mockAccounts) {
    const storedAccount: StoredCryptoAccount = {
      ...account,
      id: `crypto_acc_${userId}_${account.account_id}`,
      userId,
      accessToken,
      lastSynced: new Date().toISOString(),
    }

    await db.put("crypto_accounts", storedAccount)
    storedAccounts.push(storedAccount)
  }

  console.log("[v0] Synced crypto accounts:", storedAccounts.length)
  return storedAccounts
}

/**
 * Sync crypto transactions from an exchange
 */
export async function syncCryptoTransactions(
  userId: string,
  accountId: string,
  exchange: string,
  days = 30,
): Promise<StoredCryptoTransaction[]> {
  const db = await getDB()

  // In production, this would call the actual exchange API
  const mockTransactions = generateMockCryptoTransactions(accountId, exchange, days)

  const storedTransactions: StoredCryptoTransaction[] = []

  for (const transaction of mockTransactions) {
    const storedTransaction: StoredCryptoTransaction = {
      ...transaction,
      id: `crypto_txn_${userId}_${transaction.transaction_id}`,
      userId,
    }

    await db.put("crypto_transactions", storedTransaction)
    storedTransactions.push(storedTransaction)
  }

  console.log("[v0] Synced crypto transactions:", storedTransactions.length)
  return storedTransactions
}

/**
 * Sync crypto wallet from Web3 provider
 */
export async function syncCryptoWallet(userId: string, provider: string, address: string): Promise<StoredCryptoWallet> {
  const db = await getDB()

  // In production, this would call the actual blockchain API
  const mockWallet = generateMockCryptoWallet(provider, address)

  const storedWallet: StoredCryptoWallet = {
    ...mockWallet,
    id: `crypto_wallet_${userId}_${mockWallet.wallet_id}`,
    userId,
    lastSynced: new Date().toISOString(),
  }

  await db.put("crypto_wallets", storedWallet)

  console.log("[v0] Synced crypto wallet:", storedWallet.address)
  return storedWallet
}

/**
 * Get all crypto accounts for a user
 */
export async function getUserCryptoAccounts(userId: string): Promise<StoredCryptoAccount[]> {
  const db = await getDB()
  const index = db.transaction("crypto_accounts").store.index("userId")
  return index.getAll(userId)
}

/**
 * Get all crypto wallets for a user
 */
export async function getUserCryptoWallets(userId: string): Promise<StoredCryptoWallet[]> {
  const db = await getDB()
  const index = db.transaction("crypto_wallets").store.index("userId")
  return index.getAll(userId)
}

/**
 * Get crypto transactions for a user
 */
export async function getUserCryptoTransactions(userId: string, days = 30): Promise<StoredCryptoTransaction[]> {
  const db = await getDB()
  const index = db.transaction("crypto_transactions").store.index("userId")
  const allTransactions = await index.getAll(userId)

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  return allTransactions.filter((txn) => txn.timestamp >= cutoffDate)
}

/**
 * Calculate crypto portfolio summary
 */
export async function getCryptoPortfolio(userId: string): Promise<CryptoPortfolio> {
  const accounts = await getUserCryptoAccounts(userId)
  const wallets = await getUserCryptoWallets(userId)

  const totalValueUsd = [...accounts, ...wallets].reduce((sum, item) => sum + item.total_value_usd, 0)

  // Aggregate holdings across all accounts and wallets
  const holdingsMap = new Map<string, { amount: number; usd_value: number }>()

  for (const account of accounts) {
    for (const balance of account.balances) {
      const existing = holdingsMap.get(balance.asset) || { amount: 0, usd_value: 0 }
      holdingsMap.set(balance.asset, {
        amount: existing.amount + balance.total,
        usd_value: existing.usd_value + balance.usd_value,
      })
    }
  }

  for (const wallet of wallets) {
    for (const balance of wallet.balances) {
      const existing = holdingsMap.get(balance.asset) || { amount: 0, usd_value: 0 }
      holdingsMap.set(balance.asset, {
        amount: existing.amount + balance.total,
        usd_value: existing.usd_value + balance.usd_value,
      })
    }
  }

  const topHoldings = Array.from(holdingsMap.entries())
    .map(([asset, data]) => ({
      asset,
      total_amount: data.amount,
      usd_value: data.usd_value,
      percentage: (data.usd_value / totalValueUsd) * 100,
    }))
    .sort((a, b) => b.usd_value - a.usd_value)
    .slice(0, 10)

  return {
    total_value_usd: totalValueUsd,
    total_value_btc: totalValueUsd / 45000, // Mock BTC price
    accounts,
    wallets,
    top_holdings: topHoldings,
    performance_24h: {
      change_usd: totalValueUsd * 0.03, // Mock 3% gain
      change_percent: 3.0,
    },
  }
}

// Mock data generators
function generateMockCryptoAccounts(exchange: string): CryptoAccount[] {
  const balances: CryptoBalance[] = [
    { asset: "BTC", free: 0.5, locked: 0.1, total: 0.6, usd_value: 27000, btc_value: 0.6 },
    { asset: "ETH", free: 5.2, locked: 0.3, total: 5.5, usd_value: 11000, btc_value: 0.244 },
    { asset: "USDT", free: 15000, locked: 0, total: 15000, usd_value: 15000, btc_value: 0.333 },
  ]

  return [
    {
      account_id: `${exchange}_spot_${Date.now()}`,
      exchange: exchange as any,
      name: `${exchange.charAt(0).toUpperCase() + exchange.slice(1)} Spot Account`,
      type: "spot",
      balances,
      total_value_usd: balances.reduce((sum, b) => sum + b.usd_value, 0),
    },
  ]
}

function generateMockCryptoTransactions(accountId: string, exchange: string, days: number): CryptoTransaction[] {
  const transactions: CryptoTransaction[] = []
  const types: CryptoTransaction["type"][] = ["buy", "sell", "deposit", "withdrawal"]

  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString()
    transactions.push({
      transaction_id: `${exchange}_txn_${Date.now()}_${i}`,
      account_id: accountId,
      type: types[Math.floor(Math.random() * types.length)],
      asset: ["BTC", "ETH", "USDT"][Math.floor(Math.random() * 3)],
      amount: Math.random() * 2,
      price_usd: 45000 + Math.random() * 5000,
      total_usd: Math.random() * 2 * (45000 + Math.random() * 5000),
      fee: Math.random() * 10,
      fee_asset: "USDT",
      timestamp,
      status: "completed",
    })
  }

  return transactions
}

function generateMockCryptoWallet(provider: string, address: string): CryptoWallet {
  const balances: CryptoBalance[] = [
    { asset: "ETH", free: 2.5, locked: 0, total: 2.5, usd_value: 5000, btc_value: 0.111 },
    { asset: "USDC", free: 5000, locked: 0, total: 5000, usd_value: 5000, btc_value: 0.111 },
  ]

  return {
    wallet_id: `${provider}_${Date.now()}`,
    provider: provider as any,
    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Wallet`,
    address,
    chain: provider === "phantom" ? "solana" : "ethereum",
    balances,
    total_value_usd: balances.reduce((sum, b) => sum + b.usd_value, 0),
  }
}
