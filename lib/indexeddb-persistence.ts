/**
 * IndexedDB Persistence Layer
 * Provides robust, reliable local storage that survives refreshes and OS restarts
 * Uses idb wrapper for clean async/await API
 */

import { openDB, type IDBPDatabase } from "idb"
import { encryptData, decryptData } from "./encryption"

const DB_NAME = "apex-vault-db"
const DB_VERSION = 1
const VAULT_STORE = "vault"
const METADATA_STORE = "metadata"

export interface VaultMetadata {
  lastSaved: string
  lastModified: string
  version: number
  size: number
}

export interface SaveStatus {
  status: "idle" | "saving" | "saved" | "error"
  message?: string
  lastSaved?: Date
}

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize IndexedDB database
 */
async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create vault store for encrypted data
        if (!db.objectStoreNames.contains(VAULT_STORE)) {
          db.createObjectStore(VAULT_STORE)
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE)
        }
      },
    })

    console.log("[v0] IndexedDB initialized successfully")
    return dbInstance
  } catch (error) {
    console.error("[v0] Failed to initialize IndexedDB:", error)
    throw new Error("Failed to initialize database")
  }
}

/**
 * Save encrypted vault data to IndexedDB with retry logic
 */
export async function saveVault<T>(
  data: T,
  password: string,
  retries = 3,
): Promise<{ success: boolean; error?: string }> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[v0] Saving vault (attempt ${attempt}/${retries})...`)

      // Encrypt data
      const { encrypted } = await encryptData(data, password)

      // Initialize DB
      const db = await initDB()

      // Save encrypted data
      await db.put(VAULT_STORE, encrypted, "current")

      // Save metadata
      const metadata: VaultMetadata = {
        lastSaved: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        size: new Blob([encrypted]).size,
      }
      await db.put(METADATA_STORE, metadata, "current")

      console.log("[v0] Vault saved successfully")
      return { success: true }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error")
      console.error(`[v0] Save attempt ${attempt} failed:`, error)

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Failed to save vault after multiple attempts",
  }
}

/**
 * Load and decrypt vault data from IndexedDB
 */
export async function loadVault<T>(password: string): Promise<{ data: T | null; error?: string }> {
  try {
    console.log("[v0] Loading vault from IndexedDB...")

    const db = await initDB()
    const encrypted = await db.get(VAULT_STORE, "current")

    if (!encrypted) {
      return { data: null, error: "No vault found" }
    }

    // Decrypt data
    const result = await decryptData<T>(encrypted, password)

    if (result.error) {
      return { data: null, error: result.error }
    }

    console.log("[v0] Vault loaded successfully")
    return { data: result.data }
  } catch (error) {
    console.error("[v0] Failed to load vault:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to load vault",
    }
  }
}

/**
 * Check if vault exists in IndexedDB
 */
export async function vaultExists(): Promise<boolean> {
  try {
    const db = await initDB()
    const encrypted = await db.get(VAULT_STORE, "current")
    return !!encrypted
  } catch (error) {
    console.error("[v0] Failed to check vault existence:", error)
    return false
  }
}

/**
 * Get vault metadata
 */
export async function getVaultMetadata(): Promise<VaultMetadata | null> {
  try {
    const db = await initDB()
    const metadata = await db.get(METADATA_STORE, "current")
    return metadata || null
  } catch (error) {
    console.error("[v0] Failed to get vault metadata:", error)
    return null
  }
}

/**
 * Delete vault from IndexedDB
 */
export async function deleteVault(): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await initDB()
    await db.delete(VAULT_STORE, "current")
    await db.delete(METADATA_STORE, "current")
    console.log("[v0] Vault deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to delete vault:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete vault",
    }
  }
}

/**
 * Export vault as encrypted file
 */
export async function exportVault(): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    const db = await initDB()
    const encrypted = await db.get(VAULT_STORE, "current")
    const metadata = await db.get(METADATA_STORE, "current")

    if (!encrypted) {
      return { success: false, error: "No vault to export" }
    }

    const exportData = {
      vault: encrypted,
      metadata: metadata || {},
      exportedAt: new Date().toISOString(),
      version: 1,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })

    console.log("[v0] Vault exported successfully")
    return { success: true, blob }
  } catch (error) {
    console.error("[v0] Failed to export vault:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export vault",
    }
  }
}

/**
 * Import vault from encrypted file
 */
export async function importVault(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text()
    const importData = JSON.parse(text)

    if (!importData.vault) {
      return { success: false, error: "Invalid vault file" }
    }

    const db = await initDB()
    await db.put(VAULT_STORE, importData.vault, "current")

    if (importData.metadata) {
      await db.put(METADATA_STORE, importData.metadata, "current")
    }

    console.log("[v0] Vault imported successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to import vault:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import vault",
    }
  }
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const VAULT_KEY = "apex-vault"
    const encrypted = localStorage.getItem(VAULT_KEY)

    if (!encrypted) {
      return { success: false, error: "No localStorage vault found" }
    }

    // Save to IndexedDB
    const db = await initDB()
    await db.put(VAULT_STORE, encrypted, "current")

    // Create metadata
    const metadata: VaultMetadata = {
      lastSaved: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1,
      size: new Blob([encrypted]).size,
    }
    await db.put(METADATA_STORE, metadata, "current")

    // Remove from localStorage
    localStorage.removeItem(VAULT_KEY)

    console.log("[v0] Successfully migrated from localStorage to IndexedDB")
    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to migrate from localStorage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Migration failed",
    }
  }
}
