"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useVault } from "./vault-context"

export type AuthProvider =
  | "google"
  | "apple"
  | "binance"
  | "crypto.com"
  | "kraken"
  | "coinbase"
  | "metamask"
  | "phantom"
  | "trust-wallet"
  | "email"

export interface AuthUser {
  id: string
  email?: string
  name?: string
  avatar?: string
  provider: AuthProvider
  connectedAt: Date
  accessToken?: string
  refreshToken?: string
}

export interface AuthSession {
  user: AuthUser
  expiresAt?: Date
}

interface AuthContextType {
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  signInWithProvider: (provider: AuthProvider) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  connectProvider: (provider: AuthProvider) => Promise<void>
  disconnectProvider: (provider: AuthProvider) => Promise<void>
  getConnectedProviders: () => AuthProvider[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = "apex_auth_session"
const CONNECTED_PROVIDERS_KEY = "apex_connected_providers"

export function AuthProvider({ children }: { children: ReactNode }) {
  const vault = useVault()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectedProviders, setConnectedProviders] = useState<AuthProvider[]>([])

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const storedSession = localStorage.getItem(SESSION_KEY)
    const storedProviders = localStorage.getItem(CONNECTED_PROVIDERS_KEY)

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession)
        // Check if session is expired
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          localStorage.removeItem(SESSION_KEY)
        } else {
          setSession(parsed)
        }
      } catch (error) {
        console.error("[v0] Failed to parse session:", error)
      }
    }

    if (storedProviders) {
      try {
        setConnectedProviders(JSON.parse(storedProviders))
      } catch (error) {
        console.error("[v0] Failed to parse connected providers:", error)
      }
    }

    setIsLoading(false)
  }, [])

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return

    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [session])

  // Save connected providers to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(CONNECTED_PROVIDERS_KEY, JSON.stringify(connectedProviders))
  }, [connectedProviders])

  const signInWithProvider = useCallback(async (provider: AuthProvider) => {
    setIsLoading(true)

    try {
      if (provider === "google") {
        window.location.href = "/api/auth/google"
        return
      }

      if (provider === "apple") {
        // TODO: Implement Apple OAuth
        console.log("[v0] Apple OAuth not yet implemented")
        throw new Error("Apple authentication coming soon")
      }

      if (provider === "binance") {
        // TODO: Implement Binance OAuth
        window.location.href = "/api/auth/binance"
        return
      }

      if (provider === "crypto.com") {
        // TODO: Implement Crypto.com OAuth
        console.log("[v0] Crypto.com OAuth not yet implemented")
        throw new Error("Crypto.com authentication coming soon")
      }

      if (provider === "kraken") {
        // TODO: Implement Kraken OAuth
        console.log("[v0] Kraken OAuth not yet implemented")
        throw new Error("Kraken authentication coming soon")
      }

      if (provider === "coinbase") {
        // TODO: Implement Coinbase OAuth
        window.location.href = "/api/auth/coinbase"
        return
      }

      if (provider === "metamask") {
        if (typeof window.ethereum === "undefined") {
          throw new Error("MetaMask is not installed")
        }

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        const address = accounts[0]

        // Create session with wallet address
        const newSession: AuthSession = {
          user: {
            id: address,
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            provider: "metamask",
            connectedAt: new Date(),
          },
        }

        setSession(newSession)
        setConnectedProviders((prev) => [...new Set([...prev, provider])])
        return
      }

      if (provider === "phantom") {
        if (typeof window.solana === "undefined") {
          throw new Error("Phantom wallet is not installed")
        }

        const response = await window.solana.connect()
        const address = response.publicKey.toString()

        const newSession: AuthSession = {
          user: {
            id: address,
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            provider: "phantom",
            connectedAt: new Date(),
          },
        }

        setSession(newSession)
        setConnectedProviders((prev) => [...new Set([...prev, provider])])
        return
      }

      if (provider === "trust-wallet") {
        // Trust Wallet uses WalletConnect
        // TODO: Implement WalletConnect integration
        console.log("[v0] Trust Wallet connection not yet implemented")
        throw new Error("Trust Wallet connection coming soon")
      }
    } catch (error) {
      console.error(`[v0] ${provider} authentication failed:`, error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        const success = await vault.login(password)

        if (success) {
          const newSession: AuthSession = {
            user: {
              id: vault.userProfile?.id || `user_${Date.now()}`,
              email,
              name: vault.userProfile?.name,
              provider: "email",
              connectedAt: new Date(),
            },
          }

          setSession(newSession)
          setConnectedProviders((prev) => [...new Set([...prev, "email"])])
        } else {
          throw new Error("Invalid email or password")
        }
      } catch (error) {
        console.error("[v0] Email sign in failed:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [vault],
  )

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name?: string) => {
      setIsLoading(true)

      try {
        await vault.createVault(
          {
            id: `user_${Date.now()}`,
            name: name || email.split("@")[0],
            email,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferences: {
              communicationStyle: "professional",
              notificationFrequency: "medium",
              proactivityLevel: "high",
              focusAreas: ["productivity"],
              workingHours: { start: "09:00", end: "17:00" },
              preferredMeetingTimes: [],
              avoidMeetingTimes: [],
            },
            goals: [],
            habits: [],
            personalInfo: {
              interests: [],
              skills: [],
              learningGoals: [],
              challenges: [],
            },
            workStyle: {
              preferredWorkTime: "morning",
              focusSessionDuration: 90,
              breakFrequency: 25,
              multitaskingPreference: "single-task",
              decisionMakingStyle: "analytical",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          password,
          false,
        )

        const newSession: AuthSession = {
          user: {
            id: vault.userProfile?.id || `user_${Date.now()}`,
            email,
            name: name || email.split("@")[0],
            provider: "email",
            connectedAt: new Date(),
          },
        }

        setSession(newSession)
        setConnectedProviders((prev) => [...new Set([...prev, "email"])])
      } catch (error) {
        console.error("[v0] Email sign up failed:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [vault],
  )

  const signOut = useCallback(async () => {
    setIsLoading(true)

    try {
      vault.logout()
      setSession(null)
      setConnectedProviders([])

      // Clear all auth-related localStorage
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(CONNECTED_PROVIDERS_KEY)
    } catch (error) {
      console.error("[v0] Sign out failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [vault])

  const connectProvider = useCallback(
    async (provider: AuthProvider) => {
      await signInWithProvider(provider)
      setConnectedProviders((prev) => [...new Set([...prev, provider])])
    },
    [signInWithProvider],
  )

  const disconnectProvider = useCallback(
    async (provider: AuthProvider) => {
      setConnectedProviders((prev) => prev.filter((p) => p !== provider))

      // If disconnecting the current session provider, sign out
      if (session?.user.provider === provider) {
        await signOut()
      }
    },
    [session, signOut],
  )

  const getConnectedProviders = useCallback(() => {
    return connectedProviders
  }, [connectedProviders])

  const value: AuthContextType = {
    session,
    isAuthenticated: !!session,
    isLoading,
    signInWithProvider,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    connectProvider,
    disconnectProvider,
    getConnectedProviders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Type declarations for Web3 wallets
declare global {
  interface Window {
    ethereum?: any
    solana?: any
  }
}
