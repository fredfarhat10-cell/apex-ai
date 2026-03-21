// Plaid API Client

import type {
  PlaidAccount,
  PlaidTransaction,
  PlaidInvestmentHolding,
  PlaidSecurity,
  PlaidLinkToken,
  PlaidAccessTokenResponse,
  PlaidItem,
} from "./types/plaid"

const PLAID_ENV = process.env.NEXT_PUBLIC_PLAID_ENV || "sandbox"
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET

/**
 * Create a Link token for Plaid Link initialization
 */
export async function createLinkToken(userId: string): Promise<PlaidLinkToken> {
  try {
    const response = await fetch("/api/plaid/create-link-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error("Failed to create link token")
    }

    return response.json()
  } catch (error) {
    console.error("[v0] Error creating link token:", error)
    throw error
  }
}

/**
 * Exchange public token for access token
 */
export async function exchangePublicToken(publicToken: string): Promise<PlaidAccessTokenResponse> {
  try {
    const response = await fetch("/api/plaid/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicToken }),
    })

    if (!response.ok) {
      throw new Error("Failed to exchange public token")
    }

    return response.json()
  } catch (error) {
    console.error("[v0] Error exchanging public token:", error)
    throw error
  }
}

/**
 * Get accounts for an access token
 */
export async function getAccounts(accessToken: string): Promise<PlaidAccount[]> {
  try {
    const response = await fetch("/api/plaid/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch accounts")
    }

    const data = await response.json()
    return data.accounts
  } catch (error) {
    console.error("[v0] Error fetching accounts:", error)
    throw error
  }
}

/**
 * Get transactions for an access token
 */
export async function getTransactions(
  accessToken: string,
  startDate: string,
  endDate: string,
): Promise<PlaidTransaction[]> {
  try {
    const response = await fetch("/api/plaid/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, startDate, endDate }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transactions")
    }

    const data = await response.json()
    return data.transactions
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    throw error
  }
}

/**
 * Get investment holdings
 */
export async function getInvestmentHoldings(accessToken: string): Promise<{
  holdings: PlaidInvestmentHolding[]
  securities: PlaidSecurity[]
}> {
  try {
    const response = await fetch("/api/plaid/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch investment holdings")
    }

    return response.json()
  } catch (error) {
    console.error("[v0] Error fetching investment holdings:", error)
    throw error
  }
}

/**
 * Get item information
 */
export async function getItem(accessToken: string): Promise<PlaidItem> {
  try {
    const response = await fetch("/api/plaid/item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch item")
    }

    const data = await response.json()
    return data.item
  } catch (error) {
    console.error("[v0] Error fetching item:", error)
    throw error
  }
}

/**
 * Remove item (disconnect account)
 */
export async function removeItem(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/plaid/remove-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })

    return response.ok
  } catch (error) {
    console.error("[v0] Error removing item:", error)
    return false
  }
}
