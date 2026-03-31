"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { type AppState, type UserProfile, initialAppState } from "./types"
import { saveVault, loadVault, vaultExists, migrateFromLocalStorage } from "./indexeddb-persistence"
import type { SaveStatus } from "@/components/save-status-indicator"
import * as argon2 from "argon2-browser"

interface VaultContextType extends AppState {
  isInitialized: boolean
  isLocked: boolean
  vaultExists: boolean
  sessionPassword: string | null
  isTourActive: boolean
  tourStep: number
  saveStatus: SaveStatus
  saveError?: string
  lastSaved?: Date
  isDemoMode: boolean
  checkVault: () => void
  createVault: (profile: UserProfile, password: string, includeSampleData?: boolean) => Promise<void>
  login: (password: string) => Promise<boolean>
  logout: () => void
  updateState: <K extends keyof AppState>(key: K, value: AppState[K]) => void
  nextTourStep: () => void
  endTour: () => void
  enterDemoMode: () => void
  exitDemoMode: () => void
  convertDemoToVault: (password: string) => Promise<void>
}

const VaultContext = createContext<VaultContextType | undefined>(undefined)

async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const hash = await argon2.hash({
    pass: password,
    salt: salt,
    time: 1,
    mem: 65536,
    hashLen: 32,
    parallelism: 4,
    type: argon2.ArgonType.Argon2id,
  })

  return await crypto.subtle.importKey("raw", hash.hash, { name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ])
}

async function encryptState(state: AppState, password: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const key = await getKey(password, salt)
  const encodedState = new TextEncoder().encode(JSON.stringify(state))

  const encryptedContent = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encodedState)

  const encryptedPackage = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength)
  encryptedPackage.set(salt, 0)
  encryptedPackage.set(iv, salt.length)
  encryptedPackage.set(new Uint8Array(encryptedContent), salt.length + iv.length)

  return btoa(String.fromCharCode.apply(null, Array.from(encryptedPackage)))
}

async function decryptState(encryptedString: string, password: string): Promise<AppState | null> {
  try {
    const encryptedPackage = new Uint8Array(
      atob(encryptedString)
        .split("")
        .map((c) => c.charCodeAt(0)),
    )
    const salt = encryptedPackage.slice(0, 16)
    const iv = encryptedPackage.slice(16, 28)
    const encryptedContent = encryptedPackage.slice(28)

    const key = await getKey(password, salt)

    const decryptedContent = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encryptedContent)

    const parsedState = JSON.parse(new TextDecoder().decode(decryptedContent)) as AppState
    if (!parsedState.aura) {
      parsedState.aura = "Neutral"
    }
    return parsedState
  } catch (error) {
    console.error("Decryption failed:", error)
    return null
  }
}

const sampleData: Partial<AppState> = {
  expenses: [
    {
      id: "sample-1",
      description: "Morning coffee",
      amount: 5.5,
      category: "Food",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "sample-2",
      description: "Gym membership",
      amount: 50,
      category: "Health",
      date: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "sample-3",
      description: "Book purchase",
      amount: 25,
      category: "Education",
      date: new Date(Date.now() - 259200000).toISOString(),
    },
  ],
  habits: [
    {
      id: "habit-1",
      name: "Morning Exercise",
      goal: "Exercise for 30 minutes every morning",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: "habit-2",
      name: "Read Daily",
      goal: "Read for 20 minutes before bed",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
  ],
  habitLogs: [
    {
      id: "log-1",
      habitId: "habit-1",
      date: new Date().toISOString().split("T")[0],
      completed: true,
    },
    {
      id: "log-2",
      habitId: "habit-2",
      date: new Date().toISOString().split("T")[0],
      completed: false,
    },
  ],
  goals: [
    {
      id: "goal-1",
      title: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 3500,
      deadline: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
    },
  ],
  strategicGoal: "Build healthy habits and improve financial awareness",
  aura: "Energized",
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialAppState)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLocked, setIsLocked] = useState(true)
  const [vaultExistsState, setVaultExistsState] = useState(false)
  const [sessionPassword, setSessionPassword] = useState<string | null>(null)
  const [isTourActive, setIsTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const checkVault = useCallback(async () => {
    const exists = await vaultExists()

    if (!exists) {
      const VAULT_KEY = "apex-vault"
      const hasLocalStorage = localStorage.getItem(VAULT_KEY)
      if (hasLocalStorage && sessionPassword) {
        console.log("[v0] Migrating from localStorage to IndexedDB...")
        await migrateFromLocalStorage(sessionPassword)
      }
    }

    setVaultExistsState(exists)
    setIsLocked(exists)
    setIsInitialized(true)
  }, [sessionPassword])

  const createVault = useCallback(async (profile: UserProfile, password: string, includeSampleData = false) => {
    const newState = includeSampleData
      ? { ...initialAppState, ...sampleData, userProfile: profile }
      : { ...initialAppState, userProfile: profile }

    setSaveStatus("saving")
    const result = await saveVault(newState, password)

    if (result.success) {
      setState(newState)
      setIsLocked(false)
      setVaultExistsState(true)
      setSessionPassword(password)
      setIsInitialized(true)
      setIsTourActive(true)
      setTourStep(0)
      setSaveStatus("saved")
      setLastSaved(new Date())
    } else {
      setSaveStatus("error")
      setSaveError(result.error)
      throw new Error(result.error || "Failed to create vault")
    }
  }, [])

  const login = useCallback(async (password: string): Promise<boolean> => {
    const result = await loadVault<AppState>(password)

    if (result.data) {
      setState(result.data)
      setIsLocked(false)
      setSessionPassword(password)
      setIsInitialized(true)
      setIsTourActive(false)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setState(initialAppState)
    setIsLocked(true)
    setSessionPassword(null)
    setIsTourActive(false)
    setTourStep(0)
    setSaveStatus("idle")
    setSaveError(undefined)
    setLastSaved(undefined)
    checkVault()
  }, [checkVault])

  const updateState = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const nextTourStep = useCallback(() => {
    setTourStep((prev) => prev + 1)
  }, [])

  const endTour = useCallback(() => {
    setIsTourActive(false)
    setTourStep(0)
  }, [])

  const enterDemoMode = useCallback(() => {
    const demoState = { ...initialAppState, ...sampleData }
    setState(demoState)
    setIsDemoMode(true)
    setIsLocked(false)
    setIsInitialized(true)
    setIsTourActive(true)
    setTourStep(0)
  }, [])

  const exitDemoMode = useCallback(() => {
    setState(initialAppState)
    setIsDemoMode(false)
    setIsLocked(true)
    setIsTourActive(false)
    setTourStep(0)
    checkVault()
  }, [checkVault])

  const convertDemoToVault = useCallback(
    async (password: string) => {
      if (!isDemoMode) return

      setSaveStatus("saving")
      const result = await saveVault(state, password)

      if (result.success) {
        setIsDemoMode(false)
        setIsLocked(false)
        setVaultExistsState(true)
        setSessionPassword(password)
        setSaveStatus("saved")
        setLastSaved(new Date())
      } else {
        setSaveStatus("error")
        setSaveError(result.error)
        throw new Error(result.error || "Failed to convert demo to vault")
      }
    },
    [isDemoMode, state],
  )

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [saveError, setSaveError] = useState<string | undefined>()
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!sessionPassword || isDemoMode) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving")
      const result = await saveVault(state, sessionPassword)

      if (result.success) {
        setSaveStatus("saved")
        setLastSaved(new Date())
        setSaveError(undefined)
      } else {
        setSaveStatus("error")
        setSaveError(result.error)
      }
    }, 600)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state, sessionPassword, isDemoMode])

  const value: VaultContextType = {
    ...state,
    isInitialized,
    isLocked,
    vaultExists: vaultExistsState,
    sessionPassword,
    isTourActive,
    tourStep,
    saveStatus,
    saveError,
    lastSaved,
    isDemoMode,
    checkVault,
    createVault,
    login,
    logout,
    updateState,
    nextTourStep,
    endTour,
    enterDemoMode,
    exitDemoMode,
    convertDemoToVault,
  }

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}

export function useVault() {
  const context = useContext(VaultContext)
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider")
  }
  return context
}
