import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "apex-tokens"
const STORE_NAME = "tokens"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize the token storage database
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "integrationId" })
        store.createIndex("provider", "provider")
        store.createIndex("expiresAt", "tokens.expiresAt")
      }
    },
  })

  return dbInstance
}

/**
 * Simple encryption for tokens (in production, use a more robust solution)
 */
function encryptToken(token: string): string {
  // In production, use Web Crypto API or a proper encryption library
  return btoa(token)
}

/**
 * Simple decryption for tokens
 */
function decryptToken(encrypted: string): string {
  return atob(encrypted)
}

/**
 * Store OAuth tokens securely
 */
export async function storeTokens(
  integrationId: string,
  provider: string,
  tokens: {
    accessToken: string
    refreshToken?: string
    expiresIn?: number
    tokenType?: string
    scope?: string
  },
): Promise<void> {
  const db = await getDB()

  const encryptedTokens = {
    accessToken: encryptToken(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encryptToken(tokens.refreshToken) : undefined,
    expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined,
    tokenType: tokens.tokenType || "Bearer",
    scope: tokens.scope,
  }

  await db.put(STORE_NAME, {
    integrationId,
    provider,
    tokens: encryptedTokens,
    storedAt: Date.now(),
  })

  console.log("[v0] Stored tokens for integration:", integrationId)
}

/**
 * Retrieve OAuth tokens
 */
export async function getTokens(integrationId: string): Promise<{
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  tokenType?: string
  scope?: string
} | null> {
  const db = await getDB()
  const record = await db.get(STORE_NAME, integrationId)

  if (!record) return null

  return {
    accessToken: decryptToken(record.tokens.accessToken),
    refreshToken: record.tokens.refreshToken ? decryptToken(record.tokens.refreshToken) : undefined,
    expiresAt: record.tokens.expiresAt,
    tokenType: record.tokens.tokenType,
    scope: record.tokens.scope,
  }
}

/**
 * Check if token is expired
 */
export async function isTokenExpired(integrationId: string): Promise<boolean> {
  const tokens = await getTokens(integrationId)
  if (!tokens || !tokens.expiresAt) return false

  return Date.now() >= tokens.expiresAt
}

/**
 * Delete tokens
 */
export async function deleteTokens(integrationId: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, integrationId)
  console.log("[v0] Deleted tokens for integration:", integrationId)
}

/**
 * Get all stored integrations
 */
export async function getAllStoredIntegrations(): Promise<string[]> {
  const db = await getDB()
  const keys = await db.getAllKeys(STORE_NAME)
  return keys as string[]
}

/**
 * Clear all tokens
 */
export async function clearAllTokens(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
  console.log("[v0] Cleared all tokens")
}
