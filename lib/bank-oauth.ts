// Bank OAuth Integration
// Supports Plaid, TrueLayer, and direct bank connections

import { connectionStorage } from "./financial-storage"
import type { BankConnection } from "./types/financial"

export interface BankProvider {
  id: string
  name: string
  type: "aggregator" | "direct"
  authUrl: string
  tokenUrl: string
  scope: string
  clientId?: string
  requiresSetup: boolean
}

export const BANK_PROVIDERS: Record<string, BankProvider> = {
  plaid: {
    id: "plaid",
    name: "Plaid (Multiple Banks)",
    type: "aggregator",
    authUrl: "https://cdn.plaid.com/link/v2/stable/link.html",
    tokenUrl: "https://production.plaid.com/item/public_token/exchange",
    scope: "transactions balance",
    requiresSetup: true,
  },
  truelayer: {
    id: "truelayer",
    name: "TrueLayer (UK/EU Banks)",
    type: "aggregator",
    authUrl: "https://auth.truelayer.com",
    tokenUrl: "https://auth.truelayer.com/connect/token",
    scope: "accounts transactions balance",
    requiresSetup: true,
  },
  chase: {
    id: "chase",
    name: "Chase Bank",
    type: "direct",
    authUrl: "https://secure.chase.com/web/auth",
    tokenUrl: "https://api.chase.com/oauth/token",
    scope: "accounts transactions",
    requiresSetup: true,
  },
  bofa: {
    id: "bofa",
    name: "Bank of America",
    type: "direct",
    authUrl: "https://secure.bankofamerica.com/login",
    tokenUrl: "https://api.bankofamerica.com/oauth/token",
    scope: "accounts transactions",
    requiresSetup: true,
  },
  wells_fargo: {
    id: "wells_fargo",
    name: "Wells Fargo",
    type: "direct",
    authUrl: "https://connect.wellsfargo.com/auth",
    tokenUrl: "https://api.wellsfargo.com/oauth/token",
    scope: "accounts transactions",
    requiresSetup: true,
  },
  citi: {
    id: "citi",
    name: "Citibank",
    type: "direct",
    authUrl: "https://online.citi.com/US/login",
    tokenUrl: "https://api.citi.com/oauth/token",
    scope: "accounts transactions",
    requiresSetup: true,
  },
  santander: {
    id: "santander",
    name: "Santander",
    type: "direct",
    authUrl: "https://www.santander.com/oauth/authorize",
    tokenUrl: "https://api.santander.com/oauth/token",
    scope: "accounts transactions",
    requiresSetup: true,
  },
}

/**
 * Initialize bank OAuth flow
 */
export async function initiateBankOAuth(providerId: string, userId: string): Promise<string> {
  const provider = BANK_PROVIDERS[providerId]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`)
  }

  // For demo purposes, we'll simulate the OAuth flow
  // In production, this would open the actual OAuth popup
  const state = btoa(JSON.stringify({ providerId, userId, timestamp: Date.now() }))
  const redirectUri = `${window.location.origin}/financial/auth/callback`

  const authUrl = new URL(provider.authUrl)
  authUrl.searchParams.set("client_id", provider.clientId || "demo_client_id")
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("scope", provider.scope)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("response_type", "code")

  return authUrl.toString()
}

/**
 * Handle OAuth callback and exchange code for token
 */
export async function handleBankOAuthCallback(
  code: string,
  state: string,
): Promise<{
  provider: string
  userId: string
  accessToken: string
  refreshToken?: string
  expiresIn: number
}> {
  try {
    const stateData = JSON.parse(atob(state))
    const { providerId, userId } = stateData

    const provider = BANK_PROVIDERS[providerId]
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`)
    }

    // In production, this would make a real API call to exchange the code
    // For demo, we'll simulate a successful token exchange
    const mockToken = `${providerId}_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockRefreshToken = `${providerId}_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      provider: providerId,
      userId,
      accessToken: mockToken,
      refreshToken: mockRefreshToken,
      expiresIn: 3600, // 1 hour
    }
  } catch (error) {
    console.error("[v0] Error handling bank OAuth callback:", error)
    throw error
  }
}

/**
 * Connect a bank account
 */
export async function connectBankAccount(
  userId: string,
  providerId: string,
  accessToken: string,
  refreshToken?: string,
): Promise<BankConnection> {
  const provider = BANK_PROVIDERS[providerId]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`)
  }

  // Fetch account details (simulated for demo)
  const accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const accountName = `${provider.name} Account`

  const connection = connectionStorage.create({
    userId,
    provider: providerId,
    accountId,
    accountName,
    accountType: "brokerage",
    accessToken,
    refreshToken,
    tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    lastSyncedAt: new Date(),
    isActive: true,
  })

  return connection
}

/**
 * Fetch transactions from connected bank
 */
export async function fetchBankTransactions(
  connection: BankConnection,
  startDate?: Date,
  endDate?: Date,
): Promise<
  Array<{
    id: string
    date: Date
    description: string
    amount: number
    type: "debit" | "credit"
    category?: string
  }>
> {
  try {
    // In production, this would call the actual bank API
    // For demo, we'll return mock transactions
    const mockTransactions = [
      {
        id: `txn_${Date.now()}_1`,
        date: new Date(Date.now() - 86400000 * 1), // 1 day ago
        description: "Stock Purchase - AAPL",
        amount: -1500.0,
        type: "debit" as const,
        category: "Investment",
      },
      {
        id: `txn_${Date.now()}_2`,
        date: new Date(Date.now() - 86400000 * 3), // 3 days ago
        description: "Dividend Payment - MSFT",
        amount: 45.5,
        type: "credit" as const,
        category: "Dividend",
      },
      {
        id: `txn_${Date.now()}_3`,
        date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        description: "Stock Sale - TSLA",
        amount: 2300.0,
        type: "credit" as const,
        category: "Investment",
      },
      {
        id: `txn_${Date.now()}_4`,
        date: new Date(Date.now() - 86400000 * 7), // 7 days ago
        description: "ETF Purchase - VOO",
        amount: -800.0,
        type: "debit" as const,
        category: "Investment",
      },
    ]

    // Update last synced time
    connectionStorage.updateSyncTime(connection.id)

    return mockTransactions
  } catch (error) {
    console.error("[v0] Error fetching bank transactions:", error)
    return []
  }
}

/**
 * Refresh access token
 */
export async function refreshBankToken(connection: BankConnection): Promise<string> {
  if (!connection.refreshToken) {
    throw new Error("No refresh token available")
  }

  // In production, this would call the token refresh endpoint
  // For demo, we'll generate a new mock token
  const newToken = `${connection.provider}_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return newToken
}

/**
 * Disconnect bank account
 */
export async function disconnectBankAccount(connectionId: string): Promise<boolean> {
  return connectionStorage.deactivate(connectionId)
}

/**
 * Get account balance (simulated)
 */
export async function getBankAccountBalance(connection: BankConnection): Promise<{
  available: number
  current: number
  currency: string
}> {
  // In production, this would call the actual bank API
  // For demo, return mock balance
  return {
    available: 25000 + Math.random() * 10000,
    current: 25000 + Math.random() * 10000,
    currency: "USD",
  }
}
