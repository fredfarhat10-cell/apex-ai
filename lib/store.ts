"use client"

import { create } from "zustand"
import { type AppState, type UserProfile, initialAppState } from "./types"
import * as argon2 from "argon2-browser"

interface Store extends AppState {
  isInitialized: boolean
  isLocked: boolean
  vaultExists: boolean
  sessionPassword: string | null
  isTourActive: boolean
  tourStep: number

  checkVault: () => void
  createVault: (profile: UserProfile, password: string) => Promise<void>
  login: (password: string) => Promise<boolean>
  logout: () => void
  updateState: <K extends keyof AppState>(key: K, value: AppState[K]) => void
  nextTourStep: () => void
  endTour: () => void
}

const VAULT_KEY = "apex-vault"

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

let debounceTimer: number | null = null

export const useStore = create<Store>((set, get) => ({
  ...initialAppState,
  isInitialized: false,
  isLocked: true,
  vaultExists: false,
  sessionPassword: null,
  isTourActive: false,
  tourStep: 0,
  aura: "Neutral",

  checkVault: () => {
    const vault = localStorage.getItem(VAULT_KEY)
    set({ vaultExists: !!vault, isLocked: !!vault, isInitialized: true })
  },

  createVault: async (profile, password) => {
    const newState = { ...initialAppState, userProfile: profile }
    const encryptedVault = await encryptState(newState, password)
    localStorage.setItem(VAULT_KEY, encryptedVault)
    set({
      ...newState,
      isLocked: false,
      vaultExists: true,
      sessionPassword: password,
      isInitialized: true,
      isTourActive: true,
      tourStep: 0,
    })
  },

  login: async (password) => {
    const encryptedVault = localStorage.getItem(VAULT_KEY)
    if (!encryptedVault) return false

    const decryptedState = await decryptState(encryptedVault, password)
    if (decryptedState) {
      set({ ...decryptedState, isLocked: false, sessionPassword: password, isInitialized: true, isTourActive: false })
      return true
    }
    return false
  },

  logout: () => {
    set({
      ...initialAppState,
      isLocked: true,
      sessionPassword: null,
      userProfile: null,
      isTourActive: false,
      tourStep: 0,
    })
    get().checkVault()
  },

  updateState: (key, value) => {
    set({ [key]: value })

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = window.setTimeout(async () => {
      const { isInitialized, isLocked, vaultExists, sessionPassword, isTourActive, tourStep, ...stateToSave } = get()
      if (sessionPassword) {
        const cleanState: AppState = {
          userProfile: stateToSave.userProfile,
          strategicGoal: stateToSave.strategicGoal,
          primePath: stateToSave.primePath,
          expenses: stateToSave.expenses,
          reminders: stateToSave.reminders,
          knowledgeItems: stateToSave.knowledgeItems,
          habits: stateToSave.habits,
          habitLogs: stateToSave.habitLogs,
          wardrobe: stateToSave.wardrobe,
          symbiontFeed: stateToSave.symbiontFeed,
          insights: stateToSave.insights,
          appBackground: stateToSave.appBackground,
          aura: stateToSave.aura,
        }
        const encryptedVault = await encryptState(cleanState, sessionPassword)
        localStorage.setItem(VAULT_KEY, encryptedVault)
      }
    }, 1500)
  },

  nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
  endTour: () => set({ isTourActive: false, tourStep: 0 }),
}))
