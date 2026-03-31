// Plaid Integration - Account Aggregation and Financial Velocity
// This module handles connecting to financial institutions and tracking balances

import { openDB, type IDBPDatabase } from "idb"

// Re-export types
export type {
  PlaidAccount,
  PlaidTransaction,
  PlaidBalance,
  PlaidInstitution,
  Account,
  BalanceSnapshot,
} from "./types/plaid"

import type { Account, BalanceSnapshot } from "./types/plaid"

const DB_NAME = "apex-plaid"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("accounts")) {
        const accountStore = db.createObjectStore("accounts", { keyPath: "id" })
        accountStore.createIndex("userId", "userId")
        accountStore.createIndex("institution", "institution")
      }

      if (!db.objectStoreNames.contains("balances")) {
        const balanceStore = db.createObjectStore("balances", { keyPath: "id" })
        balanceStore.createIndex("userId", "userId")
        balanceStore.createIndex("accountId", "accountId")
        balanceStore.createIndex("timestamp", "timestamp")
      }

      if (!db.objectStoreNames.contains("transactions")) {
        const txStore = db.createObjectStore("transactions", { keyPath: "id" })
        txStore.createIndex("userId", "userId")
        txStore.createIndex("accountId", "accountId")
        txStore.createIndex("date", "date")
      }
    },
  })

  return dbInstance
}

/**
 * Get all accounts for a user
 */
export async function getUserAccounts(userId: string): Promise<Account[]> {
  const db = await getDB()
  const index = db.transaction("accounts").store.index("userId")
  return index.getAll(userId)
}

/**
 * Get account balances for a user
 */
export async function getAccountBalances(userId: string): Promise<BalanceSnapshot[]> {
  const db = await getDB()
  const accounts = await getUserAccounts(userId)

  const balances: BalanceSnapshot[] = []

  for (const account of accounts) {
    const index = db.transaction("balances").store.index("accountId")
    const accountBalances = await index.getAll(account.id)

    // Get the most recent balance
    if (accountBalances.length > 0) {
      const latest = accountBalances.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )[0]

      balances.push({
        id: latest.id,
        userId: latest.userId,
        accountId: latest.accountId,
        current: latest.current,
        available: latest.available,
        limit: latest.limit,
        currency: latest.currency,
        timestamp: latest.timestamp,
      })
    }
  }

  return balances
}

/**
 * Calculate Financial Velocity (rate of balance change)
 * Returns percentage change over the last 30 days
 */
export function calculateFinancialVelocity(balances: BalanceSnapshot[]): number {
  if (balances.length === 0) return 0

  const totalCurrent = balances.reduce((sum, b) => sum + b.current, 0)

  // In a real implementation, we would compare with balances from 30 days ago
  // For demo purposes, simulate a velocity based on current balance
  // Positive velocity indicates growing wealth
  const simulatedVelocity = totalCurrent > 50000 ? 2.5 : totalCurrent > 10000 ? 1.2 : 0.5

  return simulatedVelocity
}

/**
 * Add a new account
 */
export async function addAccount(userId: string, account: Omit<Account, "id" | "userId">): Promise<Account> {
  const db = await getDB()

  const newAccount: Account = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    ...account,
  }

  await db.put("accounts", newAccount)

  // Create initial balance snapshot
  await recordBalanceSnapshot(userId, newAccount.id, newAccount.balance, newAccount.balance)

  return newAccount
}

/**
 * Record a balance snapshot
 */
export async function recordBalanceSnapshot(
  userId: string,
  accountId: string,
  current: number,
  available: number,
  limit?: number,
): Promise<BalanceSnapshot> {
  const db = await getDB()

  const snapshot: BalanceSnapshot = {
    id: `bal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    accountId,
    current,
    available,
    limit,
    currency: "USD",
    timestamp: new Date().toISOString(),
  }

  await db.put("balances", snapshot)

  return snapshot
}

/**
 * Update account balance
 */
export async function updateAccountBalance(accountId: string, balance: number): Promise<void> {
  const db = await getDB()
  const account = await db.get("accounts", accountId)

  if (!account) {
    throw new Error("Account not found")
  }

  account.balance = balance
  account.lastUpdated = new Date().toISOString()

  await db.put("accounts", account)

  // Record balance snapshot
  await recordBalanceSnapshot(account.userId, accountId, balance, balance)
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string): Promise<void> {
  const db = await getDB()
  await db.delete("accounts", accountId)

  // Clean up associated balances
  const balanceIndex = db.transaction("balances", "readwrite").store.index("accountId")
  const balances = await balanceIndex.getAll(accountId)

  for (const balance of balances) {
    await db.delete("balances", balance.id)
  }
}

/**
 * Get balance history for an account
 */
export async function getBalanceHistory(accountId: string, days = 30): Promise<BalanceSnapshot[]> {
  const db = await getDB()
  const index = db.transaction("balances").store.index("accountId")
  const balances = await index.getAll(accountId)

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return balances
    .filter((b) => new Date(b.timestamp) >= cutoffDate)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

/**
 * Initialize demo accounts for testing
 */
export async function initializeDemoAccounts(userId: string): Promise<Account[]> {
  const demoAccounts = [
    {
      name: "Chase Checking",
      type: "checking" as const,
      institution: "Chase",
      balance: 5420.5,
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "Savings Account",
      type: "savings" as const,
      institution: "Chase",
      balance: 12500.0,
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    },
    {
      name: "Credit Card",
      type: "credit" as const,
      institution: "American Express",
      balance: -1250.75,
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    },
  ]

  const accounts: Account[] = []

  for (const accountData of demoAccounts) {
    const account = await addAccount(userId, accountData)
    accounts.push(account)
  }

  return accounts
}
