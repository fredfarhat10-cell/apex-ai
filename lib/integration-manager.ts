import { openDB, type IDBPDatabase } from "idb"
import type { Integration, IntegrationProvider, IntegrationType, IntegrationStats } from "./types/integration"
import { storeTokens, getTokens, deleteTokens, isTokenExpired } from "./token-storage"
import { calendarProviders } from "./calendar-oauth"
import { BANK_PROVIDERS } from "./bank-oauth"

const DB_NAME = "apex-integrations"
const STORE_NAME = "integrations"
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize the integrations database
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("type", "type")
        store.createIndex("provider", "provider")
        store.createIndex("status", "status")
      }
    },
  })

  return dbInstance
}

/**
 * Registry of all available integration providers
 */
export const INTEGRATION_PROVIDERS: Record<string, IntegrationProvider> = {
  // Calendar providers
  google_calendar: {
    id: "google_calendar",
    name: "Google Calendar",
    type: "calendar",
    description: "Sync your Google Calendar events",
    authUrl: calendarProviders.google.config.authUrl,
    tokenUrl: calendarProviders.google.config.tokenUrl,
    scope: calendarProviders.google.config.scope,
    clientId: calendarProviders.google.config.clientId,
    requiresSetup: true,
    features: ["Read events", "Create events", "Update events"],
  },
  microsoft_calendar: {
    id: "microsoft_calendar",
    name: "Microsoft Outlook",
    type: "calendar",
    description: "Sync your Outlook calendar",
    authUrl: calendarProviders.microsoft.config.authUrl,
    tokenUrl: calendarProviders.microsoft.config.tokenUrl,
    scope: calendarProviders.microsoft.config.scope,
    clientId: calendarProviders.microsoft.config.clientId,
    requiresSetup: true,
    features: ["Read events", "Create events", "Update events"],
  },
  // Bank providers
  plaid: {
    id: "plaid",
    name: "Plaid",
    type: "bank",
    description: "Connect multiple bank accounts",
    authUrl: BANK_PROVIDERS.plaid.authUrl,
    tokenUrl: BANK_PROVIDERS.plaid.tokenUrl,
    scope: BANK_PROVIDERS.plaid.scope,
    requiresSetup: true,
    features: ["Account balance", "Transactions", "Investments"],
  },
  // Health providers
  apple_health: {
    id: "apple_health",
    name: "Apple Health",
    type: "health",
    description: "Sync health data from Apple Health",
    authUrl: "https://developer.apple.com/health",
    tokenUrl: "",
    scope: "health.read",
    requiresSetup: true,
    features: ["Steps", "Heart rate", "Sleep", "Workouts"],
  },
  google_fit: {
    id: "google_fit",
    name: "Google Fit",
    type: "fitness",
    description: "Track fitness activities",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/fitness.activity.read",
    requiresSetup: true,
    features: ["Activities", "Steps", "Calories"],
  },
  strava: {
    id: "strava",
    name: "Strava",
    type: "fitness",
    description: "Connect your Strava activities",
    authUrl: "https://www.strava.com/oauth/authorize",
    tokenUrl: "https://www.strava.com/oauth/token",
    scope: "activity:read_all",
    requiresSetup: true,
    features: ["Activities", "Routes", "Stats"],
  },
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): IntegrationProvider[] {
  return Object.values(INTEGRATION_PROVIDERS)
}

/**
 * Get providers by type
 */
export function getProvidersByType(type: IntegrationType): IntegrationProvider[] {
  return Object.values(INTEGRATION_PROVIDERS).filter((p) => p.type === type)
}

/**
 * Connect a new integration
 */
export async function connectIntegration(
  provider: string,
  tokens: {
    accessToken: string
    refreshToken?: string
    expiresIn?: number
  },
  metadata?: Record<string, any>,
): Promise<Integration> {
  const db = await getDB()
  const providerConfig = INTEGRATION_PROVIDERS[provider]

  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const integration: Integration = {
    id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: providerConfig.type,
    provider,
    name: providerConfig.name,
    description: providerConfig.description,
    icon: providerConfig.icon,
    status: "connected",
    connectedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    metadata,
  }

  // Store integration
  await db.put(STORE_NAME, integration)

  // Store tokens securely
  await storeTokens(integration.id, provider, tokens)

  console.log("[v0] Connected integration:", integration.id)

  return integration
}

/**
 * Disconnect an integration
 */
export async function disconnectIntegration(integrationId: string): Promise<void> {
  const db = await getDB()

  // Delete tokens
  await deleteTokens(integrationId)

  // Update integration status
  const integration = await db.get(STORE_NAME, integrationId)
  if (integration) {
    integration.status = "disconnected"
    await db.put(STORE_NAME, integration)
  }

  console.log("[v0] Disconnected integration:", integrationId)
}

/**
 * Get all integrations
 */
export async function getAllIntegrations(): Promise<Integration[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

/**
 * Get integrations by type
 */
export async function getIntegrationsByType(type: IntegrationType): Promise<Integration[]> {
  const db = await getDB()
  const index = db.transaction(STORE_NAME).store.index("type")
  return index.getAll(type)
}

/**
 * Get integration by ID
 */
export async function getIntegration(integrationId: string): Promise<Integration | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, integrationId)
}

/**
 * Update integration sync time
 */
export async function updateSyncTime(integrationId: string): Promise<void> {
  const db = await getDB()
  const integration = await db.get(STORE_NAME, integrationId)

  if (integration) {
    integration.lastSyncedAt = new Date().toISOString()
    await db.put(STORE_NAME, integration)
  }
}

/**
 * Get integration statistics
 */
export async function getIntegrationStats(): Promise<IntegrationStats> {
  const integrations = await getAllIntegrations()

  const byType: Record<IntegrationType, number> = {
    calendar: 0,
    bank: 0,
    health: 0,
    fitness: 0,
    productivity: 0,
    social: 0,
    storage: 0,
  }

  let lastSynced: string | undefined
  let syncErrors = 0

  integrations.forEach((integration) => {
    if (integration.status === "connected") {
      byType[integration.type]++

      if (!lastSynced || (integration.lastSyncedAt && integration.lastSyncedAt > lastSynced)) {
        lastSynced = integration.lastSyncedAt
      }
    }

    if (integration.status === "error") {
      syncErrors++
    }
  })

  return {
    totalConnected: integrations.filter((i) => i.status === "connected").length,
    byType,
    lastSynced,
    syncErrors,
  }
}

/**
 * Refresh integration tokens if expired
 */
export async function refreshIntegrationTokens(integrationId: string): Promise<boolean> {
  const expired = await isTokenExpired(integrationId)
  if (!expired) return true

  const integration = await getIntegration(integrationId)
  if (!integration) return false

  const tokens = await getTokens(integrationId)
  if (!tokens || !tokens.refreshToken) return false

  try {
    // Call the provider's token refresh endpoint
    const providerConfig = INTEGRATION_PROVIDERS[integration.provider]
    if (!providerConfig) return false

    // In production, make actual API call to refresh token
    // For now, simulate successful refresh
    const newTokens = {
      accessToken: `refreshed_${tokens.accessToken}`,
      refreshToken: tokens.refreshToken,
      expiresIn: 3600,
    }

    await storeTokens(integrationId, integration.provider, newTokens)
    console.log("[v0] Refreshed tokens for integration:", integrationId)

    return true
  } catch (error) {
    console.error("[v0] Failed to refresh tokens:", error)
    return false
  }
}
