/**
 * Secure vault storage with automatic encryption
 * Handles localStorage persistence with encryption
 */

import { encryptData, decryptData } from "./encryption"
import type { AppState } from "./types"

const VAULT_KEY = "apex-vault-v2"
const VAULT_METADATA_KEY = "apex-vault-metadata"

export interface VaultMetadata {
  version: string
  createdAt: string
  lastModified: string
  encryptionAlgorithm: string
}

/**
 * Saves encrypted vault to localStorage
 */
export async function saveVault(state: AppState, password: string): Promise<void> {
  try {
    const { encrypted } = await encryptData(state, password)

    const metadata: VaultMetadata = {
      version: "2.0",
      createdAt: localStorage.getItem(VAULT_METADATA_KEY)
        ? JSON.parse(localStorage.getItem(VAULT_METADATA_KEY)!).createdAt
        : new Date().toISOString(),
      lastModified: new Date().toISOString(),
      encryptionAlgorithm: "AES-GCM-256",
    }

    localStorage.setItem(VAULT_KEY, encrypted)
    localStorage.setItem(VAULT_METADATA_KEY, JSON.stringify(metadata))
  } catch (error) {
    console.error("[v0] Failed to save vault:", error)
    throw new Error("Failed to save vault")
  }
}

/**
 * Loads and decrypts vault from localStorage
 */
export async function loadVault(password: string): Promise<AppState | null> {
  try {
    const encrypted = localStorage.getItem(VAULT_KEY)
    if (!encrypted) {
      return null
    }

    const { data, error } = await decryptData<AppState>(encrypted, password)

    if (error || !data) {
      console.error("[v0] Failed to load vault:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Failed to load vault:", error)
    return null
  }
}

/**
 * Checks if a vault exists
 */
export function vaultExists(): boolean {
  return !!localStorage.getItem(VAULT_KEY)
}

/**
 * Gets vault metadata without decrypting
 */
export function getVaultMetadata(): VaultMetadata | null {
  try {
    const metadata = localStorage.getItem(VAULT_METADATA_KEY)
    return metadata ? JSON.parse(metadata) : null
  } catch {
    return null
  }
}

/**
 * Deletes vault (use with caution!)
 */
export function deleteVault(): void {
  localStorage.removeItem(VAULT_KEY)
  localStorage.removeItem(VAULT_METADATA_KEY)
}

/**
 * Exports vault as encrypted backup
 */
export async function exportVault(password: string): Promise<string> {
  const encrypted = localStorage.getItem(VAULT_KEY)
  const metadata = localStorage.getItem(VAULT_METADATA_KEY)

  if (!encrypted || !metadata) {
    throw new Error("No vault found to export")
  }

  const backup = {
    vault: encrypted,
    metadata: JSON.parse(metadata),
    exportedAt: new Date().toISOString(),
  }

  return JSON.stringify(backup, null, 2)
}

/**
 * Imports vault from encrypted backup
 */
export async function importVault(backupString: string, password: string): Promise<boolean> {
  try {
    const backup = JSON.parse(backupString)

    // Verify it's a valid backup
    if (!backup.vault || !backup.metadata) {
      throw new Error("Invalid backup format")
    }

    // Test decryption before importing
    const { data, error } = await decryptData<AppState>(backup.vault, password)
    if (error || !data) {
      throw new Error("Failed to decrypt backup - incorrect password")
    }

    // Import vault
    localStorage.setItem(VAULT_KEY, backup.vault)
    localStorage.setItem(VAULT_METADATA_KEY, JSON.stringify(backup.metadata))

    return true
  } catch (error) {
    console.error("[v0] Failed to import vault:", error)
    return false
  }
}
