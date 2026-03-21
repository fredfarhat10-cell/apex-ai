// Account Aggregation Service
// Manages syncing and storing financial data from Plaid

import { openDB, type IDBPDatabase } from "idb"
import type { PlaidAccount, PlaidTransaction, PlaidInvestmentHolding, PlaidSecurity } from "./types/plaid"
import { getAccounts, getTransactions, getInvestmentHoldings } from "./plaid-client"

const DB_NAME = "apex-financial-data"
const DB_VERSION = 1

interface StoredAccount extends PlaidAccount {
  id: string
  userId: string
  accessToken: string
  lastSynced: string
}

interface StoredTransaction extends PlaidTransaction {
  id: string
  userId: string
}

interface StoredHolding extends PlaidInvestmentHolding {
  id: string
  userId: string
  lastSynced: string
}

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Accounts store
      if (!db.objectStoreNames.contains("accounts")) {
        const accountStore = db.createObjectStore("accounts", { keyPath: "id" })
        accountStore.createIndex("userId", "userId")
        accountStore.createIndex("account_id", "account_id")
      }

      // Transactions store
      if (!db.objectStoreNames.contains("transactions")) {
        const txnStore = db.createObjectStore("transactions", { keyPath: "id" })
        txnStore.createIndex("userId", "userId")
        txnStore.createIndex("account_id", "account_id")
        txnStore.createIndex("date", "date")
      }

      // Holdings store
      if (!db.objectStoreNames.contains("holdings")) {
        const holdingStore = db.createObjectStore("holdings", { keyPath: "id" })
        holdingStore.createIndex("userId", "userId")
        holdingStore.createIndex("account_id", "account_id")
      }

      // Securities store
      if (!db.objectStoreNames.contains("securities")) {
        const securityStore = db.createObjectStore("securities", { keyPath: "security_id" })
        securityStore.createIndex("ticker_symbol", "ticker_symbol")
      }
    },
  })

  return dbInstance
}

/**
 * Sync accounts from Plaid
 */
export async function syncAccounts(userId: string, accessToken: string): Promise<StoredAccount[]> {
  const db = await getDB()
  const accounts = await getAccounts(accessToken)

  const storedAccounts: StoredAccount[] = []

  for (const account of accounts) {
    const storedAccount: StoredAccount = {
      ...account,
      id: `acc_${userId}_${account.account_id}`,
      userId,
      accessToken,
      lastSynced: new Date().toISOString(),
    }

    await db.put("accounts", storedAccount)
    storedAccounts.push(storedAccount)
  }

  console.log("[v0] Synced accounts:", storedAccounts.length)
  return storedAccounts
}

/**
 * Sync transactions from Plaid
 */
export async function syncTransactions(
  userId: string,
  accessToken: string,
  startDate: string,
  endDate: string,
): Promise<StoredTransaction[]> {
  const db = await getDB()
  const transactions = await getTransactions(accessToken, startDate, endDate)

  const storedTransactions: StoredTransaction[] = []

  for (const transaction of transactions) {
    const storedTransaction: StoredTransaction = {
      ...transaction,
      id: `txn_${userId}_${transaction.transaction_id}`,
      userId,
    }

    await db.put("transactions", storedTransaction)
    storedTransactions.push(storedTransaction)
  }

  console.log("[v0] Synced transactions:", storedTransactions.length)
  return storedTransactions
}

/**
 * Sync investment holdings from Plaid
 */
export async function syncInvestments(
  userId: string,
  accessToken: string,
): Promise<{
  holdings: StoredHolding[]
  securities: PlaidSecurity[]
}> {
  const db = await getDB()
  const { holdings, securities } = await getInvestmentHoldings(accessToken)

  const storedHoldings: StoredHolding[] = []

  for (const holding of holdings) {
    const storedHolding: StoredHolding = {
      ...holding,
      id: `holding_${userId}_${holding.account_id}_${holding.security_id}`,
      userId,
      lastSynced: new Date().toISOString(),
    }

    await db.put("holdings", storedHolding)
    storedHoldings.push(storedHolding)
  }

  // Store securities
  for (const security of securities) {
    await db.put("securities", security)
  }

  console.log("[v0] Synced holdings:", storedHoldings.length)
  console.log("[v0] Synced securities:", securities.length)

  return { holdings: storedHoldings, securities }
}

/**
 * Get all accounts for a user
 */
export async function getUserAccounts(userId: string): Promise<StoredAccount[]> {
  const db = await getDB()
  const index = db.transaction("accounts").store.index("userId")
  return index.getAll(userId)
}

/**
 * Get transactions for a user
 */
export async function getUserTransactions(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<StoredTransaction[]> {
  const db = await getDB()
  const index = db.transaction("transactions").store.index("userId")
  const allTransactions = await index.getAll(userId)

  if (!startDate && !endDate) {
    return allTransactions
  }

  return allTransactions.filter((txn) => {
    if (startDate && txn.date < startDate) return false
    if (endDate && txn.date > endDate) return false
    return true
  })
}

/**
 * Get holdings for a user
 */
export async function getUserHoldings(userId: string): Promise<StoredHolding[]> {
  const db = await getDB()
  const index = db.transaction("holdings").store.index("userId")
  return index.getAll(userId)
}

/**
 * Calculate financial velocity (rate of net worth change)
 */
export async function calculateFinancialVelocity(
  userId: string,
  days = 30,
): Promise<{
  currentNetWorth: number
  previousNetWorth: number
  velocity: number
  velocityPercent: number
}> {
  const accounts = await getUserAccounts(userId)
  const currentNetWorth = accounts.reduce((sum, acc) => sum + (acc.balances.current || 0), 0)

  // Calculate net worth from 'days' ago using transaction history
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

  const transactions = await getUserTransactions(
    userId,
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0],
  )

  const netChange = transactions.reduce((sum, txn) => sum + txn.amount, 0)
  const previousNetWorth = currentNetWorth - netChange

  const velocity = netChange / days // Daily velocity
  const velocityPercent = previousNetWorth > 0 ? (velocity / previousNetWorth) * 100 : 0

  return {
    currentNetWorth,
    previousNetWorth,
    velocity,
    velocityPercent,
  }
}
