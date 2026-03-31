export type IntegrationType = "calendar" | "bank" | "health" | "fitness" | "productivity" | "social" | "storage"

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending"

export interface Integration {
  id: string
  type: IntegrationType
  provider: string
  name: string
  description: string
  icon?: string
  status: IntegrationStatus
  connectedAt?: string
  lastSyncedAt?: string
  metadata?: Record<string, any>
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  tokenType?: string
  scope?: string
}

export interface StoredIntegration extends Integration {
  tokens?: OAuthTokens
  config?: Record<string, any>
}

export interface IntegrationProvider {
  id: string
  name: string
  type: IntegrationType
  description: string
  icon?: string
  authUrl: string
  tokenUrl: string
  scope: string
  clientId?: string
  requiresSetup: boolean
  features: string[]
}

export interface IntegrationStats {
  totalConnected: number
  byType: Record<IntegrationType, number>
  lastSynced?: string
  syncErrors: number
}
